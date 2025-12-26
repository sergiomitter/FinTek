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
            { auth: { autoRefreshToken: false, persistSession: false } }
        )

        const { email, userId, action }: ResetRequest = await req.json()
        let targetUser = null;

        // --- AUTHENTICATION & RESOLUTION LOGIC ---

        if (action === 'FORGOT_PASSWORD') {
            // Public endpoint logic: Anyone can request if they know the email
            if (!email) throw new Error('Email required for password reset.')

            // Find user by email (using listUsers is heavyweight, but standard for admin client)
            // Safer way: user Service Role to find by email
            const { data: { users }, error: findError } = await supabaseAdmin.auth.admin.listUsers()
            if (findError) throw findError

            targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

            if (!targetUser) {
                // Security: Don't reveal user doesn't exist. return fake success.
                // However, user specifically asked for "System requests...". 200 OK is fine.
                console.log(`[reset-password] Email not found: ${email}`) // Internal log
                return new Response(JSON.stringify({ success: true, message: 'Se o email existir, as instruções foram enviadas.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

        } else if (action === 'ADMIN_UPDATE_PASSWORD') {
            // Admin logic: Caller must be MASTER_ADMIN. Manual Password Set.
            const authHeader = req.headers.get('Authorization')
            if (!authHeader) throw new Error('Missing Authorization header')

            const token = authHeader.replace('Bearer ', '')
            const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token)

            if (callerError || !caller) throw new Error('Unauthorized call.')

            const { data: callerProfile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', caller.id)
                .single()

            if (callerProfile?.role !== 'MASTER_ADMIN') {
                throw new Error('Only Master Admins can update passwords.')
            }

            if (!userId) throw new Error('User ID required.')
            const { newPassword } = await req.json()
            if (!newPassword) throw new Error('New password required.')

            // Update Password
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { password: newPassword }
            )
            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, message: 'Senha atualizada com sucesso.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )

        } else if (action === 'ADMIN_RESET') {
            // Admin logic: Caller must be MASTER_ADMIN.
            // Check caller auth
            const authHeader = req.headers.get('Authorization')
            if (!authHeader) throw new Error('Missing Authorization header')

            // Validate admin token
            const token = authHeader.replace('Bearer ', '')
            const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token)

            if (callerError || !caller) throw new Error('Unauthorized call.')

            // Check caller profile role
            const { data: callerProfile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', caller.id)
                .single()

            if (callerProfile?.role !== 'MASTER_ADMIN') {
                throw new Error('Only Master Admins can enforce password resets.')
            }

            if (!userId) throw new Error('User ID required for admin reset.')

            const { data: { user }, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId)
            if (getError || !user) throw new Error('Target user not found.')
            targetUser = user
        } else {
            throw new Error('Invalid action.')
        }

        // --- EXECUTION LOGIC ---

        const tempPassword = generateTempPassword()

        // 1. Update Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            targetUser.id,
            { password: tempPassword }
        )
        if (updateError) throw updateError

        // 2. Set is_first_access = true to force change on login
        // Also get 'nome' for the email
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ is_first_access: true })
            .eq('id', targetUser.id)
            .select('nome')
            .single()

        const userName = profile?.nome || 'Usuário'

        // 3. Send Email
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; color: #334155; }
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
