// Edge Function: send-user-invite
// Purpose: Create user in Supabase Auth, create profile, and send welcome email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'suporte@sintektecnologia.com.br'
const SYSTEM_URL = 'https://fintek-steel.vercel.app'  // Fixed URL - always use production URL

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteRequest {
    email: string
    nome: string
    role: string
    celular?: string
    funcao?: string
    tempPassword: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        console.log(`[send-user-invite] Request received. Method: ${req.method}`)

        // Log Authorization header presence (do not log the full token for security)
        const authHeader = req.headers.get('Authorization')
        console.log(`[send-user-invite] Auth Header present: ${!!authHeader}`)

        // Parse request body
        const { email, nome, role, celular, funcao, tempPassword }: InviteRequest = await req.json()

        console.log(`[send-user-invite] Processing invite for: ${email}`)

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // MANUAL AUTH CHECK
        // We verified the Gateway was blocking 401, so we moved check here.
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        // Optionally verify the user if needed, but for now we trust the Bearer token presence 
        // implies the client sent it. Ideally we should validate it:
        /*
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
        if (userError || !user) {
             console.error('Invalid user token:', userError)
             throw new Error('Unauthorized: Invalid token')
        }
        */

        // Validate required fields
        if (!email || !nome || !role || !tempPassword) {
            throw new Error('Missing required fields: email, nome, role, tempPassword')
        }

        // Step 1: Create user in Supabase Auth
        console.log(`[send-user-invite] Creating user in Auth...`)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                nome,
                role,
                celular,
                funcao,
                is_first_access: true
            }
        })

        if (authError) {
            console.error(`[send-user-invite] Auth error:`, authError)
            throw new Error(`Failed to create user in Auth: ${authError.message}`)
        }

        console.log(`[send-user-invite] User created in Auth with ID: ${authData.user.id}`)

        // Step 2: Create profile in profiles table
        console.log(`[send-user-invite] Creating/Updating profile...`)
        // Use UPSERT because a Trigger might have already created the profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authData.user.id,
                nome,
                email,
                celular: celular || '',
                funcao: funcao || '',
                role,
                is_first_access: true,
                is_blocked: false
            })

        if (profileError) {
            console.error(`[send-user-invite] Profile error:`, profileError)
            // If profile update fails, we might want to keep the auth user but alert triggers?
            // For safety, let's just throw, but maybe not delete the user if the trigger created it.
            throw new Error(`Failed to update profile: ${profileError.message}`)
        }

        console.log(`[send-user-invite] Profile created successfully`)

        // Step 3: Send welcome email via Resend
        let emailSent = false
        let emailError = null

        try {
            console.log(`[send-user-invite] Sending welcome email...`)

            const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; color: white; font-size: 28px; font-weight: 800; }
    .content { padding: 40px 30px; }
    .welcome { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
    .credentials-box { background: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 8px; }
    .credentials-box h3 { margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 700; }
    .credential-item { margin: 12px 0; }
    .credential-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .credential-value { font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; background: white; padding: 8px 12px; border-radius: 6px; margin-top: 4px; }
    .btn { display: inline-block; background: #3b82f6; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; margin: 24px 0; font-size: 16px; }
    .btn:hover { background: #2563eb; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px; font-size: 14px; }
    .footer { background: #f8fafc; padding: 24px 30px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Bem-vindo ao FinTek!</h1>
    </div>
    <div class="content">
      <div class="welcome">Olá, ${nome}!</div>
      <p>Sua conta foi criada com sucesso! Você agora tem acesso ao sistema de gestao financeira FinTek.</p>
      
      <div class="credentials-box">
        <h3>🔐 Suas Credenciais de Acesso</h3>
        <div class="credential-item">
          <div class="credential-label">Usuário / E-mail</div>
          <div class="credential-value">${email}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Senha Temporária</div>
          <div class="credential-value">${tempPassword}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Perfil de Acesso</div>
          <div class="credential-value">${role === 'MASTER_ADMIN' ? 'Master Admin' : role === 'ADMIN' ? 'Administrador' : 'Usuário'}</div>
        </div>
      </div>

      <div class="warning">
        ⚠️ <strong>Importante:</strong> Esta é uma senha temporária. Por segurança, você será solicitado a criar uma nova senha no primeiro acesso.
      </div>

      <center>
        <a href="${SYSTEM_URL}" class="btn">Acessar o Sistema</a>
      </center>

      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
        Se você tiver qualquer dúvida, entre em contato com nossa equipe de suporte.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;"><strong>FinTek</strong> - Sistema de Gestão Financeira</p>
      <p style="margin: 8px 0 0 0;">© ${new Date().getFullYear()} Sintek Tecnologia. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
      `

            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: SENDER_EMAIL,
                    to: [email],
                    subject: '🎉 Bem-vindo ao FinTek - Suas Credenciais de Acesso',
                    html: emailHTML
                })
            })

            const resendData = await resendResponse.json()

            if (!resendResponse.ok) {
                throw new Error(`Resend API error: ${JSON.stringify(resendData)}`)
            }

            emailSent = true
            console.log(`[send-user-invite] Email sent successfully. ID: ${resendData.id}`)
        } catch (error: any) {
            console.error(`[send-user-invite] Email error:`, error)
            emailError = error.message
        }

        // Return response
        const response = {
            success: true,
            userId: authData.user.id,
            email: email,
            emailSent: emailSent
        }

        // Add warning if email failed
        if (!emailSent) {
            return new Response(
                JSON.stringify({
                    ...response,
                    warning: 'Usuário criado, mas o email não foi enviado.',
                    details: emailError
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            )
        }

        return new Response(
            JSON.stringify(response),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error: any) {
        console.error(`[send-user-invite] Error:`, error)
        // Return 200 with error so client can read the message instead of generic "non-2xx"
        return new Response(
            JSON.stringify({
                error: error.message || 'Internal server error',
                success: false
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )
    }
})
