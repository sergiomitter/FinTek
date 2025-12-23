<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


## Implantação na Vercel

### Variáveis de Ambiente

Para que o projeto funcione corretamente na Vercel, configure as seguintes Variáveis de Ambiente no dashboard da Vercel:

- `VITE_SUPABASE_URL`: Sua URL do Supabase.
- `VITE_SUPABASE_ANON_KEY`: Sua Anon Key do Supabase.
- `GEMINI_API_KEY`: Sua chave de API do Gemini.

### Configuração de Rotas

O arquivo `vercel.json` já está configurado para garantir que as rotas do React (SPA) funcionem corretamente após o deploy.

---

1. Instale as dependências:
   `npm install`
2. Configure a `GEMINI_API_KEY` no [.env.local](.env.local) (ou utilize as variáveis acima no Vercel).
3. Execute o app:
   `npm run dev`
