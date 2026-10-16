# Inventario de datos y servicios externos

Revisión del código: 15 de octubre de 2026. Documento interno para preparar el aviso de privacidad y la revisión profesional; no es una política legal ni una afirmación de cumplimiento.

## Datos que el producto procesa

| Grupo | Datos observados en el producto | Dónde se procesan |
|---|---|---|
| Cuenta | Correo de autenticación, nombre visible, rol, fecha de creación; para técnicos también disponibilidad, verificación, calificación y servicios completados | Supabase Auth y Postgres (`profiles`) |
| Solicitud | Categoría, título, descripción, sector, presupuesto, forma de pago declarada, fecha deseada | Postgres (`service_requests`) |
| Ubicación privada | Dirección exacta asociada a la solicitud | Postgres (`request_private_details`), lectura restringida por RLS al cliente propietario y al técnico asignado |
| Adjuntos | Rutas de hasta tres imágenes de soporte; el bucket restringe tamaño y MIME declarados | Supabase Storage privado (`request-photos`); la aplicación genera URLs firmadas de una hora para las rutas consultadas |
| Marketplace | Precio/mensaje de ofertas, asignación, estado y confirmaciones del servicio | Postgres (`offers`, `services`) y Supabase Realtime |
| Saldo | Saldo de técnico y movimientos de comisión/reverso | Postgres (`technician_wallets`, `wallet_transactions`); no equivale a una recarga ni liquidación bancaria real |
| Sesión | Sesión de Supabase persistida por el cliente JavaScript (`persistSession: true`); Supabase JS usa almacenamiento persistente del navegador por defecto | Navegador y Supabase Auth |
| GPS del técnico | Coordenadas exactas y precisión, solo después de conceder permiso; se usan en memoria para centrar el radar y calcular proximidad aproximada | Navegador del técnico; el código revisado no las persiste en Postgres. El proveedor de mapas recibe solicitudes de mosaicos cuya zona permite inferir el área visible |

## Terceros identificados en el código

- **Supabase:** autenticación, Postgres, Storage y Realtime. La URL/API pública se usa desde el navegador con la clave publishable; no se encontró `service_role` en el cliente.
- **Mapbox:** carga de mosaicos de mapa desde `api.mapbox.com`. La clave es pública y debe tener restricciones de URL/uso y límites configurados en Mapbox.
- **Vercel:** alojamiento y despliegue según la configuración del proyecto.
- **Analítica:** no se encontraron SDK ni etiquetas de analítica en `src/` durante esta revisión. Revalidar scripts de Vercel/proveedor antes de publicar el aviso.

## Controles visibles en código

- RLS separa solicitudes, direcciones, ofertas, servicios y saldos por rol/relación.
- El bucket de fotos es privado; el cliente solo recibe URLs firmadas con expiración.
- La sesión es client-side y persistente en el navegador; no hay configuración SSR/cookie `HttpOnly` en el proyecto en este momento.
- No se encontró banner de consentimiento, centro de preferencias, flujo de exportación/eliminación de cuenta ni reglas de retención automatizada.
- El pago digital está identificado como modo de prueba; no se encontró una pasarela ni una liquidación a trabajadores.

## Decisiones que faltan para redactar/publicar documentos

1. Nombre legal/razón social e identificación del responsable, domicilio y correo/canal de privacidad y soporte.
2. Finalidades y bases aplicables para cada grupo de datos, y si se procesan datos de ubicación precisa fuera de la sesión del radar.
3. Plazos de conservación y procedimiento real para solicitudes de consulta, corrección, eliminación y cierre de cuentas.
4. Proveedores y regiones de procesamiento configurados en Supabase, Vercel y Mapbox; subencargados y transferencias internacionales que deban declararse.
5. Decisión sobre analítica, herramientas de soporte, correo/WhatsApp, sus cookies/almacenamiento y el mecanismo de consentimiento correspondiente.
6. Reglas comerciales reales de cancelación, reembolso y disputa; necesarias antes de escribir términos o política de reembolsos.

No usar esta lista para afirmar que el producto satisface obligaciones legales. Los documentos para Colombia requieren completar datos reales y revisión jurídica local antes de publicación.
