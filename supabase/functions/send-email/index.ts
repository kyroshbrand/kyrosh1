import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const FAST2SMS_API_KEY = Deno.env.get("FAST2SMS_API_KEY")
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, phone, smsMessage, whatsappMessage } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to', 'subject', or 'html'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const results: Record<string, unknown> = {}

    // ====================================================
    // 1. AUTOMATED EMAIL DISPATCH (RESEND)
    // ====================================================
    if (RESEND_API_KEY) {
      try {
        const resEmail = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Kyrosh <notifications@kyrosh.in>",
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html,
            text: text || undefined,
            reply_to: "kyroshbrand@gmail.com",
          }),
        })
        results.email = await resEmail.json()
      } catch (err: unknown) {
        results.email_error = (err as Error).message
      }
    } else {
      results.email_notice = "RESEND_API_KEY not configured in Supabase secrets."
    }

    // Clean phone number (strip spaces, dashes, ensure standard format)
    const rawPhone = (phone || "").toString().replace(/[^0-9]/g, "")
    const targetPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone

    // ====================================================
    // 2. AUTOMATED SMS DISPATCH (FAST2SMS / TWILIO)
    // ====================================================
    if (targetPhone && smsMessage) {
      if (FAST2SMS_API_KEY) {
        try {
          const tenDigitPhone = targetPhone.slice(-10)
          const f2sRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
            method: "POST",
            headers: {
              "authorization": FAST2SMS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              route: "q",
              message: smsMessage,
              flash: 0,
              numbers: tenDigitPhone,
            }),
          })
          results.sms = await f2sRes.json()
        } catch (smsErr: unknown) {
          results.sms_error = (smsErr as Error).message
        }
      } else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        try {
          const senderNumber = TWILIO_PHONE_NUMBER || "+14155238886"
          const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
          const twilioBody = new URLSearchParams()
          twilioBody.append("From", senderNumber)
          twilioBody.append("To", `+${targetPhone}`)
          twilioBody.append("Body", smsMessage)

          const twilioRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${twilioAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: twilioBody.toString(),
            }
          )
          results.sms = await twilioRes.json()
        } catch (twErr: unknown) {
          results.sms_error = (twErr as Error).message
        }
      } else {
        results.sms_notice = "Add FAST2SMS_API_KEY or TWILIO credentials in Supabase to enable direct cellular SMS."
      }
    }

    // ====================================================
    // 3. AUTOMATED WHATSAPP DISPATCH (META CLOUD API OR TWILIO)
    // ====================================================
    if (targetPhone && whatsappMessage) {
      if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
        try {
          const waRes = await fetch(
            `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                to: targetPhone,
                type: "text",
                text: { body: whatsappMessage },
              }),
            }
          )
          results.whatsapp = await waRes.json()
        } catch (waErr: unknown) {
          results.whatsapp_error = (waErr as Error).message
        }
      } else if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        try {
          const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
          const twBody = new URLSearchParams()
          twBody.append("From", "whatsapp:+14155238886")
          twBody.append("To", `whatsapp:+${targetPhone}`)
          twBody.append("Body", whatsappMessage)

          const twRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${twilioAuth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: twBody.toString(),
            }
          )
          results.whatsapp = await twRes.json()
        } catch (twErr: unknown) {
          results.whatsapp_error = (twErr as Error).message
        }
      } else {
        results.whatsapp_notice = "Add WHATSAPP_ACCESS_TOKEN or TWILIO credentials in Supabase for direct WhatsApp bot messaging."
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
