import { createServiceClient } from '@/lib/supabase/server'

const esUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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

    // 1. Flexibilidad de parámetros: Mapeamos variaciones que la IA suele inventar
    const empleadoInput = (args.empleado_id || args.barbero_id || args.nombre_barbero) as string | undefined
    const servicioInput = (args.servicio_id || args.nombre_servicio) as string | undefined
    const fecha = args.fecha as string

    // 2. Validación de Fecha (Formato obligatorio: YYYY-MM-DD)
    // Si Groq envía "lunes", esto frena el proceso limpiamente y le avisa cómo corregirlo
    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    if (!fecha || !regexFecha.test(fecha)) {
        return {
            error: 'Formato de fecha inválido',
            detalle: `Se recibió "${fecha}". El formato requerido es estrictamente YYYY-MM-DD (Ej: 2026-06-22). No uses nombres de días.`
        }
    }

    if (!servicioInput) {
        return { error: 'Falta especificar el servicio' }
    }

    // 3. Traducción Automática: Servicio (Texto plano -> UUID)
    let resolvedServicioId = '';
    if (esUUID(servicioInput)) {
        resolvedServicioId = servicioInput;
    } else {
        const { data: servicioData } = await supabase
            .from('servicios')
            .select('id')
            .ilike('nombre', `%${servicioInput}%`)
            .eq('activo', true)
            .maybeSingle()

        if (!servicioData) {
            return { error: `No se encontró ningún servicio que coincida con "${servicioInput}"` }
        }
        resolvedServicioId = servicioData.id;
    }

    // 4. Traducción Automática: Barbero (Texto plano -> UUID)
    let resolvedEmpleadoId: string | null = null;
    if (empleadoInput) {
        if (esUUID(empleadoInput)) {
            resolvedEmpleadoId = empleadoInput;
        } else {
            const { data: empleadoData } = await supabase
                .from('empleados')
                .select('id')
                .ilike('nombre', `%${empleadoInput}%`)
                .eq('activo', true)
                .maybeSingle()

            if (!empleadoData) {
                return { error: `No se encontró ningún barbero que coincida con "${empleadoInput}"` }
            }
            resolvedEmpleadoId = empleadoData.id;
        }
    }

    // 5. Obtención de la duración y configuración (Lógica original optimizada)
    const [{ data: servicio }, { data: config }] = await Promise.all([
        supabase.from('servicios').select('duracion_base_minutos').eq('id', resolvedServicioId).single(),
        supabase.from('configuracion').select('*').single()
    ])

    if (!servicio || !config) return { error: 'Servicio o configuración no encontrados en la base de datos' }

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

    if (resolvedEmpleadoId) query = query.eq('empleado_id', resolvedEmpleadoId)

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

    // 1. Flexibilidad de parámetros (por si la IA inventa nombres)
    const nombre_cliente = (args.nombre_cliente || args.nombre) as string
    const telefono_cliente = (args.telefono_cliente || args.telefono) as string
    const empleadoInput = (args.empleado_id || args.barbero_id || args.nombre_barbero) as string
    const servicioInput = (args.servicio_id || args.nombre_servicio || args.servicio) as string
    const inicio = (args.inicio || args.fecha_hora || args.fecha) as string

    // Verificación de campos vacíos
    if (!nombre_cliente || !telefono_cliente || !empleadoInput || !servicioInput || !inicio) {
        return { error: 'Faltan datos requeridos. Revisa que estén el nombre, teléfono, barbero, servicio y hora de inicio.' }
    }

    // 2. Validación Estricta de Fecha y Hora
    const fecha_hora_inicio = new Date(inicio)
    if (isNaN(fecha_hora_inicio.getTime())) {
        return {
            error: 'Formato de fecha de inicio inválido',
            detalle: `Se recibió "${inicio}". Debes enviar el formato ISO estricto, por ejemplo: 2026-06-18T15:00:00`
        }
    }

    // 3. Traducción Automática: Servicio (Texto plano -> UUID)
    let resolvedServicioId = '';
    if (esUUID(servicioInput)) {
        resolvedServicioId = servicioInput;
    } else {
        const { data: servicioData } = await supabase
            .from('servicios')
            .select('id')
            .ilike('nombre', `%${servicioInput}%`)
            .eq('activo', true)
            .maybeSingle()

        if (!servicioData) return { error: `No se encontró ningún servicio que coincida con "${servicioInput}"` }
        resolvedServicioId = servicioData.id;
    }

    // 4. Traducción Automática: Barbero (Texto plano -> UUID)
    let resolvedEmpleadoId = '';
    if (esUUID(empleadoInput)) {
        resolvedEmpleadoId = empleadoInput;
    } else {
        const { data: empleadoData } = await supabase
            .from('empleados')
            .select('id')
            .ilike('nombre', `%${empleadoInput}%`)
            .eq('activo', true)
            .maybeSingle()

        if (!empleadoData) return { error: `No se encontró ningún barbero que coincida con "${empleadoInput}"` }
        resolvedEmpleadoId = empleadoData.id;
    }

    // 5. Gestión del Cliente (Buscar o Crear)
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

        if (error || !nuevoCliente) return { error: 'Error de base de datos creando cliente nuevo' }
        cliente_id = nuevoCliente.id
    }

    // 6. Cálculo de fin de cita usando el tiempo real del servicio
    const { data: servicio } = await supabase
        .from('servicios')
        .select('duracion_base_minutos')
        .eq('id', resolvedServicioId)
        .single()

    if (!servicio) return { error: 'Servicio no encontrado al calcular la duración' }

    const fecha_hora_fin = new Date(fecha_hora_inicio.getTime() + servicio.duracion_base_minutos * 60000)

    // 7. Inserción de la Cita Final
    const { data: cita, error } = await supabase
        .from('citas')
        .insert({
            cliente_id,
            empleado_id: resolvedEmpleadoId,
            servicio_id: resolvedServicioId,
            fecha_hora_inicio: fecha_hora_inicio.toISOString(),
            fecha_hora_fin: fecha_hora_fin.toISOString(),
            estado: 'confirmada',
            origen: 'whatsapp',
        })
        .select('id')
        .single()

    if (error) return { error: 'Error guardando la cita en la base de datos', detalle: error.message }

    return {
        success: true,
        cita_id: cita.id,
        mensaje: `Cita confirmada exitosamente para el ${fecha_hora_inicio.toLocaleDateString('es-PE')} a las ${fecha_hora_inicio.toTimeString().slice(0, 5)}`
    }
}

