-- ============================================================
-- Barbados — Datos de prueba
-- Ejecutar después de 0001_init.sql
-- ============================================================

-- Barberos
insert into barberos (id, nombre, activo) values
  ('11111111-0000-0000-0000-000000000001', 'Luis',      true),
  ('11111111-0000-0000-0000-000000000002', 'El primo',  true);

-- Servicios
-- Duraciones realistas: la mayoría de cortes tardan ~60 min (contexto D4)
-- NO usar 30 min como valor base — ese es el error original del negocio
insert into servicios (id, nombre, duracion_min, activo) values
  ('22222222-0000-0000-0000-000000000001', 'Corte de cabello',        60, true),
  ('22222222-0000-0000-0000-000000000002', 'Corte + arreglo de barba', 75, true),
  ('22222222-0000-0000-0000-000000000003', 'Afeitado con navaja',     45, true),
  ('22222222-0000-0000-0000-000000000004', 'Corte infantil',          45, true);

-- Clientes de prueba
insert into clientes (id, nombre, telefono, ultimo_barbero_id) values
  ('33333333-0000-0000-0000-000000000001', 'Carlos Pérez',    '+521234567890', '11111111-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000002', 'Andrés Gómez',   '+529876543210', '11111111-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000003', 'Miguel Ruiz',    '+521122334455', '11111111-0000-0000-0000-000000000002');

-- Citas de ejemplo (fecha relativa: ajusta según tu zona horaria en pruebas)
-- Usa timestamps absolutos al cargar contra una instancia real de Supabase
