
// SUPABASE EDGE FUNCTION (SIMULATION OF SERVER LOGIC)
// Esta función se invoca desde el App.tsx cuando el docente deniega una solicitud.

// Fix: Declare Deno global for environments without Deno type definitions.
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
  const { requestId, studentId, subjectId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Obtenemos info del estudiante y la materia
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single()
  const { data: subject } = await supabase.from('subjects').select('*').eq('id', subjectId).single()

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
      <div style="background-color: #0f172a; padding: 30px; border-radius: 20px 20px 0 0; text-align: center;">
        <span style="background-color: white; color: #0f172a; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 24px;">CV</span>
      </div>
      <div style="background-color: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0; border-top: none;">
        <h1 style="color: #0f172a; font-size: 20px; margin-bottom: 20px;">Hola, ${profile.full_name} 👋</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Notamos que solicitaste inscribirte a la asignatura <strong>${subject.name}</strong>. 
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Tu solicitud fue marcada como <strong>rechazada</strong>. No te preocupes, esto suele suceder por un error de clic o porque elegiste una materia que no corresponde a tu curso o división actual.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Por favor, volvé al Campus para revisar tus opciones e inscribirte en la correcta. ¡Estamos para acompañarte!
        </p>
        <div style="text-align: center;">
          <a href="https://campus-cuaderno-vivo.vercel.app" 
             style="background-color: #0f172a; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
             Volver al Campus
          </a>
        </div>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; text-transform: uppercase; letter-spacing: 2px;">
        Campus · Cuaderno Vivo
      </p>
    </div>
  `

  console.log(`Enviando email a ${profile.full_name} por rechazo en ${subject.name}`)

  // Aquí iría la lógica de envío real (Resend, SendGrid, etc.)
  // return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
  
  return new Response(JSON.stringify({ msg: "Email simulated successfully" }), { status: 200 })
})
