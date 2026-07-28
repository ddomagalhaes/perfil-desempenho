# Perfil de Desempenho Psicológico

App Next.js (App Router) para perfilagem de desempenho psicológico de equipas desportivas
(método Butler): roda circular por competência, gestão de múltiplas equipas e atletas,
comparação entre equipas por radar, e exportação em PDF via impressão do browser.

Portado a partir de um protótipo HTML autónomo (`perfil-desempenho.html`, na raiz do
repositório, mantido apenas como referência histórica do design/lógica original).

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, React 19.
- Postgres via [Prisma ORM](https://www.prisma.io/) 7 (client gerado localmente em
  `app/generated/prisma`, não versionado — ver `postinstall` no `package.json`).
- Sem serviços externos para PDF: rotas `/print/*` dedicadas + `window.print()` +
  CSS `@media print`.
- Sem CSS framework: estilos globais em `app/globals.css`, portados do protótipo.

## Desenvolvimento local

Requisitos: Node.js 20+ e npm.

```bash
npm install
```

### Base de dados local

O Prisma 7 inclui um Postgres local descartável, sem precisar de Docker nem de conta:

```bash
npx prisma dev
```

Isto imprime uma connection string (`postgres://postgres:postgres@localhost:PORT/...`).
Copia-a para `DATABASE_URL` num ficheiro `.env` na raiz do projeto (usa `.env.example`
como modelo). Mantém o comando `prisma dev` a correr num terminal à parte enquanto
desenvolves — ele fica como o teu Postgres de desenvolvimento.

Depois, aplica o schema e semeia as competências por omissão:

```bash
npm run db:push
npm run db:seed
```

### Correr a app

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) (redireciona para `/teams`).

### Outros scripts úteis

- `npm run db:migrate` — cria uma migração Prisma versionada (`prisma/migrations/`) a
  partir do schema atual; usa isto sempre que alterares `prisma/schema.prisma` depois do
  MVP inicial, para manter o histórico de migrações atualizado para produção.
- `npm run db:studio` — abre o Prisma Studio (GUI para inspecionar a BD).
- `npx tsc --noEmit` — verificação de tipos.

## Modelo de dados

`prisma/schema.prisma` define 4 modelos: `Competency` (lista global, com soft-delete via
`archivedAt` para nunca perder pontuações ao remover uma competência da lista ativa),
`Team`, `Athlete` (pertence a uma equipa) e `Score` (chave composta
`athleteId`+`competencyId`, valor 0–10). Renomear uma competência na página
"Competências" faz `UPDATE` sobre o registo existente (mantém as pontuações); um nome
que desaparece da lista é arquivado, não apagado.

## Deploy na Vercel

Passos que tens de fazer manualmente (fora do que já está no repositório):

1. **Publicar o repositório no GitHub** (ou GitLab/Bitbucket) e importar o projeto no
   [dashboard da Vercel](https://vercel.com/new), ou usar `vercel link` via CLI.

2. **Criar a base de dados Postgres**: no dashboard do projeto na Vercel, abre a tab
   **Storage** → **Create Database** / **Browse Marketplace** → escolhe a integração de
   **Postgres** disponível (atualmente **Neon**, já que a Vercel descontinuou os
   produtos nativos "Vercel Postgres"/"Vercel KV" a favor de integrações Marketplace).
   Isto injeta automaticamente as variáveis de ambiente de ligação no projeto.

3. **Confirmar o nome da variável de ambiente**: a integração pode chamar-lhe
   `DATABASE_URL`, `POSTGRES_URL` ou equivalente — confirma no ecrã de "Environment
   Variables" da integração e garante que existe uma variável `DATABASE_URL` (o
   `prisma.config.ts` deste projeto lê especificamente `process.env.DATABASE_URL`; se a
   integração usar outro nome, adiciona uma variável `DATABASE_URL` no projeto Vercel a
   apontar para o mesmo valor).

4. **Usar a connection string com pooler em runtime**: integrações tipo Neon costumam
   expor uma variável "pooled" (para a app, serverless) e outra "direct" (só para
   migrações). Usa a *pooled* como `DATABASE_URL` do projeto.

5. **Variáveis de ambiente locais** (opcional, para testar contra a BD de produção):
   ```bash
   vercel env pull .env.local
   ```

6. **Migrações em produção**: o script `build` já corre
   `prisma migrate deploy && next build`, por isso cada deploy na Vercel aplica
   automaticamente as migrações pendentes de `prisma/migrations/` antes de compilar.
   Não precisas de correr nada manualmente para isto — só garante que fazes
   `npm run db:migrate` localmente sempre que alterares o schema, para gerar a migração
   e commitá-la antes do deploy.

7. **Seed inicial (opcional)**: se quiseres que a BD de produção arranque já com as
   competências por omissão, corre uma vez, com `DATABASE_URL` a apontar para produção:
   ```bash
   npm run db:seed
   ```

8. **Deploy**: push para a branch ligada ao projeto (deploy automático) ou
   `vercel --prod` via CLI. Confirma nos logs de build que o passo
   `prisma migrate deploy` correu sem erros.

### Nota sobre `allowScripts`

O `package.json` inclui um bloco `allowScripts` (aprovação de scripts de instalação do
npm para `prisma`, `@prisma/engines`, `sharp`, `esbuild`, `unrs-resolver`). Isto está
commitado de propósito para que o `npm install` na Vercel não fique bloqueado à espera
de aprovação interativa.
