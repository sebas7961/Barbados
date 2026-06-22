import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/provider';
import { runConversationalAgent } from '@/lib/agents/conversational';
import { getHistory, saveHistory } from '@/lib/whatsapp/history';

const VERIFY_TOKEN = 'BarbadosToken2026';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
        if (!message) return NextResponse.json({ success: true }, { status: 200 })

        const from: string = message.from
        let text: string = ''

        if (message.type === 'text') {
            text = message.text.body

        } else if (message.type === 'interactive') {
            const reply = message.interactive?.list_reply
            const id: string = reply?.id ?? ''

            if (id === 'fecha_otra') {
                text = 'El cliente quiere una fecha distinta, pídele que la escriba.'
            } else if (id.startsWith('fecha_')) {
                const fecha = id.replace('fecha_', '')
                text = `El cliente eligió la fecha ${fecha}. Consulta disponibilidad y muéstrale los horarios.`
            } else {
                text = reply?.title ?? ''
            }
        } else {
            return NextResponse.json({ success: true }, { status: 200 })
        }

        console.log(`📨 Mensaje de ${from}: ${text}`);

        // 1. Obtener historial de conversación
        const history = await getHistory(from);

        // 2. Llamar al agente con historial
        const reply = await runConversationalAgent({ from, message: text, history });

        // 3. Guardar historial actualizado
        await saveHistory(from, [
            ...history,
            { role: 'user', content: text },
            { role: 'assistant', content: reply },
        ]);

        // 4. Responder al cliente
        await sendWhatsAppMessage({ to: from, body: reply, template: '' });

        console.log(`✅ Respuesta: ${reply}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('❌ Error en webhook:', error);
        return NextResponse.json({ error: 'Error procesando el webhook' }, { status: 500 });
    }
}