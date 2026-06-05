# Barbados

Sistema de reservas para barbería potenciado con agentes inteligentes.

**Stack:** Next.js 14 · TypeScript · Tailwind · shadcn/ui · Supabase · WhatsApp (Twilio/Meta) · LLM (Gemini/Groq)

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# 3. Aplicar schema en Supabase
# Dashboard → SQL Editor → pegar supabase/migrations/0001_init.sql
# Luego pegar supabase/seed.sql

# 4. Levantar el servidor
npm run dev
```

## Estructura

```
src/
  app/              # Rutas Next.js App Router
  lib/
    supabase/       # Cliente browser + servidor + realtime
    whatsapp/       # Abstracción Twilio/Meta
    agents/
      conversational/  # Agente LLM (HU4)
      scheduling/      # Reglas de agenda: buffers, cascada, balance (HU6-8)
  types/            # Tipos compartidos TypeScript
  hooks/            # useRealtimeAgenda
supabase/
  migrations/       # Schema SQL versionado
  seed.sql          # Datos de prueba
```

## Roadmap

Ver `../plan.md` y `../arquitectura.md` para el contexto completo del negocio y el orden de construcción.
