# Tareas — Manos a la Obra

## Próximo

- [x] Revisar y aprobar `tasks/plan.md` antes de implementar.
- [x] Elegir pgTAP y escribir pruebas de regresión para autorización/RLS por rol; falta ejecutarlas con una instancia local Supabase.
- [x] Etiquetar el flujo de pago digital simulado para que no parezca un cobro real.
- [x] Añadir paginación server-side de solicitudes de cliente/técnico y de cuentas/solicitudes admin, con conteos reales en métricas.
- [ ] Añadir navegación por páginas para ofertas, servicios y movimientos si los volúmenes reales lo requieren; hoy tienen límites de lectura.
- [x] Reducir columnas consultadas y limitar filas en las consultas principales.
- [x] Agrupar eventos de Realtime en ventanas de 300 ms, evitar una recarga duplicada al conectar y mantener la suscripción estable al cambiar la página de solicitudes.
- [ ] Sustituir el refresco completo por consultas de la entidad afectada; instrumentar llamadas para comprobar el ahorro y evitar consultas N+1.
- [ ] Añadir paginación de ofertas, servicios y movimientos cuando el volumen real supere los límites visibles actuales.

## Después

- [ ] Auditar autorización, validación, rate limiting, subida de archivos, sesión y headers.
- [ ] Completar pruebas de rutas, roles, errores y flujos críticos; configurar observabilidad segura.
- [ ] Auditar accesibilidad y regresiones visuales en desktop/móvil.
- [ ] Revisar dependencias, licencias, vulnerabilidades y rendimiento con mediciones.
- [ ] Inventariar cookies, SDK y datos antes de diseñar consentimiento y analítica.
- [ ] Redactar borradores de privacidad, términos, cookies y reembolsos al recibir los datos reales del negocio.

## Bloqueado por información/decisión del propietario

- [ ] Identidad/contacto y prácticas reales para completar textos legales y de soporte.
- [ ] Proveedor y condiciones de pago para sustituir la simulación por pagos reales.
- [ ] Instancia local/configuración Supabase CLI y Docker para ejecutar `supabase test db` sobre las pruebas pgTAP.
