// Edge Function: send-user-invite (v1.3.1-DEBUG)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("[send-user-invite] SCRIPT LOADED - v1.3.1-DEBUG")

serve(async (req) => {
    console.log(`[send-user-invite] INVOKED: ${req.method} @ ${new Date().toISOString()}`)

    // CORS PREFLIGHT
    if (req.method === 'OPTIONS') {
        console.log("[send-user-invite] Returning OPTIONS 200")
        return new Response('ok', { headers: corsHeaders, status: 200 })
    }

    try {
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'suporte@sintektecnologia.com.br'

        console.log("[send-user-invite] Initializing Admin Client...")
        const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        console.log("[send-user-invite] Parsing JSON Body...")
        const body = await req.json().catch(e => {
            console.error("[send-user-invite] JSON Parse Fail:", e.message)
            return null
        })

        if (!body) throw new Error("Requisição inválida: O corpo deve ser um JSON válido.")
        const { email, nome, role, tempPassword } = body
        console.log(`[send-user-invite] Creating user: ${email}`)

        // Step 1: Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { nome, role, is_first_access: true }
        })

        if (authError) {
            console.error("[send-user-invite] Auth Error:", authError.message)
            if (authError.message.includes('already registered')) throw new Error("E-mail já cadastrado.")
            throw new Error(`Erro Auth: ${authError.message}`)
        }

        // Step 2: Create Profile
        console.log("[send-user-invite] Upserting Profile...")
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
            id: authData.user.id,
            nome,
            email,
            role,
            is_first_access: true
        })
        if (profileError) throw new Error(`Erro Perfil: ${profileError.message}`)

        // Step 3: Send Email (Attempt)
        console.log("[send-user-invite] Attempting Resend...")
        let emailSent = false
        try {
            const resData = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
                body: JSON.stringify({
                    from: SENDER_EMAIL,
                    to: [email],
                    subject: 'Bem-vindo ao FinTek',
                    html: `Olá ${nome}, sua senha: ${tempPassword}`
                })
            })
            if (resData.ok) emailSent = true
        } catch (e) {
            console.error("[send-user-invite] Email Fetch Fail:", e.message)
        }

        console.log("[send-user-invite] SUCCESS")
        return new Response(
            JSON.stringify({ success: true, userId: authData.user.id, emailSent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error(`[send-user-invite] CATCHED: ${error.message}`)
        return new Response(
            JSON.stringify({ success: false, error: error.message, debug_v: "1.3.1" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    }
})
