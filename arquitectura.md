# Barbados — Estructura del Proyecto

> Estructura base para empezar a programar, alineada con el stack:
> **Next.js (App Router) + Tailwind + shadcn/ui + Supabase + WhatsApp (Twilio sandbox en dev) + agente LLM (Gemini/Groq)**.
>
> Cada carpeta apunta a un dolor (Dx) o historia de usuario (HUx) del documento de contexto.

---

## 1. Árbol de carpetas

```
barbados/
├── README.md
├── .env.local                    # secretos (gitignored)
├── .env.example                  # plantilla de variables de entorno
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── components.json               # config de shadcn/ui
│
├── public/                       # assets: logo, fotos del local (D8)
│
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── (marketing)/          # Página de marca — personalidad (D8, HU10)
│   │   │   ├── page.tsx          # landing: estilo, trabajos, ubicación
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (booking)/            # Sistema de reservas (D6, HU1, HU2)
│   │   │   ├── reservar/
│   │   │   │   └── page.tsx      # ver horarios libres + reservar
│   │   │   └── mis-citas/
│   │   │       └── page.tsx      # citas del cliente
│   │   │
│   │   ├── admin/                # Panel de Luis (encargado) — E7
│   │   │   ├── page.tsx          # vista general de la agenda
│   │   │   ├── agenda/           # agenda de ambos barberos en tiempo real
│   │   │   ├── servicios/        # configurar duraciones y colchón (HU14, D4)
│   │   │   └── metricas/         # ocupación, clientes perdidos (HU13)
│   │   │
│   │   ├── api/                  # Backend serverless (route handlers)
│   │   │   ├── whatsapp/
│   │   │   │   ├── webhook/route.ts   # recibe mensajes (Twilio/Meta) — HU4
│   │   │   │   └── send/route.ts      # envía plantillas/recordatorios — HU5
│   │   │   ├── bookings/route.ts      # crear/editar/cancelar reservas
│   │   │   └── agent/route.ts         # orquesta el agente conversacional
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/               # UI reutilizable
│   │   ├── ui/                   # componentes de shadcn/ui
│   │   ├── booking/              # calendario, selector de hora, tarjeta de cita
│   │   ├── marketing/            # hero, galería, testimonios
│   │   └── admin/                # tablas, gráficos de métricas
│   │
│   ├── lib/                      # Lógica de negocio e integraciones
│   │   ├── supabase/
│   │   │   ├── client.ts         # cliente para el navegador
│   │   │   ├── server.ts         # cliente para el servidor
│   │   │   └── realtime.ts       # suscripciones realtime — sync (D7, HU9)
│   │   │
│   │   ├── whatsapp/
│   │   │   ├── provider.ts       # abstracción Twilio/Meta (cambiar uno por otro)
│   │   │   └── templates.ts      # textos de plantillas salientes
│   │   │
│   │   ├── agents/
│   │   │   ├── conversational/   # AGENTE 1: LLM (Gemini/Groq) — HU4
│   │   │   │   ├── index.ts      # bucle del agente
│   │   │   │   ├── tools.ts      # function calling: verHorarios, reservar, reprogramar
│   │   │   │   └── prompt.ts     # system prompt ACOTADO al negocio (regla Meta 2026)
│   │   │   │
│   │   │   └── scheduling/       # AGENTE 2: reglas → datos — D4, D5
│   │   │       ├── buffers.ts    # duración por servicio + colchón separado (HU6)
│   │   │       ├── cascade.ts    # reacomodo por retraso en cadena (HU7)
│   │   │       └── balance.ts    # sugerir al primo si Luis está saturado (HU8)
│   │   │
│   │   └── utils.ts
│   │
│   ├── types/
│   │   └── index.ts              # tipos compartidos (Cita, Servicio, Barbero...)
│   │
│   └── hooks/
│       └── use-realtime-agenda.ts # suscripción en vivo a la agenda
│
├── supabase/                     # Base de datos versionada
│   ├── migrations/
│   │   └── 0001_init.sql         # esquema inicial (ver sección 3)
│   ├── functions/                # Edge Functions (opcional)
│   │   └── send-reminders/       # recordatorios programados (HU5, pg_cron)
│   └── seed.sql                  # datos de prueba: Luis, el primo, servicios
│
└── docs/
    └── barbados-contexto-proyecto.md  # el documento de contexto del proyecto
```

