import { createServiceClient } from '@/lib/supabase/server'

export async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    console.log(`🔧 Tool: ${name}`, args)

    switch (name) {
        case 'verHorariosDisponibles':
            return verHorariosDisponibles(args)
        case 'crearCita':
            return crearCita(args)
        case 'reprogramarCita':
            return reprogramarCita(args)
        case 'cancelarCita':
            return cancelarCita(args)
        default:
            return { error: 'Tool no encontrada' }
    }
}

async function verHorariosDisponibles(args: Record<string, unknown>) {
    const supabase = createServiceClient()
    const { empleado_id, fecha, servicio_id } = args as {
        empleado_id?: string
        fecha: string
        servicio_id: string
    }

    const [{ data: servicio }, { data: config }] = await Promise.all([
        supabase.from('servicios').select('duracion_base_minutos').eq('id', servicio_id).single(),
        supabase.from('configuracion').select('*').single()
    ])

    if (!servicio || !config) return { error: 'Servicio o configuración no encontrados' }

    const duracion = servicio.duracion_base_minutos
    const buffer = config.margen_colchon_minutos
    const bloque = duracion + buffer

    const inicio_dia = `${fecha}T00:00:00`
    const fin_dia = `${fecha}T23:59:59`

    let query = supabase
        .from('citas')
        .select('fecha_hora_inicio, fecha_hora_fin')
        .gte('fecha_hora_inicio', inicio_dia)
        .lte('fecha_hora_inicio', fin_dia)
        .eq('estado', 'confirmada')

    if (empleado_id) query = query.eq('empleado_id', empleado_id)

    const { data: citasDelDia } = await query

    const slots: string[] = []
    const bloques = [
        { apertura: config.hora_apertura_manana, cierre: config.hora_cierre_manana },
        { apertura: config.hora_apertura_tarde, cierre: config.hora_cierre_tarde },
    ]

    for (const bloqueDia of bloques) {
        let current = new Date(`${fecha}T${bloqueDia.apertura}`)
        const cierre = new Date(`${fecha}T${bloqueDia.cierre}`)

        while (new Date(current.getTime() + duracion * 60000) <= cierre) {
            const fin_slot = new Date(current.getTime() + duracion * 60000)

            const hayConflicto = citasDelDia?.some(cita => {
                const citaInicio = new Date(cita.fecha_hora_inicio)
                const citaFin = new Date(cita.fecha_hora_fin)
                return current < citaFin && fin_slot > citaInicio
            })

            if (!hayConflicto) {
                slots.push(current.toTimeString().slice(0, 5))
            }

            current = new Date(current.getTime() + bloque * 60000)
        }
    }

    return { fecha, slots, total: slots.length }
}

async function crearCita(args: Record<string, unknown>) {
    const supabase = createServiceClient()
    const { nombre_cliente, telefono_cliente, empleado_id, servicio_id, inicio } = args as {
        nombre_cliente: string
        telefono_cliente: string
        empleado_id: string
        servicio_id: string
        inicio: string
    }

    let cliente_id: string

    const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefono', telefono_cliente)
        .maybeSingle()

    if (clienteExistente) {
        cliente_id = clienteExistente.id
    } else {
        const { data: nuevoCliente, error } = await supabase
            .from('clientes')
            .insert({ telefono: telefono_cliente, nombre_preferido: nombre_cliente })
            .select('id')
            .single()

        if (error || !nuevoCliente) return { error: 'Error creando cliente' }
        cliente_id = nuevoCliente.id
    }

    const { data: servicio } = await supabase
        .from('servicios')
        .select('duracion_base_minutos')
        .eq('id', servicio_id)
        .single()

    if (!servicio) return { error: 'Servicio no encontrado' }

    const fecha_hora_inicio = new Date(inicio)
    const fecha_hora_fin = new Date(fecha_hora_inicio.getTime() + servicio.duracion_base_minutos * 60000)

    const { data: cita, error } = await supabase
        .from('citas')
        .insert({
            cliente_id,
            empleado_id,
            servicio_id,
            fecha_hora_inicio: fecha_hora_inicio.toISOString(),
            fecha_hora_fin: fecha_hora_fin.toISOString(),
            estado: 'confirmada',
            origen: 'whatsapp',
        })
        .select('id')
        .single()

    if (error) return { error: 'Error creando cita', detalle: error.message }

    return {
        success: true,
        cita_id: cita.id,
        mensaje: `Cita confirmada para el ${fecha_hora_inicio.toLocaleDateString('es-PE')} a las ${fecha_hora_inicio.toTimeString().slice(0, 5)}`
    }
}

async function reprogramarCita(args: Record<string, unknown>) {
    const supabase = createServiceClient()
    const { cita_id, nuevo_inicio } = args as { cita_id: string; nuevo_inicio: string }

    const { data: cita } = await supabase
        .from('citas')
        .select('servicio_id')
        .eq('id', cita_id)
        .single()

    if (!cita) return { error: 'Cita no encontrada' }

    const { data: servicio } = await supabase
        .from('servicios')
        .select('duracion_base_minutos')
        .eq('id', cita.servicio_id)
        .single()

    const fecha_hora_inicio = new Date(nuevo_inicio)
    const fecha_hora_fin = new Date(fecha_hora_inicio.getTime() + (servicio?.duracion_base_minutos ?? 60) * 60000)

    const { error } = await supabase
        .from('citas')
        .update({
            fecha_hora_inicio: fecha_hora_inicio.toISOString(),
            fecha_hora_fin: fecha_hora_fin.toISOString(),
            estado: 'reprogramada',
        })
        .eq('id', cita_id)

    if (error) return { error: 'Error reprogramando cita' }
    return { success: true, mensaje: 'Cita reprogramada correctamente' }
}

async function cancelarCita(args: Record<string, unknown>) {
    const supabase = createServiceClient()
    const { cita_id } = args as { cita_id: string }

    const { error } = await supabase
        .from('citas')
        .update({ estado: 'cancelada' })
        .eq('id', cita_id)

    if (error) return { error: 'Error cancelando cita' }
    return { success: true, mensaje: 'Cita cancelada correctamente' }
}