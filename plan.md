# Proyecto Barbados — Documento de Contexto

> **Propósito de este documento:** servir como fuente de verdad del proyecto. Súbelo al inicio de cualquier conversación nueva para recuperar todo el contexto.
>
> **Última actualización:** Junio 2026

---

## 1. Resumen del negocio

**Barbados** es una barbería con **2 barberos** y **sobredemanda**. Hoy no tiene automatizaciones: todas las reservas se gestionan manualmente vía **WhatsApp**, y con frecuencia llegan clientes de manera repentina (*walk-ins*).

**Problemas centrales hoy:**
- Pérdida de clientes por demora en responder (la sobredemanda satura el chat).
- Poca comodidad al reservar (el cliente depende de que alguien le conteste).
- Conflicto entre el tiempo estimado de reserva y el tiempo real de corte → retrasos en cascada.

**Barberos:**
- **Luis** — barbero **y encargado/administrador** del negocio. Es el más sobredemandado.
- **El primo** — segundo barbero, con capacidad ociosa cuando Luis está saturado.

---

## 2. Objetivo del proyecto

Crear un **sistema web potenciado con agentes inteligentes** que apoye el flujo de trabajo. Consta de dos canales **sincronizados entre sí**:

1. **Página web**, que permite:
   - Mostrar el negocio (personalidad / identidad).
   - Sistema de reservas con visualización de horarios.
   - Sincronización en tiempo real.

2. **Sistema de WhatsApp**, que permite lo mismo que la web mediante un agente conversacional.

Ambos sistemas comparten la **misma agenda en tiempo real** (una sola fuente de verdad).

---

## 3. Actores / Personas

| Actor | Descripción |
|---|---|
| **Cliente recurrente** | Ya conoce la barbería; quiere reservar rápido con "su" barbero (normalmente Luis). |
| **Cliente nuevo** | Llega por recomendación o redes; necesita entender el negocio y reservar sin fricción. |
| **Cliente walk-in** | Llega sin reserva, de manera repentina. |
| **Luis (barbero)** | El más sobredemandado; sufre interrupciones del corte y el retraso en cadena. |
| **Luis (encargado/admin)** | Necesita ver la agenda completa, métricas y configurar el sistema. |
| **El primo (barbero)** | Capacidad ociosa cuando Luis está saturado. |
| **Agentes inteligentes** | Gestionan reservas, responden por WhatsApp y reorganizan la agenda. |

> **Nota sobre Luis:** lleva dos "sombreros". Sus dolores y necesidades cambian según el rol, por eso se separan en las historias de usuario.

---

## 4. Dolores (Pain Points)

| ID | Dolor | Descripción |
|---|---|---|
| **D1** | Saturación de atención por WhatsApp | Toda reserva pasa por chat manual; con sobredemanda las respuestas se demoran. |
| **D2** | Pérdida de clientes por fricción/demora | Si nadie responde a tiempo, el cliente se va con otra barbería. Se pierde la venta por lentitud, no por precio o calidad. |
| **D3** | Walk-ins no gestionados | La gente llega de improviso y no hay forma ordenada de encajarlos sin romper las reservas existentes. |
| **D4** | Estimación rígida y mal calibrada de tiempos | Hoy se usa un margen fijo de ~30 min que *en teoría* incluye colchón, pero **en la práctica la mayoría de cortes tardan ~1 h**. La estimación queda corta casi siempre, lo que produce retraso en cascada en todas las citas posteriores. Además, no distingue tipo de servicio ni el ritmo de cada barbero. |
| **D5** | Carga desbalanceada entre barberos | Luis concentra la demanda mientras el primo tiene huecos; no hay mecanismo que distribuya o sugiera al segundo barbero. |
| **D6** | Falta de visibilidad de disponibilidad | El cliente no puede ver horarios libres por sí mismo; depende de preguntar y esperar respuesta. |
| **D7** | Doble fuente de verdad / desincronización | Riesgo de doble reserva del mismo cupo (overbooking) si web y WhatsApp se manejan por separado. |
| **D8** | Falta de identidad digital | El negocio no tiene un espacio que comunique su personalidad, lo que limita la captación de clientes nuevos. |

### Detalle del estado actual de tiempos (contexto de D4)

> Actualmente la barbería estima los cortes con un margen fijo de **~30 minutos**, que en teoría incluye un colchón entre citas. En la práctica esto **no siempre funciona**: los 30 min aplican solo a algunos casos, mientras que **la mayoría de cortes tardan alrededor de 1 hora**. El resultado es que la estimación por defecto está calibrada a la baja, lo que casi garantiza el retraso acumulado. El problema no es solo que el margen sea fijo, sino que el valor base es poco realista y no separa la *duración del corte* del *colchón entre citas*.

---

## 5. Épicas

| ID | Épica |
|---|---|
| **E1** | Reservas autónomas (web + WhatsApp) |
| **E2** | Asistente conversacional inteligente en WhatsApp |
| **E3** | Gestión inteligente de la agenda y los tiempos |
| **E4** | Sincronización en tiempo real entre canales |
| **E5** | Presencia y personalidad del negocio |
| **E6** | Gestión de walk-ins |
| **E7** | Administración y métricas (Luis como encargado) |

---

## 6. Historias de Usuario

> Formato: *Como [rol], quiero [acción] para [beneficio].*

### E1 — Reservas autónomas (D1, D2, D6)

