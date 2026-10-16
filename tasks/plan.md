# Plan de trabajo — Manos a la Obra

## Objetivo

Cerrar brechas verificables frente a las instrucciones globales del proyecto, manteniendo el marketplace separado por roles y aprovechando Supabase Realtime. Trabajar por entregas pequeñas, con pruebas y revisión local antes de cada publicación.

## Estado conocido

- La app separa cliente, técnico y administración mediante rutas, usa Supabase Auth, políticas RLS, Storage privado y Realtime.
- El panel de administración sigue siendo principalmente de consulta; el control de la aplicación no es autorización de servidor para las tablas: RLS es la frontera de datos.
- Las consultas del marketplace y del panel ya tienen límites/paginación, y los eventos Realtime se reconcilian por IDs.
- Hay pruebas pgTAP de RLS; se ampliaron con comprobaciones de privilegios. No se pudieron ejecutar porque el entorno no tiene Supabase CLI, Docker ni `psql`.
- Se añadió una migración de endurecimiento local para limitar publicaciones/propuestas, validar entrada en servidor y centralizar escrituras; debe probarse primero en una base local/staging y aún no está aplicada.
- Los diálogos ahora anuncian el rol, gestionan Escape, foco inicial, ciclo de foco y restauración; falta auditoría manual con lector de pantalla/dispositivo móvil.
- Se añadieron CSP y encabezados HTTP de seguridad. La CSP permite estilos/scripts inline por compatibilidad de Next actual; conviene evolucionarla a nonce después de migrar a renderizado dinámico.
- El flujo digital es una simulación. No se deben presentar cobros o transferencias reales sin integrar y validar una pasarela.
- No hay páginas legales publicables ni analítica: faltan datos reales del operador y definición verificada de tratamiento/retención y consentimiento.
- `npm audit --omit=dev` reporta cero vulnerabilidades; el audit completo detecta cinco avisos altos en `braces` dentro del toolchain de ESLint, sin parche compatible disponible en el registro consultado (el fix forzado degradaría `eslint-config-next` a v14).

## Entregas realizadas / por validar

1. **Seguridad local** — migración de rate limit, validación y privilegios añadida; pendiente ejecutar y revisar con datos de prueba fuera de producción.
2. **Pruebas** — pgTAP existente ampliado; pendiente obtener entorno local/staging para ejecutarlas.
3. **UI** — diálogos accesibles en teclado y encabezados configurados; requiere revisión manual de lectores de pantalla y compatibilidad CSP en los navegadores objetivo.
4. **Dependencias** — audit completo detectó riesgo únicamente en herramienta de desarrollo (braces); no forzar degradación mayor. Production-only audit limpio.
5. **Observabilidad, rendimiento y licencias** — aún falta definir proveedor/eventos y recopilar métricas representativas antes de hacer cambios de arquitectura.
6. **Legal y consentimiento** — no publicar textos hasta conocer identidad, contacto y prácticas reales; dejarlo como requisito previo a lanzamiento público.
7. **Pagos reales** — requiere proveedor, reglas de liquidación/reembolso y credenciales de sandbox/prod; ahora continúa como simulación.

## Criterios de aceptación por entrega

- `lint` y `build` pasan; en esta entrega ambos pasan. `npm audit --omit=dev` pasa sin hallazgos; la suite pgTAP sigue pendiente de ejecutarse.
- Los cambios no exponen direcciones exactas, claves privadas, información interna ni datos ajenos al usuario.
- Los listados consultan solo los campos necesarios y tienen límites/paginación en el servidor.
- Estados de pago reflejan únicamente hechos confirmados por una integración real; las simulaciones se etiquetan como tales.
- Se prueba la UI en móvil y escritorio y con teclado; cualquier limitación pendiente queda documentada.
- Antes de publicar: revisar diff y estado del repositorio, crear commit en `main` y hacer push a `origin/main`, según la instrucción del propietario. No reescribir historia compartida ni forzar el push.

## Decisiones/bloqueos que requieren al propietario

- Confirmar este orden antes de implementar, según el flujo de trabajo de planificación.
- Para textos legales: nombre/razón social, identificación y jurisdicción del operador, dirección/canal de contacto y soporte, tratamiento/retención de datos, proveedores usados y política comercial real de cancelación/reembolso.
- Para un cobro digital real: proveedor de pagos, cuentas de liquidación, reglas de reembolso y confirmación de que se autoriza integrar el flujo. No simular estos datos.

## Fuera de alcance por ahora

- No se crean credenciales administrativas ni se exponen secretos.
- No se ejecutan migraciones en producción, no se cambian roles/datos reales y no se habilitan cobros reales sin revisión y autorización específica.
- No se publica texto legal como asesoría o garantía de cumplimiento.
