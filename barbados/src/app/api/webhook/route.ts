import { NextResponse } from 'next/server';

const VERIFY_TOKEN = 'BarbadosToken2026';

// 1. GET: Meta ejecuta esto UNA SOLA VEZ cuando vinculas el Webhook en su página.
export async function GET(request: Request) {
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
    try {
        const body = await request.json();

        console.log('📬 ¡Nuevo evento recibido desde WhatsApp!');
        console.dir(body, { depth: null });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error procesando el webhook' }, { status: 500 });
    }
}