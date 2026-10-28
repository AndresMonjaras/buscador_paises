# Buscador de Países

Aplicación web para explorar un catálogo de países guardado en Supabase.
El usuario inicia sesión con Google y consulta países, regiones y banderas
desde la base de datos. El catálogo se carga mediante un importador separado
que consume la API de REST Countries y guarda los datos normalizados.

## Tecnologías

- React 19
- Vite
- JavaScript
- CSS
- Supabase PostgreSQL
- Supabase Auth
- `@supabase/supabase-js`
- Node.js
- `dotenv` para el importador de servidor

## Características

- Inicio de sesión con Google mediante Supabase Auth.
- Restauración de sesión al recargar la página.
- Cierre de sesión.
- Catálogo de países leído exclusivamente desde Supabase.
- Búsqueda por nombre común u oficial.
- Filtro por región.
- Paginación de 24 países por página.
- Panel de detalle con nombre oficial, región, subregión, capital y población.
- Estados de carga, error, vacío y datos.
- Diseño responsive para escritorio y móvil.
- Importador idempotente que no duplica información al repetirse.

## Estructura de carpetas

```text
buscador_paises/
├── index.html
├── package.json
├── .env.example
├── scripts/
│   ├── importarPaises.js
│   └── importarPaises.test.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── auth/
│   ├── components/
│   ├── config/
│   ├── pages/
│   ├── services/
│   └── styles/
└── supabase/
    └── schema.sql
```

## Requisitos previos

- Node.js instalado.
- Una cuenta y proyecto en Supabase.
- Credenciales de Google OAuth configuradas en Supabase.

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores.

Variables públicas del frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Variables privadas del importador de Node:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
REST_COUNTRIES_API_KEY=
```

El navegador solo usa las variables con prefijo `VITE_`.
Las claves de servicio y de la API de países se usan únicamente
desde el importador de Node.

## Base de datos

Ejecuta el contenido de `supabase/schema.sql` en el editor SQL de Supabase.
Esto crea la tabla `countries` y habilita Row Level Security.

## Google OAuth

Configura Google OAuth en Google Cloud y Supabase:

1. En Google Cloud, crea un cliente OAuth para una aplicación web.
2. En Supabase, abre Authentication > Providers > Google y habilita el
   proveedor con el Client ID y Client Secret de Google.
3. Copia la URL de callback que muestra Supabase. Tiene este formato:
   `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Agrega esa URL en Google Cloud como URI de redirección autorizada.
5. En Supabase, abre Authentication > URL Configuration y agrega
   `http://localhost:5173` a las URLs de redirección permitidas.
6. Si publicas la aplicación, agrega también su dominio.

El frontend usa `window.location.origin` como URL de retorno. Supabase
debe tener esa dirección en su lista de redirecciones permitidas.

## Ejecutar la aplicación

```bash
npm run dev
```

## Ejecutar las pruebas

```bash
npm test
```

## Compilar para producción

```bash
npm run build
```

## Importar países

Antes de usar la aplicación, carga el catálogo ejecutando:

```bash
npm run importar:paises
```

Este comando consulta REST Countries mediante el importador de Node
y guarda los países en Supabase. Se puede repetir sin duplicar información.

## Notas de seguridad

- No se exponen claves administrativas en el código del navegador.
- El frontend consulta exclusivamente los datos almacenados en Supabase.
- El archivo `.env` está ignorado por Git.
