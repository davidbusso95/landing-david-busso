# davidbusso.com

Landing page estática (HTML + CSS + JS puro, sin framework). Usa un build script
propio en Node (sin dependencias externas) para no duplicar el header, footer,
botón flotante de WhatsApp y los scripts de tracking (GA4 + Meta Pixel) entre
páginas.

## Estructura

```
/config/whatsapp.js     Número de WhatsApp y mensajes prearmados (única fuente de verdad)
/partials/               Pedazos de HTML compartidos entre páginas
  header.html
  footer.html
  whatsapp-float.html
  tracking-head.html
/src/                     Plantillas fuente de cada página (acá se edita el contenido)
  index.html
  casos.html
build.js                  Genera los HTML finales a partir de /src + /partials
index.html, casos.html    Archivos generados por build.js (NO editar a mano)
css/, js/, assets/        Sin cambios: se sirven tal cual, no pasan por el build
vercel.json               Corre "node build.js" automáticamente en cada deploy
```

## Cómo correr el build

```bash
node build.js
```

Lee `/src/index.html` y `/src/casos.html`, resuelve los `<!-- include:x -->` y
`{{wa:clave}}`, y sobreescribe `index.html` y `casos.html` en la raíz del
proyecto. No requiere `npm install` — `build.js` no tiene dependencias.

En Vercel esto corre solo: `vercel.json` tiene `"buildCommand": "node build.js"`,
así que cada deploy regenera los HTML antes de publicarlos.

**Importante:** no edites `index.html` ni `casos.html` en la raíz directamente
— se pisan la próxima vez que corra el build. Edita siempre los archivos en
`/src/`.

## Cómo funciona el templating

Es intencionalmente simple (dos reemplazos de texto, sin lógica ni loops):

1. **`<!-- include:nombre -->`** — inserta el contenido de `partials/nombre.html`
   tal cual. Se usa para el header, footer, botón flotante y los scripts de
   tracking.

2. **`{{wa:clave}}`** — se reemplaza por el link de WhatsApp completo
   (`https://wa.me/...?text=...`), tomando el número y el mensaje desde
   `config/whatsapp.js` según la clave. Se puede usar en cualquier `href`,
   tanto en `/src/*.html` como dentro de un partial.

3. **`{{token}}`** — cualquier otro token entre llaves dobles se reemplaza por
   un valor definido en `locals` dentro de `build.js`, específico de cada
   página (por ejemplo `{{nav_links}}` o `{{brand_open}}`, que sí varían
   legítimamente entre `index.html` y `casos.html`).

Si un token no está definido en ningún lado, `build.js` corta con un error
explicando qué falta — no falla en silencio.

## Cómo editar el header o el footer (una sola vez)

Editá `partials/header.html` o `partials/footer.html` y corré `node build.js`.
El cambio se aplica automáticamente a todas las páginas que lo incluyan.

Si necesitás agregar un link de navegación que sea distinto por página (como
hoy pasa con "Casos reales" solo en el home, o "Inicio" solo en casos.html),
la lista de links vive en `build.js`, en `HOME_NAV_LINKS` / `CASOS_NAV_LINKS`.

## Cómo cambiar el número de WhatsApp o un mensaje

Editá `config/whatsapp.js`. Ahí vive `PHONE` (el número) y `MESSAGES` (un
mensaje por clave). Ninguna página tiene el número ni el texto hardcodeado:
todas usan `{{wa:clave}}`. Después de editar, corré `node build.js`.

Para agregar un mensaje nuevo:

```js
// config/whatsapp.js
const MESSAGES = {
  // ...
  mi_clave_nueva: 'Hola David, texto del mensaje.',
};
```

Y usalo en el HTML fuente: `href="{{wa:mi_clave_nueva}}"`.

## Cómo agregar una página nueva

1. Creá `src/mi-pagina.html` copiando la estructura de `src/casos.html` como
   base (head + `<!-- include:tracking-head -->` + `<!-- include:header -->`
   + contenido + `<!-- include:whatsapp-float -->` + `<!-- include:footer -->`).
2. Agregá sus `locals` (nav_links, brand_open/close, float_href) en el array
   `PAGES` de `build.js`, junto con un nuevo `src`/`out` apuntando a
   `src/mi-pagina.html` → `mi-pagina.html`.
3. Si la página necesita un link de nav distinto en el header de las otras
   páginas (por ejemplo "Ver caso SaaS"), agregalo a `HOME_NAV_LINKS` y
   `CASOS_NAV_LINKS` en `build.js`.
4. Corré `node build.js` y revisá que `mi-pagina.html` se generó en la raíz.
5. Sumala a `sitemap.xml` si querés que se indexe.

## Cómo agregar un caso nuevo en Casos reales

Los casos siguen siendo bloques de HTML directos en `src/casos.html` (no hay
un sistema de datos/CMS todavía — ver `ANALISIS.md` para ese pendiente).
Copiá un `<article class="real-case">` existente, cambiá el contenido y las
imágenes, y usá `{{wa:cases_generic}}` en el botón de WhatsApp del caso (o
una clave nueva en `config/whatsapp.js` si el mensaje debe ser distinto).
