# FinTek - Gestão Financeira

Sistema de gestao financeira integrado com Supabase e Gemini AI.

## Run Locally

**Prerequisites:** Node.js

1. Instale as dependências:
   `npm install`
2. Configure as variáveis no `.env.local`:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
   `GEMINI_API_KEY`
3. Execute o app:
   `npm run dev`

## Implantação na Vercel

### Variáveis de Ambiente

Configure as seguintes Variáveis de Ambiente no dashboard da Vercel:

- `VITE_SUPABASE_URL`: Sua URL do Supabase.
- `VITE_SUPABASE_ANON_KEY`: Sua Anon Key do Supabase.
- `GEMINI_API_KEY`: Sua chave de API do Gemini.

### Configuração de Rotas

O arquivo `vercel.json` garante que as rotas do React (SPA) funcionem corretamente.
