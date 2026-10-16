# Plan de trabajo — Manos a la Obra

## Objetivo

Cerrar brechas verificables frente a las instrucciones globales del proyecto, manteniendo el marketplace separado por roles y aprovechando Supabase Realtime. Trabajar por entregas pequeñas, con pruebas y revisión local antes de cada publicación.

## Estado conocido

- La app separa cliente, técnico y administración mediante rutas.
- Usa Supabase Auth, políticas RLS, Storage privado y Realtime.
- El panel de administración es principalmente de consulta.
- No hay todavía una suite automatizada de pruebas ni páginas legales/consentimiento identificadas.
- Las vistas de marketplace consultan varias colecciones sin paginación y hay refrescos Realtime que recargan el estado completo.
- El flujo de pago digital actual es una simulación; no se debe presentar como una transferencia real ni como dinero efectivamente recibido.
- El proyecto ya usa HeroUI y también componentes propios inspirados en Kokonut UI y React Bits.

## Entrega inicial propuesta

1. **Pruebas de seguridad y regresión**
   - Definir una estrategia viable de pruebas para las migraciones y operaciones Supabase existentes.
   - Cubrir acceso anónimo, cliente, técnico y administrador; verificar propiedad, rol y campos permitidos.
   - Añadir pruebas de los flujos críticos existentes antes de ampliar su comportamiento.
2. **Transparencia del pago digital**
   - Identificar todas las pantallas que muestran el pago simulado.
   - Etiquetarlo claramente como demostración/no disponible o deshabilitarlo hasta integrar una pasarela real.
   - No afirmar que se capturó, liquidó o transfirió dinero sin confirmación de un proveedor real.
3. **Escalabilidad de consultas y Realtime**
   - Añadir paginación y límites de servidor a los listados que pueden crecer, empezando por solicitudes/ofertas y administración.
   - Sustituir `select('*')` por columnas necesarias y evitar cargar perfiles o tablas completas.
   - Mantener Realtime acotado a los registros relevantes, con refresco incremental o invalidación por vista.
4. **Seguridad y antiabuso**
   - Revisar autorización de servidor/RLS para cambios de estado, saldo y roles.
   - Añadir límites de frecuencia en autenticación, formularios, búsquedas y subidas, según el punto real de ejecución disponible.
   - Revisar validación de entradas, archivos, cookies y headers de seguridad.
5. **Accesibilidad, calidad y observabilidad**
   - Auditar teclado, foco, semántica, contraste, textos de error, objetivos táctiles y texto alternativo.
   - Incorporar logging de errores sin secretos ni datos personales innecesarios y pruebas de rutas/permisos.
   - Revisar dependencias, licencias y vulnerabilidades; medir rendimiento de consultas antes de optimizar índices o arquitectura.
6. **Privacidad, términos, cookies y reembolsos**
   - Inventariar datos personales, cookies/SDK y flujo de pagos real.
   - Preparar borradores adecuados a Colombia, con consentimiento y preferencias si corresponde.
   - Publicar solo después de recibir identidad legal/comercial, canales de contacto, prácticas reales de retención y condiciones de servicio/reembolso. Solicitar revisión profesional cuando proceda; no inventar declaraciones de cumplimiento.
7. **Analítica respetuosa con el consentimiento**
   - Definir eventos mínimos y objetivos de medición; excluir datos sensibles.
   - Activar analítica no esencial únicamente conforme a las preferencias y al consentimiento aplicable.

## Orden de ejecución

Se propone iniciar por los puntos 1–3: pruebas de permisos/regresión, transparencia de pago y consultas paginadas. Después, abordar endurecimiento de seguridad, accesibilidad/observabilidad y, en paralelo, recopilar los datos reales necesarios para los textos legales. Analítica queda detrás del diseño de consentimiento.

## Criterios de aceptación por entrega

- `lint` y `build` pasan; las pruebas nuevas pasan y cubren los permisos relevantes.
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
