// Edge Function: reset-password
// Purpose: Reset user password to a temporary one and send email.

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

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Parse JSON ONCE
        const body = await req.json()
        const { email, userId, action, newPassword } = body

        let targetUser = null;

        if (action === 'FORGOT_PASSWORD') {
            if (!email) throw new Error('Email obrigatório.')
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
            targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
            if (!targetUser) {
                return new Response(JSON.stringify({ success: true, message: 'Se o email existir, as instruções foram enviadas.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }
        } else if (action === 'ADMIN_UPDATE_PASSWORD' || action === 'ADMIN_RESET') {
            const authHeader = req.headers.get('Authorization')
            if (!authHeader) throw new Error('Acesso negado.')
            const { data: { user: caller } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))

            const { data: callerProfile } = await supabaseAdmin.from('profiles').select('role').eq('id', caller?.id).single()
            if (callerProfile?.role !== 'MASTER_ADMIN') throw new Error('Apenas Master Admins podem realizar esta ação.')

            if (action === 'ADMIN_UPDATE_PASSWORD') {
                if (!userId || !newPassword) throw new Error('ID e nova senha são obrigatórios.')
                const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword, user_metadata: { is_first_access: true } })
                if (error) throw error
                return new Response(JSON.stringify({ success: true, message: 'Senha atualizada.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId!)
            if (!user) throw new Error('Usuário não encontrado.')
            targetUser = user
        }

        const tempPassword = generateTempPassword()
        await supabaseAdmin.auth.admin.updateUserById(targetUser.id, { password: tempPassword, user_metadata: { is_first_access: true } })
        const { data: profile } = await supabaseAdmin.from('profiles').update({ is_first_access: true }).eq('id', targetUser.id).select('nome').single()

        const emailHTML = `<div style="font-family: sans-serif; padding: 20px;">
            <h2>🔐 Nova Senha Temporária</h2>
            <p>Olá, ${profile?.nome || 'Usuário'}.</p>
            <p>Sua nova senha é: <strong style="font-size: 20px; color: #2563eb;">${tempPassword}</strong></p>
            <a href="${SYSTEM_URL}">Acessar Sistema</a>
        </div>`

        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({ from: SENDER_EMAIL, to: [targetUser.email], subject: '🔐 FinTek - Nova Senha', html: emailHTML })
        })

        return new Response(JSON.stringify({ success: true, message: 'Processado com sucesso.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }
})