async function reprogramarCita(args: Record<string, unknown>) {
    const supabase = createServiceClient()

    // Flexibilidad y captura
    const cita_id = (args.cita_id || args.id_cita) as string
    const nuevo_inicio = (args.nuevo_inicio || args.fecha_hora_nueva || args.inicio) as string

    if (!cita_id || !nuevo_inicio) {
        return { error: 'Faltan parámetros. Se requiere el ID de la cita y la nueva fecha/hora de inicio.' }
    }

    if (!esUUID(cita_id)) {
        return { error: 'El ID de la cita proporcionado no es un identificador válido (debe ser un UUID).' }
    }

    // Validación estricta de la nueva fecha
    const fecha_hora_inicio = new Date(nuevo_inicio)
    if (isNaN(fecha_hora_inicio.getTime())) {
        return {
            error: 'Formato de nueva fecha inválido',
            detalle: `Se recibió "${nuevo_inicio}". Debe ser formato ISO estricto (Ej: 2026-06-20T16:30:00).`
        }
    }

    // Obtener la cita y el servicio original
    const { data: cita } = await supabase
        .from('citas')
        .select('servicio_id')
        .eq('id', cita_id)
        .single()

    if (!cita) return { error: `No se encontró ninguna cita con el ID indicado.` }

    const { data: servicio } = await supabase
        .from('servicios')
        .select('duracion_base_minutos')
        .eq('id', cita.servicio_id)
        .single()

    // Calcular el nuevo final de la cita
    const fecha_hora_fin = new Date(fecha_hora_inicio.getTime() + (servicio?.duracion_base_minutos ?? 60) * 60000)

    // Actualizar la base de datos
    const { error } = await supabase
        .from('citas')
        .update({
            fecha_hora_inicio: fecha_hora_inicio.toISOString(),
            fecha_hora_fin: fecha_hora_fin.toISOString(),
            estado: 'reprogramada',
        })
        .eq('id', cita_id)

    if (error) return { error: 'Error reprogramando cita en la base de datos', detalle: error.message }

    return { success: true, mensaje: 'Cita reprogramada correctamente en el sistema.' }
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