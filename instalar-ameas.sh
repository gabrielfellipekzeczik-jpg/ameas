#!/usr/bin/env bash
set -Eeuo pipefail

# Instalador de uma etapa para AMEAS: npm + Supabase + Vercel.
# Segredos são usados apenas em memória e não são gravados no Git.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

red='\033[0;31m'; green='\033[0;32m'; yellow='\033[1;33m'; reset='\033[0m'
info() { printf "${green}%s${reset}\n" "$1"; }
warn() { printf "${yellow}%s${reset}\n" "$1"; }
die() { printf "${red}%s${reset}\n" "$1" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node.js não encontrado. Instale Node 20+ e rode novamente."
command -v npm >/dev/null 2>&1 || die "npm não encontrado."

printf "\nAMEAS — instalação e publicação\n\n"
info "1/5 Instalando dependências..."
npm install --no-audit --no-fund

printf "\n"
read -r -p "URL do projeto Supabase (https://....supabase.co): " SUPABASE_URL
read -r -p "Chave pública anon do Supabase: " SUPABASE_ANON_KEY
[ -n "$SUPABASE_URL" ] || die "A URL do Supabase é obrigatória."
[ -n "$SUPABASE_ANON_KEY" ] || die "A chave anon é obrigatória."

cat > .env.local <<EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
chmod 600 .env.local

info "2/5 Criando o arquivo de migração exclusivo da AMEAS..."
mkdir -p supabase/migrations
cp supabase/schema.sql supabase/migrations/20260922163000_ameas_setup.sql

printf "\n"
read -r -p "Token de acesso do Supabase (Enter se já estiver logado no CLI): " SUPABASE_ACCESS_TOKEN
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
  export SUPABASE_ACCESS_TOKEN
fi
read -r -p "ID do projeto Supabase (Project Reference ID): " SUPABASE_PROJECT_REF
[ -n "$SUPABASE_PROJECT_REF" ] || die "O Project Reference ID é obrigatório para aplicar o banco."

info "3/5 Aplicando tabelas, RLS e Storage no Supabase..."
npx --yes supabase link --project-ref "$SUPABASE_PROJECT_REF"
npx --yes supabase db push --yes

printf "\n"
warn "Para ativar o acesso administrativo, crie o usuário no Supabase Auth."
read -r -p "E-mail do admin (Enter para pular esta etapa): " ADMIN_EMAIL
if [ -n "$ADMIN_EMAIL" ]; then
  read -r -s -p "Senha do admin: " ADMIN_PASSWORD
  printf "\n"
  read -r -p "Service Role Key do Supabase (usada somente nesta execução): " SUPABASE_SERVICE_ROLE_KEY
  [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] || die "A Service Role Key é necessária para criar o admin automaticamente."

  AUTH_RESPONSE="$(curl -fsS -X POST "$SUPABASE_URL/auth/v1/admin/users" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    --data "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"email_confirm\":true}")" || die "Não foi possível criar o usuário admin. Verifique a Service Role Key."
  ADMIN_ID="$(printf '%s' "$AUTH_RESPONSE" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4)"
  [ -n "$ADMIN_ID" ] || die "O Supabase não retornou o ID do usuário admin."
  curl -fsS -X POST "$SUPABASE_URL/rest/v1/ameas_admin_users" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    --data "{\"user_id\":\"$ADMIN_ID\"}" >/dev/null || die "Usuário criado, mas não foi possível liberá-lo como admin."
  unset SUPABASE_SERVICE_ROLE_KEY ADMIN_PASSWORD AUTH_RESPONSE
  info "Usuário admin criado e liberado."
else
  warn "Etapa de admin pulada. Faça isso depois no Supabase: insert into public.ameas_admin_users (user_id) values ('UUID');"
fi

info "4/6 Validando o build..."
npm run build >/dev/null

printf "\n"
command -v git >/dev/null 2>&1 || die "Git não encontrado. Instale o Git e rode novamente."
read -r -p "URL do repositório GitHub (https://github.com/usuario/ameas.git): " GITHUB_REPO_URL
[ -n "$GITHUB_REPO_URL" ] || die "A URL do repositório GitHub é obrigatória."
git init -q
git branch -M main
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$GITHUB_REPO_URL"
else
  git remote add origin "$GITHUB_REPO_URL"
fi
git add .
if ! git diff --cached --quiet; then
  git commit -m "feat: publicar site AMEAS com painel administrativo" >/dev/null
fi
info "5/6 Enviando o projeto para o GitHub..."
git push -u origin main

printf "\n"
read -r -p "Publicar agora na Vercel? [S/n]: " PUBLISH
PUBLISH="${PUBLISH:-S}"
if [[ "$PUBLISH" =~ ^[SsYy]$ ]]; then
  read -r -p "Token da Vercel (Enter para login interativo): " VERCEL_TOKEN
  VERCEL_ARGS=()
  [ -n "$VERCEL_TOKEN" ] && VERCEL_ARGS+=(--token "$VERCEL_TOKEN")
  info "6/6 Publicando na Vercel..."
  npx --yes vercel link --yes "${VERCEL_ARGS[@]}"
  # Variáveis VITE_ precisam existir na Vercel antes do build de produção.
  printf '%s' "$SUPABASE_URL" | npx --yes vercel env add VITE_SUPABASE_URL production "${VERCEL_ARGS[@]}" >/dev/null || true
  printf '%s' "$SUPABASE_ANON_KEY" | npx --yes vercel env add VITE_SUPABASE_ANON_KEY production "${VERCEL_ARGS[@]}" >/dev/null || true
  npx --yes vercel --prod --yes "${VERCEL_ARGS[@]}"
else
  info "Publicação pulada. O projeto está instalado e pronto para npm run dev."
fi

printf "\n"
info "Concluído. Painel administrativo: /admin"
info "As tabelas da AMEAS usam prefixo ameas_ e o bucket ameas-site-media."
