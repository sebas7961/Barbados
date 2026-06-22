// Abstracción sobre Twilio (dev) / Meta (prod)
// Cambiar WHATSAPP_PROVIDER en .env para alternar sin tocar código

interface SendMessageOptions {
  to: string
  template: string
  params?: string[]
  body?: string
}

interface InteractiveListOption {
  id: string
  title: string
  description?: string
}

interface SendInteractiveListOptions {
  to: string
  header: string
  body: string
  footer?: string
  buttonLabel: string
  sections: {
    title: string
    rows: InteractiveListOption[]
  }[]
}

export async function sendWhatsAppMessage(opts: SendMessageOptions) {
  const provider = process.env.WHATSAPP_PROVIDER ?? "twilio"

  if (provider === "twilio") {
    return sendViaTwilio(opts)
  }

  return sendViaMeta(opts)
}

async function sendViaTwilio({ to, body, template, params }: SendMessageOptions) {
  const twilio = await import("twilio")
  const client = twilio.default(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  const text = body ?? buildTemplateText(template, params ?? [])

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body: text,
  })
}

async function sendViaMeta({ to, body, template, params }: SendMessageOptions) {
  const text = body ?? buildTemplateText(template, params ?? [])

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('whatsapp:', ''), // limpia el prefijo si viene de Twilio
        type: 'text',
        text: { body: text },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Error Meta:', data)
    throw new Error(data.error?.message || 'Error desconocido de Meta')
  }

  console.log('✅ Mensaje enviado por Meta:', data)
  return data
}

function buildTemplateText(template: string, params: string[]): string {
  return params.reduce((text, param, i) => text.replace(`{{${i + 1}}}`, param), template)
}

export async function sendWhatsAppInteractiveList(opts: SendInteractiveListOptions) {
  const response = await fetch(
    `https://graph.facebook.com/v25.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: opts.to,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: opts.header },
          body: { text: opts.body },
          footer: opts.footer ? { text: opts.footer } : undefined,
          action: {
            button: opts.buttonLabel,
            sections: opts.sections,
          },
        },
      }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    console.error('❌ Error enviando lista interactiva:', data)
    throw new Error(data.error?.message || 'Error desconocido de Meta')
  }

  console.log('✅ Lista interactiva enviada:', data)
  return data
}

// Helper específico para selector de fechas
export function buildDateSelectorPayload(to: string) {
  const hoy = new Date()
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

  // Genera los próximos 5 días hábiles (lunes a sábado)
  const rows: InteractiveListOption[] = []
  let i = 1

  while (rows.length < 5) {
    const fecha = new Date(hoy)
    fecha.setDate(hoy.getDate() + i)

    const diaSemana = fecha.getDay()
    if (diaSemana !== 0) { // excluye domingos
      const label = `${dias[diaSemana]} ${fecha.getDate()} ${meses[fecha.getMonth()]}`
      const isoDate = fecha.toISOString().split('T')[0] // "2026-06-25"

      rows.push({
        id: `fecha_${isoDate}`,
        title: label.charAt(0).toUpperCase() + label.slice(1),
        description: i === 1 ? 'Mañana' : undefined,
      })
    }
    i++
  }

  rows.push({
    id: 'fecha_otra',
    title: 'Otra fecha',
    description: 'Escríbeme el día que prefieres',
  })

  return sendWhatsAppInteractiveList({
    to,
    header: '📅 Elige el día',
    body: '¿Para qué día quieres tu cita en Barbados?',
    footer: 'Lunes a sábado · 9am – 8pm',
    buttonLabel: 'Ver días',
    sections: [{ title: 'Próximos días disponibles', rows }],
  })
}