// Edge Function: send-user-invite
// Purpose: Create user in Supabase Auth, create profile, and send welcome email

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'suporte@sintektecnologia.com.br'
const SYSTEM_URL = 'https://fintek-steel.vercel.app'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface InviteRequest {
    email: string
    nome: string
    role: string
    celular?: string
    funcao?: string
    tempPassword: string
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`[send-user-invite] Request received: ${req.method}`)

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        // Parse request body
        const { email, nome, role, celular, funcao, tempPassword }: InviteRequest = await req.json()

        if (!email || !nome || !role || !tempPassword) {
            throw new Error('Missing required fields: email, nome, role, tempPassword')
        }

        const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Step 0: Clean up orphaned profiles
        const { data: existingProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)

        if (existingProfiles && existingProfiles.length > 0) {
            for (const profile of existingProfiles) {
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id)
                if (!userData?.user) {
                    await supabaseAdmin.from('profiles').delete().eq('id', profile.id)
                } else {
                    throw new Error(`Este e-mail já está em uso por outro usuário ativo (${email}).`)
                }
            }
        }

        // Step 1: Create user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { nome, role, celular, funcao, is_first_access: true }
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                throw new Error(`Este e-mail já está em uso no sistema.`)
            }
            throw new Error(`Erro no Auth: ${authError.message}`)
        }

        // Step 2: Create profile
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

        if (profileError) throw new Error(`Erro no perfil: ${profileError.message}`)

        // Step 3: Send welcome email
        let emailSent = false
        let emailError = null

        try {
            const emailHTML = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #2563eb;">Bem-vindo ao FinTek!</h1>
              <p>Olá, <strong>${nome}</strong>!</p>
              <p>Sua conta foi criada. Use os dados abaixo para o primeiro acesso:</p>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin: 5px 0;"><strong>Senha Temporária:</strong> ${tempPassword}</p>
              </div>
              <p>Por segurança, você deverá trocar esta senha no primeiro login.</p>
              <a href="${SYSTEM_URL}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Sistema</a>
            </div>`

            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: SENDER_EMAIL,
                    to: [email],
                    subject: '🎉 Bem-vindo ao FinTek - Dados de Acesso',
                    html: emailHTML
                })
            })

            if (resendResponse.ok) emailSent = true
            else emailError = await resendResponse.text()
        } catch (e: any) {
            emailError = e.message
        }

        return new Response(
            JSON.stringify({
                success: true,
                userId: authData.user.id,
                emailSent,
                warning: emailSent ? null : 'Usuário criado, mas o e-mail falhou.',
                details: emailError
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error(`[send-user-invite] Error:`, error.message)
        return new Response(
            JSON.stringify({ error: error.message, success: false }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
