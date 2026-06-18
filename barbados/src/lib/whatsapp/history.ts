import { createClient } from '@supabase/supabase-js'
import type { MensajeChat } from '@/types'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getHistory(telefono: string): Promise<MensajeChat[]> {
    const { data } = await supabase
        .from('conversaciones')
        .select('mensajes')
        .eq('telefono', telefono)
        .single()

    return (data?.mensajes as MensajeChat[]) ?? []
}

export async function saveHistory(telefono: string, mensajes: MensajeChat[]) {
    const { error } = await supabase
        .from('conversaciones')
        .upsert(
            { telefono, mensajes, updated_at: new Date().toISOString() },
            { onConflict: 'telefono' }
        )

    if (error) {
        console.error('❌ Error guardando historial:', error)
    } else {
        console.log('✅ Historial guardado para:', telefono)
    }
}