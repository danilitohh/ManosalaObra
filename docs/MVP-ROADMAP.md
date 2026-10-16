# Manos a la obra — organización del producto

## Objetivo del MVP

Validar el flujo principal del marketplace entre clientes y técnicos independientes en Medellín:

1. El cliente publica una solicitud.
2. Técnicos cercanos revisan el sector general y envían ofertas o contraofertas.
3. El cliente compara propuestas y selecciona un técnico.
4. La plataforma calcula la comisión del 10%.
5. El servicio queda asignado o espera una recarga si el método es efectivo.
6. Una cancelación en efectivo revierte la comisión al saldo del técnico.

## Organización actual del código

```text
src/
├── app/
│   ├── page.tsx                         Entrada de la aplicación
│   ├── layout.tsx                       Metadata y layout raíz
│   └── globals.css                      Estilos globales y tokens visuales
├── components/
│   └── marketplace/
│       └── MarketplaceApp.tsx            Dashboard, modales y flujos de UI
└── lib/
    └── marketplace.ts                   Tipos, datos demo y reglas de negocio
```

La interfaz presenta importes y estados; las operaciones transaccionales y las reglas de comisión se aplican en las funciones SQL de Supabase. `src/lib/marketplace.ts` aporta tipos, formato y cálculos de presentación, no es la autoridad del saldo.

## Reglas de negocio implementadas

- Comisión de administración: `precio pactado × 0.10`.
- Pago en efectivo: descuenta comisión del saldo antes de asignar el servicio.
- Pago digital: asigna el servicio sin tocar el saldo prepago.
- Si el saldo no alcanza en efectivo, la solicitud queda en `awaiting_balance`.
- Al cancelar un servicio de efectivo antes de completarlo, se crea un movimiento `commission_reversal`.
- Al seleccionar una oferta, las demás ofertas de esa solicitud pasan a rechazadas.
- La dirección exacta solo se considera revelada en el servicio asignado.

## Estado actual

### Implementado en el MVP actual

- Vistas separadas de técnico, cliente y administración con rutas independientes.
- Supabase Auth, perfiles de rol y Postgres con RLS.
- Publicación, propuestas, selección, avance, cancelación y reversión de comisión mediante operaciones controladas en la base.
- Storage privado para imágenes y sincronización Realtime.
- Listas principales con paginación y carga de campos limitados.
- Radar con geolocalización del navegador opcional y selección manual de sector.
- El saldo y el pago digital no procesan dinero real; recargas/pagos están deshabilitados o etiquetados como simulación.
- No se encontró persistencia de solicitudes/servicios en `localStorage`; la sesión de Supabase sí es persistente en el navegador.

### Pendiente para robustecer backend y operación

1. Probar la migración de endurecimiento reciente y las pruebas pgTAP en staging.
2. Revisar el modelo de sesión; actualmente la app es client-side y Supabase persiste la sesión en almacenamiento del navegador.
3. Completar verificación operativa de técnicos antes de tratar la insignia como certificación efectiva.
4. Validar radio de 5 km con ubicaciones reales; por privacidad, el backend publica solo el sector general.

### Capa de operación y dinero

1. Definir e implementar validación administrativa de técnicos y certificaciones.
2. Elegir proveedor compatible con PSE/Nequi y probar en sandbox.
3. Diseñar webhooks idempotentes, conciliación, reembolsos y dispersión de fondos.
4. Revisar el ledger de saldos para recargas reales, idempotencia y auditoría.
5. Pagar al técnico solo tras confirmación verificable del proveedor.
6. Completar auditoría de asignaciones, cancelaciones y reversos.

### Capa de producto

1. Notificaciones por correo, WhatsApp o push.
2. Chat entre cliente y técnico después de la asignación.
3. Calificaciones mutuas al completar el servicio.
4. Moderación, reportes y soporte.
5. Panel administrativo con métricas y conciliación.

## Criterio para pasar a producción

No habilitar dinero real hasta probar autorización y migraciones en staging, definir recargas/reembolsos, elegir proveedor, verificar webhooks y conciliar pagos. Completar además textos legales con datos reales del operador y una revisión jurídica local.
