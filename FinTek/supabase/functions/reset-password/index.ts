// Edge Function: reset-password (v1.3.1-DEBUG)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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

console.log("[reset-password] SCRIPT LOADED - v1.3.1-DEBUG")

serve(async (req) => {
    console.log(`[reset-password] INVOKED: ${req.method} @ ${new Date().toISOString()}`)

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders, status: 200 })
    }

    try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'suporte@sintektecnologia.com.br'

        const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const body = await req.json()
        const { email, userId, action, newPassword } = body
        console.log(`[reset-password] Running action: ${action} for ${email || userId}`)

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

        console.log(`[reset-password] Sending email to ${targetUser.email}`)
        await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
                from: SENDER_EMAIL,
                to: [targetUser.email],
                subject: '🔐 FinTek - Nova Senha',
                html: `Olá ${profile?.nome || 'Usuário'}, sua nova senha é: <strong>${tempPassword}</strong>`
            })
        })

        return new Response(JSON.stringify({ success: true, message: 'Processado com sucesso.' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

    } catch (error: any) {
        console.error(`[reset-password] CATCHED: ${error.message}`)
        return new Response(JSON.stringify({ success: false, error: error.message, debug_v: "1.3.1" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }
})
