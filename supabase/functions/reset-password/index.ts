// Edge Function: reset-password
// Purpose: Reset user password to a temporary one and send email.
// Can be called by:
// 1. "Forgot Password" (public, finds user by email)
// 2. Admin Reset (authenticated admin, finds user by ID)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'suporte@sintektecnologia.com.br'
const SYSTEM_URL = 'https://fintek-steel.vercel.app'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResetRequest {
    email?: string
    userId?: string
    action: 'FORGOT_PASSWORD' | 'ADMIN_RESET' | 'ADMIN_UPDATE_PASSWORD'
    newPassword?: string
}

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, 0, O
    let pass = '';
    // Ensure at least 8 chars
    for (let i = 0; i < 8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
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

        const { email, userId, action, newPassword }: ResetRequest = await req.json()

        let targetUser = null

        if (action === 'FORGOT_PASSWORD') {
            if (!email) throw new Error('Email is required')
            // Better lookup: Use profiles table to find the ID
            const { data: profile, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('email', email)
                .single()

            if (profileError || !profile) {
                console.error('Profile not found for email:', email, profileError)
                throw new Error('Usuário não encontrado.')
            }

            const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
            if (fetchError || !user) throw new Error('Usuário não encontrado no Auth.')
            targetUser = user
        } else if (action === 'ADMIN_RESET' || action === 'ADMIN_UPDATE_PASSWORD') {
            if (!userId) throw new Error('User ID is required')
            const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
            if (fetchError || !user) throw new Error('Usuário não encontrado no Auth.')
            targetUser = user
        }

        if (!targetUser) throw new Error('Usuário não encontrado.')

        const tempPassword = newPassword || generateTempPassword()

        // Update Auth Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            {
                password: tempPassword,
                user_metadata: { isFirstAccess: true }
            }
        )

        if (updateError) throw updateError

        // Update Profile
        await supabaseAdmin
            .from('profiles')
            .update({ is_first_access: true })
            .eq('id', targetUser.id)

        if (action === 'ADMIN_UPDATE_PASSWORD') {
            return new Response(
                JSON.stringify({ success: true, message: 'Senha alterada com sucesso.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Send Email
        const userName = targetUser.user_metadata?.nome || targetUser.email?.split('@')[0] || 'Usuário'

        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #334155; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
    .pass-box { background: #f1f5f9; padding: 15px; text-align: center; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 Redefinição de Senha - FinTek</h2>
    <p>Olá, <strong>${userName}</strong>.</p>
    <p>Foi solicitada uma redefinição de senha para sua conta.</p>
    
    <p>Sua nova senha temporária é:</p>
    <div class="pass-box">${tempPassword}</div>
    
    <p>Use esta senha para entrar no sistema. Você será solicitado a criar uma nova senha imediatamente após o login.</p>
    
    <p><a href="${SYSTEM_URL}">Acessar o Sistema</a></p>
  </div>
</body>
</html>`

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: SENDER_EMAIL,
                to: [targetUser.email],
                subject: '🔐 FinTek - Sua nova senha temporária',
                html: emailHTML
            })
        })

        if (!resendResponse.ok) {
            const errorData = await resendResponse.text()
            console.error('Failed to send email via Resend:', errorData)
            throw new Error(`Erro ao enviar email (Resend): ${errorData}`)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Senha resetada com sucesso.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error(error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
