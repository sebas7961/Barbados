# Barbados — Backlog de Tareas (2 personas)

> Tareas por fase y por persona, alineadas con el roadmap y la estructura del proyecto.
> **Persona A** = Web y experiencia · **Persona B** = Datos, agentes y WhatsApp.
> Etiquetas de prioridad: 🟥 Must · 🟧 Should · 🟦 Could.

---

## Fase 0 — Juntos (semana 0)

> No repartir hasta cerrar esto. Es el punto donde se conectan ambas partes.

- [ ] 🟥 Crear repo en GitHub + ramas de trabajo (A/B)
- [ ] 🟥 Crear proyecto en Supabase y compartir accesos
- [ ] 🟥 Definir `.env.example` con todas las variables
- [ ] 🟥 **Diseñar el esquema de datos** juntos (tablas `barberos`, `servicios`, `clientes`, `citas`, `configuracion`)
- [ ] 🟥 **Definir el contrato de la función de reserva** (entradas, salida, errores: cupo ocupado, barbero no disponible)
- [ ] 🟥 Acordar los tipos compartidos en `types/index.ts`
- [ ] 🟧 Programar **en pareja** la primera versión de la función de reserva

---

## Fase 1 — Base de datos y reservas web

### Persona B
- [ ] 🟥 Escribir `0001_init.sql` con el esquema acordado
- [ ] 🟥 Escribir `seed.sql`: Luis, el primo, servicios con **duraciones reales (~1 h)**
- [ ] 🟥 Implementar `lib/agents/scheduling/buffers.ts` (cálculo de huecos: duración + colchón)
- [ ] 🟥 Exponer la función de reserva vía `api/bookings/route.ts`
- [ ] 🟧 Clientes de Supabase: `lib/supabase/client.ts` y `server.ts`

### Persona A
- [ ] 🟥 Configurar Next.js + Tailwind + shadcn/ui
- [ ] 🟥 Pantalla de reserva: elegir barbero, servicio y hora (HU1)
- [ ] 🟥 Vista de horarios libres (consumiendo `buffers`)
- [ ] 🟧 Reserva rápida para cliente recurrente (HU2)
- [ ] 🟧 Pantalla "mis citas"
- [ ] 🟦 Mientras B termina la función: maquetar UI con datos de prueba

---

## Fase 2 — Sincronización en tiempo real (HU9, D7)

### Persona B
- [ ] 🟥 Habilitar Realtime en las tablas relevantes de Supabase
- [ ] 🟧 Verificar que toda reserva pase por la función única (sin overbooking)

### Persona A
- [ ] 🟥 Hook `use-realtime-agenda.ts` (suscripción en vivo)
- [ ] 🟥 Que un cupo ocupado desaparezca al instante en pantalla
- [ ] 🟧 Probar con dos pestañas/dispositivos en paralelo

---

## Fase 3 — WhatsApp + agente conversacional (HU4)

### Persona B
- [ ] 🟥 Configurar sandbox de Twilio
- [ ] 🟥 `api/whatsapp/webhook/route.ts` (recibir mensajes)
- [ ] 🟥 Agente conversacional con LLM: `conversational/index.ts`
- [ ] 🟥 `tools.ts`: ver horarios, reservar, reprogramar (usa la **misma** función que la web)
- [ ] 🟥 `prompt.ts` **acotado al negocio** (política Meta 2026)
- [ ] 🟧 Abstracción de proveedor en `lib/whatsapp/provider.ts` (Twilio↔Meta)

### Persona A
- [ ] 🟦 (Opcional) Chat web que reuse el mismo agente
- [ ] 🟦 Indicador en la UI cuando una reserva entró por WhatsApp

---

## Fase 4 — Agente de agenda (HU7, HU8, D4, D5)

### Persona B
- [ ] 🟥 `cascade.ts`: reacomodo de citas al detectar un retraso (HU7)
- [ ] 🟥 `balance.ts`: sugerir al primo cuando Luis está saturado (HU8)
- [ ] 🟧 Aviso automático a clientes afectados por retraso (umbral configurable)

### Persona A
- [ ] 🟥 Botón "voy retrasado / corte extendido" para el barbero (HU7)
- [ ] 🟧 Mostrar al cliente la alternativa con el primo (HU8)

---

## Fase 5 — Recordatorios y panel de admin (HU5, HU13, HU14)

### Persona B
- [ ] 🟧 `send-reminders/` con pg_cron (HU5)
- [ ] 🟧 Plantillas de recordatorio en `lib/whatsapp/templates.ts`
- [ ] 🟧 Endpoints de métricas: ocupación y clientes perdidos

### Persona A
- [ ] 🟥 Panel admin de Luis: agenda de ambos barberos (E7)
- [ ] 🟧 Configuración de servicios, duraciones y colchón (HU14)
- [ ] 🟧 Vista de métricas: ocupación, clientes perdidos (HU13)

---

## Fase 6 — Walk-ins y pulido (HU11, HU12, HU10, D3)

### Persona B
- [ ] 🟧 Lógica de cola de walk-ins sin romper reservas (HU12)
- [ ] 🟦 Estimación de tiempo de espera para walk-in (HU11)

### Persona A
- [ ] 🟧 Registrar walk-in desde el panel
- [ ] 🟥 Terminar la página de marca / personalidad (HU10, D8)
- [ ] 🟦 Galería de trabajos, ubicación, horarios

---

## Visión futura (post-MVP)

- [ ] 🟦 Ajuste automático de duraciones con histórico real por barbero/servicio (HU6.b)
- [ ] 🟦 Migrar de Twilio sandbox a número de producción (Cloud API o Twilio)
- [ ] 🟦 Verificación de negocio en Meta (gratis, para subir límites)

---

## Reglas de trabajo sugeridas

- **Punto de encuentro:** la función de reserva. Si cambia su contrato, se avisa al otro.
- **Ramas separadas + pull requests** para revisar el código del otro.
- **B entrega temprano** la función de reserva (Fase 1); A puede avanzar UI con datos de prueba mientras tanto.
- Revisión rápida cada pocos días para sincronizar avances.