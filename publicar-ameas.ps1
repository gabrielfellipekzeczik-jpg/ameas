$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Stop-Erro($mensagem) {
  Write-Host "`nERRO: $mensagem" -ForegroundColor Red
  Read-Host "Pressione Enter para fechar"
  exit 1
}
function Titulo($mensagem) { Write-Host "`n=== $mensagem ===" -ForegroundColor Cyan }
function SecureText($mensagem) {
  $secure = Read-Host $mensagem -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}
function Testar-Comando($nome, $instalacao) {
  if (-not (Get-Command $nome -ErrorAction SilentlyContinue)) {
    Stop-Erro "$nome não foi encontrado. $instalacao"
  }
}

Clear-Host
Write-Host 'AMEAS - PUBLICAR TUDO' -ForegroundColor Green
Write-Host 'Este assistente publica GitHub + Supabase + Vercel.'
Write-Host "Pasta atual: $PSScriptRoot"

Testar-Comando 'node' 'Instale Node.js LTS em https://nodejs.org.'
Testar-Comando 'npm' 'Instale Node.js LTS em https://nodejs.org.'
Testar-Comando 'git' 'Instale Git em https://git-scm.com/download/win.'
if (-not (Test-Path 'package.json')) { Stop-Erro 'package.json não está nesta pasta. Coloque este arquivo na pasta raiz do projeto AMEAS.' }

Titulo '1/5 - Dados do Supabase'
$supabaseUrl = Read-Host 'URL do Supabase (ex.: https://abc.supabase.co)'
$supabaseAnon = Read-Host 'Chave pública anon do Supabase'
$projectRef = Read-Host 'Project Reference ID do Supabase (ex.: abcdefghijklmnop)'
if ([string]::IsNullOrWhiteSpace($supabaseUrl) -or [string]::IsNullOrWhiteSpace($supabaseAnon) -or [string]::IsNullOrWhiteSpace($projectRef)) { Stop-Erro 'URL, chave anon e Project Reference ID são obrigatórios.' }

@"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseAnon
"@ | Set-Content -Path '.env.local' -Encoding utf8

Titulo '2/5 - Instalar e configurar banco'
npm install --no-audit --no-fund
New-Item -ItemType Directory -Force -Path 'supabase\migrations' | Out-Null
Copy-Item 'supabase\schema.sql' 'supabase\migrations\20260922163000_ameas_setup.sql' -Force
$supabaseToken = Read-Host 'Token Supabase CLI (Enter se já estiver logado)'
if (-not [string]::IsNullOrWhiteSpace($supabaseToken)) { $env:SUPABASE_ACCESS_TOKEN = $supabaseToken }
npx --yes supabase link --project-ref $projectRef
npx --yes supabase db push --yes

Titulo '3/5 - Criar administrador'
$adminEmail = Read-Host 'E-mail do administrador (Enter para pular)'
if (-not [string]::IsNullOrWhiteSpace($adminEmail)) {
  $adminPassword = SecureText 'Senha do administrador'
  $serviceRole = Read-Host 'Service Role Key do Supabase (não será salva)'
  if ([string]::IsNullOrWhiteSpace($serviceRole)) { Stop-Erro 'A Service Role Key é necessária para criar o administrador.' }
  $headers = @{ apikey = $serviceRole; Authorization = "Bearer $serviceRole" }
  $body = @{ email = $adminEmail; password = $adminPassword; email_confirm = $true } | ConvertTo-Json
  $user = Invoke-RestMethod -Method Post -Uri "$supabaseUrl/auth/v1/admin/users" -Headers $headers -ContentType 'application/json' -Body $body
  $adminBody = @{ user_id = $user.id } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$supabaseUrl/rest/v1/ameas_admin_users" -Headers ($headers + @{ Prefer = 'resolution=merge-duplicates' }) -ContentType 'application/json' -Body $adminBody | Out-Null
  Remove-Variable serviceRole, adminPassword, headers, body -ErrorAction SilentlyContinue
  Write-Host 'Administrador criado.' -ForegroundColor Green
}

Titulo '4/5 - Validar e enviar para o GitHub'
npm run build
$githubUrl = Read-Host 'URL do repositório GitHub (ex.: https://github.com/usuario/ameas.git)'
if ([string]::IsNullOrWhiteSpace($githubUrl)) { Stop-Erro 'A URL do GitHub é obrigatória.' }
git init -q
git branch -M main
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) { git remote set-url origin $githubUrl } else { git remote add origin $githubUrl }
git add .
$pending = git diff --cached --quiet; if ($LASTEXITCODE -ne 0) { git commit -m 'feat: publicar site AMEAS' }
git push -u origin main

Titulo '5/5 - Publicar na Vercel'
$publish = Read-Host 'Publicar agora na Vercel? [S/n]'
if ($publish -notmatch '^[Nn]$') {
  $vercelToken = Read-Host 'Token Vercel (Enter para login interativo no navegador)'
  if ([string]::IsNullOrWhiteSpace($vercelToken)) {
    npx --yes vercel login
    $vercelArgs = @()
  } else { $vercelArgs = @('--token', $vercelToken) }
  npx --yes vercel link --yes @vercelArgs
  $supabaseUrl | npx --yes vercel env add VITE_SUPABASE_URL production @vercelArgs
  $supabaseAnon | npx --yes vercel env add VITE_SUPABASE_ANON_KEY production @vercelArgs
  npx --yes vercel --prod --yes @vercelArgs
}

Write-Host "`nCONCLUÍDO!" -ForegroundColor Green
Write-Host 'Site publicado. Painel administrativo: /admin'
Read-Host 'Pressione Enter para fechar'
