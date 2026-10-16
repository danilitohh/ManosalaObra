# Tareas — Manos a la Obra

## Próximo

- [x] Revisar y aprobar `tasks/plan.md` antes de implementar.
- [x] Elegir pgTAP y escribir pruebas de regresión para autorización/RLS por rol; falta ejecutarlas con una instancia local Supabase.
- [x] Etiquetar el flujo de pago digital simulado para que no parezca un cobro real.
- [x] Añadir paginación server-side de solicitudes de cliente/técnico y de cuentas/solicitudes admin, con conteos reales en métricas.
- [x] Añadir paginación por páginas para propuestas por solicitud, servicios y movimientos de saldo.
- [x] Reducir columnas consultadas y limitar filas en las consultas principales.
- [x] Agrupar eventos de Realtime en ventanas de 300 ms, evitar una recarga duplicada al conectar y mantener la suscripción estable al cambiar la página de solicitudes.
- [x] Sustituir las recargas completas por consultas puntuales de los IDs afectados en eventos de Realtime; reconciliar el estado completo al reconectar.

## Después

- [x] Auditar autorización, validación, rate limiting, subida de archivos, sesión y headers (migración local pendiente de aplicar; autenticación usa los límites administrados de Supabase).
- [ ] Completar pruebas de rutas, roles, errores y flujos críticos; configurar observabilidad segura.
- [x] Corregir semántica, Escape, foco inicial, ciclo de foco y restauración de foco en los diálogos; falta validación manual con lector de pantalla y móvil.
- [x] Añadir headers de seguridad y CSP compatible con el mapa y Supabase; `unsafe-inline` sigue siendo una concesión pendiente de migrar a nonce.
- [ ] Revisar dependencias, licencias, vulnerabilidades y rendimiento con mediciones. `npm audit --omit=dev`: 0; audit completo: 5 avisos altos de `braces` en el toolchain de ESLint, sin parche compatible disponible y con propuesta forzada de downgrade mayor.
- [ ] Inventariar cookies, SDK y datos antes de diseñar consentimiento y analítica.
- [ ] Redactar borradores de privacidad, términos, cookies y reembolsos al recibir los datos reales del negocio.

## Bloqueado por información/decisión del propietario

- [ ] Identidad/contacto y prácticas reales para completar textos legales y de soporte.
- [ ] Proveedor y condiciones de pago para sustituir la simulación por pagos reales.
- [ ] Instancia local/configuración Supabase CLI y Docker para ejecutar `supabase test db` sobre las pruebas pgTAP.
- [ ] Aplicar y verificar la nueva migración de seguridad en una instancia local/staging antes de producción.
- [ ] Configurar y comprobar límites administrados de Supabase Auth y protección contra contraseñas filtradas en el Dashboard.
- [ ] Migrar la sesión de `localStorage` del cliente a cookies protegidas si se adopta SSR/Proxy; hoy la app es client-side y la base de datos sigue siendo el control de acceso.
