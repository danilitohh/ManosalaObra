# Supabase: configuración del marketplace

La integración usa Supabase Auth, Postgres, Storage privado y Supabase Realtime. La interfaz no utiliza `localStorage` para compartir solicitudes, ofertas, servicios ni saldos.

## 1. Probar primero en local

Instala y arranca Docker Desktop, después ejecuta desde la raíz:

```bash
npm run db:start
npm run test:db
```

Esto usa `supabase/config.toml`, aplica las migraciones en la base local y ejecuta pgTAP. Si falla, resuelve los errores antes de aplicar cambios fuera del entorno local.

## 2. Aplicar el esquema

Las migraciones están ordenadas por fecha: marketplace/Realtime, rol admin y endurecimiento de seguridad. Para una base nueva se deben aplicar en ese orden. En la base ya existente, no vuelvas a ejecutar a ciegas la migración inicial ni la de admin: revisa la versión aplicada y aplica solo la pendiente después de validar localmente. La migración más reciente revoca inserciones directas en tres tablas y exige que solicitudes se creen con la RPC validada.

No crees una política pública general ni desactives RLS. La dirección exacta está separada de la solicitud y solo la puede consultar el cliente propietario y el técnico asignado.

## 3. Crear la cuenta de administrador propietario

1. Registra tu cuenta desde el acceso común como cliente o técnico y confirma el correo.
2. Ejecuta [`20261014000000_admin_role.sql`](../supabase/migrations/20261014000000_admin_role.sql) en el SQL Editor. Esta migración permite el rol `admin`, actualiza RLS y mantiene la asignación fuera del registro público.
3. En el SQL Editor, reemplaza el correo de ejemplo por el correo exacto de tu cuenta y ejecuta:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('tu-correo@ejemplo.com')
returning p.id, p.display_name, p.role;
```

Debe devolver una fila con `role = admin`. Si no devuelve filas, primero registra esa cuenta y confirma el correo. Después inicia sesión de nuevo: el acceso único te enviará a `/admin`. No agregues `admin` a las opciones públicas de registro ni asignes el rol desde el navegador.

## 4. Configurar Auth

En **Authentication → URL Configuration**, agrega como redirect URLs:

- `http://localhost:3000/cliente`
- `http://localhost:3000/tecnico`
- `http://localhost:3000/`
- `https://manosala-obra.vercel.app/cliente`
- `https://manosala-obra.vercel.app/tecnico`
- `https://manosala-obra.vercel.app/`

El registro crea cuentas de cliente o técnico según el espacio desde el que se registren. Si Supabase solicita confirmación por correo, confirma el correo y después inicia sesión.

## 5. Configurar variables

Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL de **Project Settings → API**.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key (`sb_publishable_...`) del mismo proyecto.

Agrega esas mismas dos variables a los entornos **Production**, **Preview** y **Development** del proyecto de Vercel y vuelve a desplegar. Nunca uses `service_role`/secret key en variables `NEXT_PUBLIC_*` ni la compartas en el chat.

## 6. Probar Realtime

1. Ejecuta `npm run dev` y abre `/cliente` y `/tecnico` en dos perfiles de navegador diferentes.
2. Registra y confirma una cuenta para cada rol.
3. Publica una solicitud desde cliente: debe aparecer en el radar del técnico sin recargar.
4. Envía una propuesta desde técnico: debe aparecer en la solicitud del cliente sin recargar.
5. Selecciona la propuesta y avanza el servicio; el estado y el saldo deben actualizarse en ambas sesiones.

La interfaz muestra el indicador **En vivo** cuando el canal se suscribe. Si no llega ningún evento, revisa que la migración se ejecutó en el mismo proyecto de las variables y que las tablas aparecen en **Database → Publications → supabase_realtime**.

## Alcance del MVP

El botón de pago digital sigue siendo una simulación y el saldo no admite recargas reales. Antes de usar dinero real hay que integrar una pasarela, verificar sus webhooks y definir el proceso de recarga/reverso. La verificación de técnicos también requiere un proceso operativo antes de mostrar insignias de verificado.