---

## 2. Variables de entorno (`.env.example`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # solo en el servidor, nunca en el cliente

# WhatsApp (Twilio sandbox en desarrollo)
WHATSAPP_PROVIDER=twilio            # "twilio" | "meta"
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Agente LLM
LLM_PROVIDER=gemini                 # "gemini" | "groq"
LLM_API_KEY=
```

---

## 3. Modelo de datos (núcleo del `0001_init.sql`)

La agenda compartida en Postgres es la **fuente única de verdad** (resuelve D7). Tablas mínimas para arrancar:

| Tabla | Campos clave | Para qué |
|---|---|---|
| `barberos` | id, nombre, activo | Luis y el primo |
| `servicios` | id, nombre, **duracion_min**, activo | Duración real por servicio, no fija (D4, HU6) |
| `clientes` | id, nombre, telefono, ultimo_barbero_id | Datos para reserva rápida del recurrente (HU2) |
| `citas` | id, cliente_id, barbero_id, servicio_id, **inicio**, **fin**, **estado**, **canal** | El corazón del sistema |
| `configuracion` | colchon_min, hora_apertura, hora_cierre | Colchón entre citas separado del corte (D4) |

Valores sugeridos para campos de estado:

- **`estado`**: `pendiente` · `confirmada` · `en_curso` · `completada` · `cancelada` · `no_show`
- **`canal`**: `web` · `whatsapp` · `walkin` — permite medir por dónde entran las reservas y gestionar walk-ins (D3)

> Recuerda el dato real: la mayoría de cortes tardan ~1 h, no 30 min. Carga las `duracion_min` con valores realistas desde el `seed.sql`.

---

## 4. Orden sugerido para construir (roadmap)

Construye de adentro hacia afuera para que cada paso se apoye en el anterior:

1. **Base de datos primero.** Crea el esquema (`0001_init.sql`) y el `seed.sql` con Luis, el primo y los servicios. Sin esto nada funciona.
2. **Reservas en web (HU1).** Listar horarios libres y crear una cita. Aquí ya validas el cálculo de huecos con `buffers.ts`.
3. **Sincronización en tiempo real (HU9).** Conecta Supabase Realtime: que al ocupar un cupo desaparezca al instante en otra pestaña.
4. **Webhook de WhatsApp + agente conversacional (HU4).** Con el sandbox de Twilio, que el agente lea horarios y reserve usando las mismas funciones que la web.
5. **Agente de agenda (HU7, HU8).** Reacomodo por retraso y sugerencia del primo. Empieza con reglas simples.
6. **Recordatorios (HU5)** y **panel de admin (HU13, HU14)**.
7. **Walk-ins (HU11, HU12)** y pulido de la página de marca (HU10).

---

## 5. Notas de diseño importantes

- **Una sola función para reservar.** Tanto la web como el agente de WhatsApp deben llamar a la **misma** lógica de reserva (`lib/agents/.../tools.ts` y `api/bookings`). Así garantizas que nunca haya overbooking (D7).
- **El agente conversacional debe ser acotado.** Su `prompt.ts` lo limita a tareas de la barbería (reservar, consultar, reprogramar). No un asistente abierto — es lo que exige la política de Meta de 2026 y lo que evita problemas.
- **Separa "duración del corte" de "colchón entre citas".** Son dos números distintos en `servicios.duracion_min` y `configuracion.colchon_min`. Esa separación es el primer arreglo real al dolor D4.
- **El agente de agenda empieza sin IA.** Reglas deterministas en `scheduling/`. Más adelante, con histórico real, ajustas las duraciones (HU6.b).
```