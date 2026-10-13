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

La interfaz no calcula reglas financieras por su cuenta: las reglas principales viven en `src/lib/marketplace.ts`. Esto permite reemplazar la persistencia local por una base de datos sin cambiar el contrato de la interfaz.

## Reglas de negocio implementadas

- Comisión de administración: `precio pactado × 0.10`.
- Pago en efectivo: descuenta comisión del saldo antes de asignar el servicio.
- Pago digital: asigna el servicio sin tocar el saldo prepago.
- Si el saldo no alcanza en efectivo, la solicitud queda en `awaiting_balance`.
- Al cancelar un servicio de efectivo antes de completarlo, se crea un movimiento `commission_reversal`.
- Al seleccionar una oferta, las demás ofertas de esa solicitud pasan a rechazadas.
- La dirección exacta solo se considera revelada en el servicio asignado.

## Estado actual

### Implementado en modo demo local

- Vista de técnico y vista de cliente.
- Publicación real de solicitudes desde un formulario.
- Filtros por categoría.
- Ofertas y contraofertas.
- Comparación de ofertas.
- Selección de técnico.
- Cálculo de comisión y pago neto del técnico.
- Saldo prepago y movimientos.
- Recarga demo.
- Cancelación y reversión de comisión.
- Persistencia con `localStorage`.
- Navegación por radar, servicios, mensajes, saldo, solicitudes y pagos.

### Próxima capa: backend real

1. Autenticación y autorización por rol.
2. PostgreSQL y una capa de acceso a datos en servidor.
3. Tablas para usuarios, solicitudes, ofertas, servicios, saldos, movimientos y calificaciones.
4. Route Handlers o Server Actions con validación de sesión en cada mutación.
5. Almacenamiento privado para fotos y videos.
6. Geolocalización real y filtro por radio de 5 km.

### Capa de operación y dinero

1. Validación administrativa de técnicos y certificaciones.
2. Integración con proveedor de pagos compatible con PSE y Nequi.
3. Webhooks idempotentes para recargas y pagos.
4. Ledger inmutable para el saldo prepago.
5. Pago digital del 90% al técnico después de la confirmación del proveedor.
6. Registro de auditoría para asignaciones, cancelaciones y reversos.

### Capa de producto

1. Notificaciones por correo, WhatsApp o push.
2. Chat entre cliente y técnico después de la asignación.
3. Calificaciones mutuas al completar el servicio.
4. Moderación, reportes y soporte.
5. Panel administrativo con métricas y conciliación.

## Criterio para pasar a producción

El MVP no debe conectarse a dinero real hasta que existan autenticación, autorización de servidor, persistencia transaccional, webhooks verificados y un proveedor de pagos seleccionado. `localStorage` es únicamente para validar experiencia y flujo de producto.
