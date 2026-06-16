import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

export async function GET() {
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
                to: '51987741641',
                type: 'template',
                template: {
                    name: 'hello_world', // template que toda cuenta tiene por defecto
                    language: { code: 'en_US' },
                },
            }),
        }
    )
    const data = await response.json()
    console.log(data)
    return NextResponse.json(data)
}