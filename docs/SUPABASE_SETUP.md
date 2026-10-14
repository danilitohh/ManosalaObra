# Supabase: configuración del marketplace

La integración usa Supabase Auth, Postgres, Storage privado y Supabase Realtime. La interfaz no utiliza `localStorage` para compartir solicitudes, ofertas, servicios ni saldos.

## 1. Aplicar el esquema

En el proyecto correcto de Supabase, abre **SQL Editor**, pega y ejecuta el contenido de [`supabase/migrations/20261013000000_marketplace_realtime.sql`](../supabase/migrations/20261013000000_marketplace_realtime.sql). La migración crea las tablas, políticas RLS, funciones transaccionales, el bucket privado de fotos y habilita las tablas públicas necesarias en la publicación `supabase_realtime`.

No crees una política pública general ni desactives RLS. La dirección exacta está separada de la solicitud y solo la puede consultar el cliente propietario y el técnico asignado.

## 2. Configurar Auth

En **Authentication → URL Configuration**, agrega como redirect URLs:

- `http://localhost:3000/cliente`
- `http://localhost:3000/tecnico`
- `https://manosala-obra.vercel.app/cliente`
- `https://manosala-obra.vercel.app/tecnico`

El registro crea cuentas de cliente o técnico según el espacio desde el que se registren. Si Supabase solicita confirmación por correo, confirma el correo y después inicia sesión.

## 3. Configurar variables

Copia `.env.example` a `.env.local` y completa:

- `NEXT_PUBLIC_SUPABASE_URL`: Project URL de **Project Settings → API**.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable key (`sb_publishable_...`) del mismo proyecto.

Agrega esas mismas dos variables a los entornos **Production**, **Preview** y **Development** del proyecto de Vercel y vuelve a desplegar. Nunca uses `service_role`/secret key en variables `NEXT_PUBLIC_*` ni la compartas en el chat.

## 4. Probar Realtime

1. Ejecuta `npm run dev` y abre `/cliente` y `/tecnico` en dos perfiles de navegador diferentes.
2. Registra y confirma una cuenta para cada rol.
3. Publica una solicitud desde cliente: debe aparecer en el radar del técnico sin recargar.
4. Envía una propuesta desde técnico: debe aparecer en la solicitud del cliente sin recargar.
5. Selecciona la propuesta y avanza el servicio; el estado y el saldo deben actualizarse en ambas sesiones.

La interfaz muestra el indicador **En vivo** cuando el canal se suscribe. Si no llega ningún evento, revisa que la migración se ejecutó en el mismo proyecto de las variables y que las tablas aparecen en **Database → Publications → supabase_realtime**.

## Alcance del MVP

El botón de pago digital sigue siendo una simulación y el saldo no admite recargas reales. Antes de usar dinero real hay que integrar una pasarela, verificar sus webhooks y definir el proceso de recarga/reverso. La verificación de técnicos también requiere un proceso operativo antes de mostrar insignias de verificado.