**HU1.** Como **cliente**, quiero ver los horarios disponibles de cada barbero y reservar yo mismo, para no depender de que alguien me responda por chat.
- El calendario muestra solo cupos realmente libres.
- Puedo elegir barbero, servicio y hora.
- Recibo confirmación inmediata.

**HU2.** Como **cliente recurrente**, quiero reservar con Luis en pocos toques recordando mis datos, para repetir mi corte habitual sin volver a escribir todo.

**HU3.** Como **Luis (barbero)**, quiero que las reservas entren al sistema sin responder manualmente, para dejar de interrumpir el corte para contestar mensajes.

### E2 — Asistente conversacional en WhatsApp (D1, D2)

**HU4.** Como **cliente que solo usa WhatsApp**, quiero escribir al chat y que un agente me muestre horarios y agende la cita, para reservar por el canal que ya uso sin esperar a una persona.
- El agente responde al instante.
- Entiende lenguaje natural (ej. "¿tienen mañana en la tarde?").
- Confirma la reserva en el mismo chat.

**HU5.** Como **cliente**, quiero recibir recordatorio automático de mi cita por WhatsApp, para no olvidarla y reducir las ausencias.

### E3 — Gestión inteligente de tiempos (D4, D5)

**HU6.** Como **encargado**, quiero que cada servicio tenga su propia duración estimada (en lugar de un único margen fijo de 30 min), para que la agenda refleje la realidad.
- Cada servicio tiene su duración base.
- Se separa la *duración del corte* del *colchón entre citas*.
- La duración por defecto refleja que la mayoría de cortes tardan ~1 h, no 30 min.

**HU6.b (visión con agente).** Como **sistema**, quiero aprender de las duraciones reales por barbero y servicio para ir ajustando las estimaciones con el tiempo, en lugar de mantener un valor fijo.

**HU7.** Como **barbero**, quiero marcar "voy retrasado" o indicar que un corte se extendió, y que el agente reacomode las citas siguientes y avise a los afectados, para contener el efecto cascada.
- Al detectarse el retraso, los clientes posteriores reciben aviso con nueva hora estimada.
- Se ofrece reprogramar si el retraso supera un umbral.

**HU8.** Como **agente inteligente**, quiero sugerir al primo cuando Luis está saturado, para equilibrar la carga y no perder clientes por falta de cupo.
- Si Luis no tiene disponibilidad cercana, el sistema propone al primo antes de que el cliente desista.

### E4 — Sincronización en tiempo real (D7)

**HU9.** Como **encargado**, quiero que web y WhatsApp compartan la misma agenda en tiempo real, para que nunca se reserve dos veces el mismo cupo.
- Al ocuparse un horario por cualquier canal, desaparece de inmediato en el otro.
- No existe overbooking.

### E5 — Personalidad del negocio (D8, D2)

**HU10.** Como **cliente nuevo**, quiero ver una página que muestre el estilo, trabajos y personalidad de Barbados, para confiar y decidirme a reservar.

### E6 — Gestión de walk-ins (D3, D4)

**HU11.** Como **cliente walk-in**, quiero ver/registrar el tiempo de espera estimado si llego sin cita, para saber si me conviene esperar o reservar.

**HU12.** Como **barbero**, quiero que el sistema sume al walk-in a la cola sin romper las reservas confirmadas, para atender la demanda espontánea sin perjudicar a quien ya reservó.

### E7 — Administración y métricas (Luis como encargado)

**HU13.** Como **encargado**, quiero ver la ocupación de cada barbero y los clientes perdidos, para tomar decisiones sobre horarios y carga.

**HU14.** Como **encargado**, quiero configurar servicios, duraciones y márgenes desde un panel, para ajustar el sistema sin depender de un técnico.

---

## 7. Matriz Dolor → Historia

| Dolor | Historias que lo atacan |
|---|---|
| D1 Saturación WhatsApp | HU1, HU3, HU4 |
| D2 Pérdida de clientes | HU1, HU4, HU8, HU10 |
| D3 Walk-ins | HU11, HU12 |
| D4 Estimación de tiempos | HU6, HU6.b, HU7, HU12 |
| D5 Carga desbalanceada | HU8 |
| D6 Visibilidad horarios | HU1 |
| D7 Desincronización | HU9 |
| D8 Identidad digital | HU10 |

---

## 8. Evolución de la estimación de tiempos (argumento del agente)

```
HOY                      META                         VISIÓN (agente)
Margen fijo ~30 min  →   Duración por servicio    →   Ajuste automático según
(la mayoría tarda 1h)    + colchón separado           histórico real por barbero
                                                       y servicio
```

Este encuadre justifica que el agente inteligente **no es un adorno**, sino que resuelve una limitación concreta y medible del negocio (D4).

---

## 9. Decisiones pendientes / por afinar

- [ ] **Calibración de duración base:** definir las duraciones reales por tipo de servicio (corte simple, corte + barba, etc.). Dato conocido: la mayoría tarda ~1 h, no 30 min.
- [ ] **Separar corte de colchón:** decidir el tamaño del buffer entre citas, independiente de la duración del corte.
- [ ] **Cálculo del buffer por el agente:** ¿histórico real por barbero/servicio, o un margen fijo más realista al inicio que luego se ajusta?
- [ ] **Umbral de retraso** que dispara aviso/reprogramación automática a clientes posteriores (HU7).
- [ ] **Política de walk-ins:** ¿se priorizan, se intercalan o solo se ofrecen huecos libres? (HU11, HU12).
- [ ] **Alcance del panel de admin** de Luis (qué métricas son imprescindibles en una primera versión).