# Edge Functions - FinTek

Este diretório contém as Edge Functions do Supabase para o projeto FinTek.

## 📁 Estrutura

```
supabase/
├── functions/
│   ├── send-user-invite/     # Function para envio de convites de usuários
│   │   └── index.ts
│   ├── deno.json             # Configuração do Deno
│   └── .env.example          # Template de variáveis de ambiente
└── DEPLOY_INSTRUCTIONS.md    # Instruções de deploy
```

## 🚀 Functions Disponíveis

### send-user-invite

Cria usuários no Supabase Auth e envia email de boas-vindas com credenciais.

**Endpoint:** `POST /functions/v1/send-user-invite`

**Payload:**

```json
{
  "email": "usuario@exemplo.com",
  "nome": "Nome Completo",
  "role": "USER|ADMIN|MASTER_ADMIN",
  "celular": "(11) 99999-9999",
  "funcao": "Cargo/Função",
  "tempPassword": "SenhaTemporaria123"
}
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "userId": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "emailSent": true
}
```

## 📚 Documentação

Consulte o arquivo [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) para instruções detalhadas de deploy e configuração.
