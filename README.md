## Publicar no Windows com duplo clique

Na pasta raiz do projeto, dê duplo clique em `publicar-ameas.cmd`. Ele abre o PowerShell automaticamente, pede os dados do Supabase, GitHub e Vercel, e executa tudo em sequência. Não é necessário usar `cd`, `chmod` ou Git Bash.

Requisitos: Node.js LTS e Git para Windows instalados. Se o Windows perguntar, permita a execução do arquivo. O login do GitHub pode aparecer pelo Gerenciador de Credenciais do Windows e o login da Vercel pode abrir o navegador.

# AMEAS — site institucional

Site institucional da AMEAS, construído com **TanStack Start, React, TypeScript e Tailwind**. O projeto inclui uma área `/admin` pronta para autenticação do Supabase, edição de textos e envio de várias imagens para a galeria.

## Instalação em um comando

Se esta pasta já se chama `ameas`, abra o terminal dentro dela e execute:

```bash
./instalar-ameas.sh
```

O instalador instala as dependências, aplica o SQL namespaced no Supabase compartilhado, cria/libera o usuário administrador, valida o build, faz commit/push no GitHub e oferece o deploy na Vercel. Ele solicitará apenas as credenciais das suas contas. A chave `service_role` é usada somente durante a execução para criar o admin e não é salva em arquivo.

## Publicação mais fácil: GitHub → Supabase → Vercel

1. Crie um repositório vazio no GitHub e envie este projeto:

```bash
git init
git add .
git commit -m "feat: site AMEAS com painel administrativo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ameas.git
git push -u origin main
```

2. No [Supabase](https://supabase.com), abra **SQL Editor**, cole e execute [`supabase/schema.sql`](./supabase/schema.sql). O SQL usa exclusivamente os nomes `ameas_admin_users`, `ameas_site_content`, `ameas_gallery_items`, `ameas_is_admin` e o bucket `ameas-site-media`, então não conflita com outros sites do mesmo projeto.
3. Em **Authentication → Users**, crie o usuário administrador com e-mail e senha e depois insira o UUID dele em `ameas_admin_users` usando o comando comentado no final do SQL.
4. Na Vercel, importe o repositório e configure:

```text
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

5. Use `npm run build` como build command e `npm install` como install command. A Vercel fará deploy a cada `git push` na branch `main`.

Depois do primeiro deploy, acesse `https://seu-dominio.vercel.app/admin`.

## Desenvolvimento local

```bash
npm install
npm run dev
```

O painel tem fallback visual quando o Supabase não está configurado, mas login, salvamento e uploads só ficam ativos depois das variáveis de ambiente e do SQL.

## O que foi preparado

- **Painel admin responsivo:** login, edição de textos, pré-visualização e upload múltiplo de imagens.
- **Supabase Storage:** bucket `site-media` com políticas para usuários autenticados.
- **RLS:** conteúdo público é somente leitura; gravações exigem sessão autenticada.
- **Conteúdo conectado:** título, subtítulo e texto institucional salvos no painel aparecem no site público.

- **Links de parceiros:** cada logo pode receber uma URL de site ou Instagram no painel admin e abre em nova aba.
- **Famílias atípicas:** nova seção sobre suporte psicológico, assistência social e Pilates voluntário para as mães.
- **Logos corrigidos a partir do banner:** os dez sponsors foram recortados diretamente de `ameas-parceiros-banner.png`, preservando os círculos e a proporção original; os cards usam `object-contain` e não deformam as imagens.
- **Assets corrigidos:** imports quebrados `.asset.json` apontam para os PNGs reais do repositório.
