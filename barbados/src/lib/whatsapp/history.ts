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
    const { data: existing } = await supabase
        .from('conversaciones')
        .select('id')
        .eq('telefono', telefono)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from('conversaciones')
            .update({ mensajes, updated_at: new Date().toISOString() })
            .eq('telefono', telefono)

        if (error) console.error('❌ Error actualizando historial:', error)
        else console.log('✅ Historial actualizado para:', telefono)
    } else {
        const { error } = await supabase
            .from('conversaciones')
            .insert({ telefono, mensajes })

        if (error) console.error('❌ Error insertando historial:', error)
        else console.log('✅ Historial creado para:', telefono)
    }
}