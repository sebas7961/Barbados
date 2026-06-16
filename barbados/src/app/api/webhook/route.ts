import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';

// Este es tu "password" interno. Meta lo usará para confirmar que este servidor es tuyo.
const VERIFY_TOKEN = 'BarbadosToken2026';

// 1. GET: Meta ejecuta esto UNA SOLA VEZ cuando vinculas el Webhook en su página.

export async function GET(request: Request) {

    console.log('🔍 PHONE_NUMBER_ID:', process.env.META_WA_PHONE_NUMBER_ID);
    console.log('🔍 TOKEN (primeros 20 chars):', process.env.META_WA_ACCESS_TOKEN?.slice(0, 20));
    console.log('🔍 PROVIDER:', process.env.WHATSAPP_PROVIDER);

    const result = await sendWhatsAppMessage({
        to: '51987741641',
        template: '',
        body: 'Hola prueba desde test-send',
    });
    return NextResponse.json(result);

    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ ¡Webhook verificado exitosamente por Meta!');
        return new NextResponse(challenge, { status: 200 });
    } else {
        console.error('❌ Error de verificación: Token incorrecto');
        return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }
}

// 2. POST: Meta ejecuta esto CADA VEZ que un cliente te manda un mensaje de WhatsApp.
export async function POST(request: Request) {
    console.log('🔍 PHONE_NUMBER_ID:', process.env.META_WA_PHONE_NUMBER_ID);
    try {
        const body = await request.json();

        console.log('📬 ¡Nuevo evento recibido desde WhatsApp!');
        // Imprimimos el contenido del mensaje para que lo veas en tu terminal
        console.dir(body, { depth: null });

        // Regla de oro: Siempre responder 200 OK rápido, o Meta pensará que tu servidor murió.
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error procesando el webhook' }, { status: 500 });
    }
}