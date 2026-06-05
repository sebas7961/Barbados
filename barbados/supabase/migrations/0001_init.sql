-- ============================================================
-- Barbados — Schema inicial
-- Fuente única de verdad para web y WhatsApp (D7)
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ── Barberos ─────────────────────────────────────────────────
create table barberos (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true
);

-- ── Servicios ────────────────────────────────────────────────
-- duracion_min = tiempo real del corte (D4: la mayoría ~60 min, NO 30)
-- NO incluye el colchón entre citas — ese vive en configuracion.colchon_min
create table servicios (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  duracion_min integer not null check (duracion_min > 0),
  activo       boolean not null default true
);

-- ── Clientes ─────────────────────────────────────────────────
create table clientes (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  telefono            text not null unique,
  ultimo_barbero_id   uuid references barberos(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- ── Citas ────────────────────────────────────────────────────
-- fin = inicio + duracion_min + colchon_min (calculado al insertar)
-- canal permite medir de dónde vienen las reservas (D3)
create type estado_cita as enum (
  'pendiente', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_show'
);

create type canal_cita as enum ('web', 'whatsapp', 'walkin');

create table citas (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references clientes(id) on delete cascade,
  barbero_id  uuid not null references barberos(id) on delete restrict,
  servicio_id uuid not null references servicios(id) on delete restrict,
  inicio      timestamptz not null,
  fin         timestamptz not null,
  estado      estado_cita not null default 'pendiente',
  canal       canal_cita  not null default 'web',
  created_at  timestamptz not null default now(),
  -- Garantiza que no haya overbooking para el mismo barbero (D7)
  constraint no_overbooking exclude using gist (
    barbero_id with =,
    tstzrange(inicio, fin, '[)') with &&
  ) where (estado not in ('cancelada', 'no_show'))
);

-- Índices frecuentes
create index idx_citas_barbero_inicio on citas (barbero_id, inicio);
create index idx_citas_cliente      on citas (cliente_id);
create index idx_citas_estado       on citas (estado);

-- ── Configuración global ─────────────────────────────────────
-- colchon_min se separa de duracion_min para resolver D4
create table configuracion (
  id             integer primary key default 1 check (id = 1), -- singleton
  colchon_min    integer not null default 10 check (colchon_min >= 0),
  hora_apertura  time    not null default '09:00',
  hora_cierre    time    not null default '20:00'
);

insert into configuracion (colchon_min, hora_apertura, hora_cierre)
values (10, '09:00', '20:00');

-- ── RLS (Row Level Security) ─────────────────────────────────
alter table barberos      enable row level security;
alter table servicios     enable row level security;
alter table clientes      enable row level security;
alter table citas         enable row level security;
alter table configuracion enable row level security;

-- Lectura pública para barberos y servicios (necesario en la web de reservas)
create policy "barberos_public_read"  on barberos  for select using (activo = true);
create policy "servicios_public_read" on servicios for select using (activo = true);

-- Configuración solo legible por server (service role bypass RLS)
create policy "config_public_read" on configuracion for select using (true);
