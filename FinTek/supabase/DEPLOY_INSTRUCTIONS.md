# 🚀 Deploy Instructions - Supabase Edge Function

Este guia irá ajudá-lo a fazer deploy da Edge Function `send-user-invite` no Supabase.

## 📋 Pré-requisitos

1. **Supabase CLI instalado**

   ```bash
   npm install -g supabase
   ```

2. **Conta no Resend** (para envio de emails)
   - Acesse: <https://resend.com>
   - Crie uma conta gratuita
   - Obtenha sua API Key

3. **Projeto Supabase**
   - URL do projeto
   - Service Role Key (encontrada em Settings > API)

---

## 🔧 Configuração

### 1. Login no Supabase CLI

```bash
supabase login
```

Siga as instruções para autenticar.

### 2. Link com o Projeto

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

> **Nota**: O `PROJECT_REF` é o ID do seu projeto Supabase (encontrado na URL do dashboard).

### 3. Configurar Secrets (Variáveis de Ambiente)

Execute os seguintes comandos para configurar as variáveis de ambiente:

```bash
# API Key do Resend
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Email remetente (deve estar verificado no Resend)
supabase secrets set SENDER_EMAIL=suporte@sintektecnologia.com.br

# URL do sistema em produção
supabase secrets set SYSTEM_URL=https://fintek-steel.vercel.app
```

> **Importante**: O `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são automaticamente fornecidos pelo Supabase.

### 4. Verificar Domain no Resend

Acesse o Resend e verifique o domínio `sintektecnologia.com.br`:

1. Vá em **Domains** no dashboard do Resend
2. Adicione o domínio `sintektecnologia.com.br`
3. Configure os registros DNS conforme solicitado
4. Aguarde a verificação

---

## 📤 Deploy da Edge Function

### Deploy

```bash
supabase functions deploy send-user-invite
```

### Verificar Deploy

```bash
supabase functions list
```

Você deve ver `send-user-invite` na lista.

---

## 🧪 Testar a Edge Function

### Teste via cURL

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-user-invite' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "teste@exemplo.com",
    "nome": "Usuário Teste",
    "role": "USER",
    "celular": "(11) 99999-9999",
    "funcao": "Analista",
    "tempPassword": "Temp@123"
  }'
```

### Teste via Aplicação

1. Acesse o sistema em produção
2. Vá em **Gestão de Usuários**
3. Clique em **Novo Usuário**
4. Preencha os dados e envie
5. Verifique se o email chegou

---

## 📊 Monitoramento e Logs

### Ver Logs em Tempo Real

```bash
supabase functions logs send-user-invite --follow
```

### Ver Logs Recentes

```bash
supabase functions logs send-user-invite
```

---

## 🛠️ Troubleshooting

### Erro: "Edge Function returned a non-2xx status code"

**Possíveis causas:**

1. Secrets não configuradas corretamente
2. Domínio não verificado no Resend
3. API Key do Resend inválida

**Solução:**

```bash
# Verificar secrets
supabase secrets list

# Reconfigurar se necessário
supabase secrets set RESEND_API_KEY=your_new_key
```

### Erro: "Failed to send email"

**Possíveis causas:**

1. Domínio não verificado no Resend
2. Email remetente não autorizado
3. Limite de envios atingido (plano free)

**Solução:**

- Verifique o domínio no Resend
- Use um email remetente autorizado
- Considere upgrade no plano Resend

### Erro: "Failed to create user in Auth"

**Possíveis causas:**

1. Email já cadastrado
2. Service Role Key incorreta

**Solução:**

- Verifique se o usuário já existe
- Confirme a Service Role Key nas secrets

---

## 🔄 Atualizar a Edge Function

Sempre que fizer alterações no código:

```bash
supabase functions deploy send-user-invite
```

---

## 📝 Notas Importantes

1. **Plano Free do Resend**: Limite de 100 emails/dia e 3.000 emails/mês
2. **Verificação de Domínio**: É OBRIGATÓRIA para enviar emails de produção
3. **Logs**: Sempre monitore os logs após o deploy
4. **Secrets**: NUNCA commite secrets no código

---

## 🎯 Configuração Completa - Checklist

- [ ] Supabase CLI instalado
- [ ] Login no Supabase CLI
- [ ] Projeto linkado
- [ ] Conta Resend criada
- [ ] API Key do Resend obtida
- [ ] Domínio verificado no Resend
- [ ] Secrets configuradas
- [ ] Edge Function deployada
- [ ] Teste realizado com sucesso
- [ ] Logs monitorados

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `supabase functions logs send-user-invite`
2. Consulte a documentação: <https://supabase.com/docs/guides/functions>
3. Verifique o status do Resend: <https://resend.com/status>
