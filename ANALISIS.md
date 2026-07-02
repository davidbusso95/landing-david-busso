# Análisis técnico — davidbusso.com

Diagnóstico del estado actual del proyecto. No se modificó ningún archivo; este documento es solo para preparar decisiones de rediseño, conversión y contenido.

---

## 1. Estructura del proyecto

**Stack:** HTML + CSS + JS puro (vanilla). No hay framework (React, Vue, etc.), no hay generador estático (Astro, Eleventy, etc.) y no hay build process ni `package.json`. Es un sitio 100% estático escrito a mano.

**Organización de archivos:**
```
/
├── index.html        # Landing principal (home)
├── casos.html         # Página de portfolio ("casos reales")
├── css/style.css      # Único archivo de estilos (todo el sitio, ~980 líneas)
├── js/script.js       # Único archivo JS (tracking, lightbox, menú mobile)
├── assets/
│   ├── favicon.png
│   ├── og-image.png
│   └── casos/          # 20 capturas PNG (~1MB c/u) usadas en casos.html
├── robots.txt
├── sitemap.xml
└── vercel.json         # Solo define headers de seguridad HTTP
```

No hay carpeta de "componentes": el header, footer, botón flotante de WhatsApp y el script de tracking están **duplicados manualmente** en `index.html` y `casos.html` (HTML, Google Analytics, Meta Pixel, SVG del ícono de WhatsApp, todo copiado y pegado en ambos archivos).

**Despliegue:** Hosting en **Vercel** (repo GitHub `davidbusso95/landing-david-busso`, conectado por `vercel.json`). No hay build step: Vercel sirve los archivos estáticos tal cual. Cualquier cambio a `main` se despliega automáticamente. `vercel.json` solo configura headers de seguridad (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) — no hay redirects, rewrites ni configuración de caché de assets.

---

## 2. Formulario de contacto

**Ubicación:** `index.html`, sección `#contacto` (líneas 516–564).

**Dónde envía los datos:** `action="https://formspree.io/f/mojbkdgj"` (servicio externo Formspree, plan gratuito por lo que se ve — no hay backend propio). Verifiqué que el endpoint existe y responde (405 ante GET, comportamiento esperado de un endpoint POST-only activo).

**Validación:**
- **Client-side:** sí, básica vía atributos HTML nativos (`required`, `type="email"`). No hay JS de validación adicional (formato de teléfono, longitud de mensaje, etc.).
- **Server-side:** delegada completamente a Formspree (que valida email y aplica su propio filtro anti-spam).
- **Anti-spam:** honeypot implementado correctamente (`_gotcha` + campo oculto fuera de pantalla), buena práctica.

**Notificaciones:** Formspree por defecto envía un email al dueño de la cuenta cuando llega una submission. No hay forma de confirmar desde el código si esa notificación está activa/configurada correctamente — eso vive en el dashboard de Formspree, no en el repo.

**⚠️ Punto crítico detectado — falta página de confirmación (`_next`):**
El formulario no define el campo oculto `_next` (ni `data-thankyou-url`), que es lo que le dice a Formspree a dónde redirigir después de un envío exitoso. Resultado: cuando alguien completa el formulario, **es redirigido fuera del sitio** a la página de agradecimiento genérica y sin marca de Formspree, en vez de ver una confirmación propia (o quedarse en la página con un mensaje de éxito vía AJAX). Esto:
- Rompe la experiencia justo en el momento de conversión.
- Hace más difícil trackear el "thank you" como evento de conversión confirmado en GA4/Meta Pixel (el evento `generate_lead` se dispara al hacer click en "Enviar", *antes* de confirmar que Formspree aceptó el envío — ver `js/script.js:154-164`. Si Formspree rechaza el envío por algún motivo, igual se cuenta como lead en analytics).

Esto no significa que el formulario esté roto (el endpoint responde y probablemente funciona), pero sí que la notificación al usuario y la medición de conversión tienen puntos débiles reales.

---

## 3. CTAs y enlaces a WhatsApp

Todos apuntan al mismo número: `wa.me/5493513048123`. Cada uno tiene tracking (`data-track-contact` + `data-track-label`) que dispara `fbq('track','Contact')` y un evento `click_whatsapp` en GA4 (`js/script.js:5-18`).

| # | Sección | Texto del botón | Mensaje prearmado |
|---|---------|------------------|---------------------|
| 1 | Hero | "Quiero una solución para mi negocio" | "Hola David, necesito una solución digital para mi negocio." |
| 2 | Servicios → Automatización + IA | "Ver automatizaciones" | "Hola David, quiero automatizar un proceso." |
| 3 | Servicios → Landing/Web | "Ver sitios web" | "Hola David, necesito una landing para captar clientes." |
| 4 | Servicios → Landing/Web (secundario) | "Consultar WordPress" | "Hola David, quiero crear o mejorar una web." |
| 5 | Servicios → Mantenimiento | "Solicitar revisión" | "Hola David, tengo una web funcionando y quiero revisarla." |
| 6 | Servicios → Asesoramiento | "Pedir orientación" | "Hola David, necesito orientación para definir una solución digital." |
| 7 | Mantenimiento (sección completa) | "Quiero revisar mi sistema actual" | "Hola David, tengo una web funcionando y quiero revisarla." (mismo msj que #5) |
| 8 | Botón flotante (index.html) | Ícono WhatsApp | "Hola David, quiero automatizar un proceso." (mismo msj que #2) |
| 9 | casos.html → cada caso (x4) | "Consultar por una solución similar" | "Hola David, vi tus casos reales y quiero consultarte por una automatización" (idéntico en los 4 casos) |
| 10 | casos.html → CTA final | "Consultar por WhatsApp" | mismo que #9 |
| 11 | Botón flotante (casos.html) | Ícono WhatsApp | "Hola David, quiero consultarte por una automatización" |

**Observación:** hay buena segmentación de mensaje por sección de servicios (bien pensado para saber de dónde viene el lead al leer el chat), pero en `casos.html` los 4 casos comparten el mismo mensaje genérico — se pierde la oportunidad de identificar por WhatsApp *qué caso específico* despertó el interés (fácil de mejorar: mensaje con el nombre del caso).

---

## 4. Sección de casos/proyectos

**Estructura de datos:** 100% hardcodeada en HTML. Cada caso es un bloque `<article class="real-case">` repetido manualmente en `casos.html` con: categoría, título, descripción, problema resuelto, chips de tecnología, resultado, botón CTA y una galería de 4 imágenes (1 principal + 3 miniaturas). No hay JSON, no hay CMS, no hay separación entre contenido y presentación.

**Agregar un caso nuevo hoy** implica:
1. Duplicar manualmente ~90 líneas de HTML de un `<article>` completo.
2. Subir las imágenes a `assets/casos/` sin ningún paso de optimización (comprimir/redimensionar es responsabilidad 100% manual, y hoy no se está haciendo — ver punto 5).
3. Editar a mano `sitemap.xml` si se quisiera indexar como URL propia (hoy no aplica, es todo una sola página).
4. No hay validación de que las imágenes tengan el tamaño/aspect-ratio correcto — si son muy distintas a 16:10 quedan recortadas por `object-fit: cover`.

Es viable pero tedioso y propenso a errores de copy-paste (de hecho ya hay un caso "Pack reputación IA" comentado en el HTML — líneas 454-529 de `casos.html` — oculto hasta tener autorización del cliente, con sus 4 imágenes de `assets/casos/resenas-*.png` **ya subidas pero sin usarse**, ~4MB muertos en el repo).

**Optimización de imágenes:** ninguna.
- Todas las 20 imágenes de casos son PNG sin comprimir, pesando entre **830KB y 1.5MB cada una** (carpeta `assets/casos/` completa: **22MB**).
- No hay conversión a WebP/AVIF, no hay versiones responsive (`srcset`), no hay compresión.
- Si tuviera que abrir `casos.html` y cargar todas las imágenes visibles (galería principal de 4 casos + miniaturas), son varios MB solo de imágenes.
- Sí usan `loading="lazy"` en todas las imágenes de casos (buena práctica ya aplicada) y `aspect-ratio` fijo en CSS para evitar salto de layout (CLS) — esas dos cosas están bien resueltas.
- `og-image.png` pesa **1.6MB** y mide 1727×911px, pero está declarado en las meta tags como 1200×630 — esto es indexado/leído solo cuando se comparte el link (no afecta la carga normal de la página), pero igual conviene comprimirlo y ajustarlo al tamaño real declarado.

---

## 5. SEO y Performance

**Meta tags (ambas páginas: `index.html` y `casos.html`):**
- `title`, `meta description`, `canonical` — presentes y bien diferenciados entre páginas.
- Open Graph completo (`og:type`, `og:title`, `og:description`, `og:url`, `og:image` con width/height, `og:locale`).
- Twitter Card (`summary_large_image`) completo.
- Favicon PNG.
- Solo `index.html` tiene JSON-LD (`Schema.org` tipo `ProfessionalService`) — `casos.html` no tiene structured data propia (podría beneficiarse de `BreadcrumbList` o listar los casos como `ItemList`/`CreativeWork`).

**Sitemap y robots:**
- `robots.txt` presente, simple y correcto (`Allow: /` + referencia al sitemap).
- `sitemap.xml` presente, pero solo con 2 URLs (home y casos.html) — correcto dado que solo hay 2 páginas, pero no tiene `<lastmod>`, lo cual es una mejora menor.

**Problemas de performance evidentes:**
1. **Imágenes sin optimizar** (ya detallado en punto 4) — es el problema de performance más grande del sitio, especialmente en `casos.html`.
2. **CSS y JS sin minificar** — `style.css` (~15.7KB) y `script.js` (~5KB) se sirven tal cual, sin minificar ni con hash de cache-busting en el nombre de archivo. El impacto es menor comparado con las imágenes (son archivos chicos), pero es una optimización gratuita si en algún momento se agrega un build step.
3. **Sin lazy loading en `og-image.png` ni en el favicon** — no aplica igual porque no se cargan en el body.
4. **Carga de terceros en el `<head>` sin `defer`/`async` completo:** el script de Google Analytics usa `async` (bien), pero el script inline de Meta Pixel se ejecuta de forma bloqueante apenas se parsea (patrón estándar de Meta, pero sigue siendo JS bloqueante temprano en el head).
5. **Falta `width`/`height` explícitos en las etiquetas `<img>`** de `casos.html` (se maneja vía CSS `aspect-ratio`, lo cual mitiga el problema de CLS pero no es la técnica más robusta/estándar).

**Headings:** jerarquía correcta en general.
- `index.html`: un solo `<h1>` (hero), `<h2>` por sección (Servicios, Casos, Mantenimiento, Contacto), `<h3>` dentro de cards. Bien estructurado.
- `casos.html`: un `<h1>` en el hero, `<h2>` por cada caso (correcto — cada caso es como una "mini página"), `<h3>` para "Problema resuelto"/"Resultado conseguido". Bien estructurado también.

---

## 6. Responsive y accesibilidad

**Breakpoints:** hay 3 breakpoints claros y bien pensados (`1080px`, `880px`, `420px`), no es un diseño frágil. El grid pasa de 4→2→1 columnas según el ancho, el menú se convierte en hamburguesa a partir de 880px, y hay ajustes finos de tipografía/padding en el breakpoint de 420px para celulares chicos.

**Cosas bien resueltas:**
- Botones se hacen `width: 100%` en mobile (buena práctica táctil).
- El menú mobile tiene manejo de `aria-expanded`, `aria-label` dinámico y cierre con `Escape`.
- El lightbox de imágenes tiene `role="dialog"`, `aria-modal="true"`, y cierre con `Escape` y click fuera.
- Todas las imágenes de casos tienen `alt` descriptivo y específico (no genérico tipo "imagen1.png") — esto está muy bien hecho.
- `:focus-visible` está estilado globalmente para todos los elementos interactivos (accesibilidad de teclado bien cubierta).

**Problemas menores detectados:**
- El lightbox no implementa **focus trap**: al abrirlo con teclado, el foco puede seguir escapando hacia elementos de fondo con Tab, aunque visualmente el modal esté encima. No es grave pero es una falla de accesibilidad real para usuarios de teclado/lector de pantalla.
- Contraste de color: en general los contrastes están bien (texto principal `#071529` sobre blanco, texto mutado `#64748b` ronda ~4.6:1, dentro del mínimo AA). No detecté combinaciones que fallen contraste de forma evidente.
- El botón flotante de WhatsApp (`whatsapp-float`) queda fijo en la esquina inferior derecha en mobile también — en pantallas muy chicas con el teclado abierto (ej. al completar el formulario) puede tapar contenido, aunque no es un problema mayor.

---

## 7. Facilidad de mantenimiento

**Para agregar una sección nueva tipo "Proyecto SaaS destacado con capturas y link en vivo":**
Hoy es *posible* pero manual y repetitivo:
- Tendrías que copiar el bloque `<article class="real-case">` completo (~90 líneas) y adaptarlo a mano.
- No hay ningún sistema de datos (JSON/YAML/CMS) que separe el contenido del layout — cada caso nuevo es HTML puro, sin abstracción.
- No hay un componente reutilizable para "link en vivo" (el botón que hay hoy es siempre WhatsApp; agregar un botón "Ver demo en vivo" requeriría escribir el HTML/CSS a mano, no hay un patrón ya armado para eso).
- No hay proceso de optimización de imágenes: si subís capturas de un SaaS sin comprimir, se suman al mismo problema de peso que ya existe.

**Código duplicado que conviene resolver antes de seguir agregando contenido:**
1. **Header, footer, botón flotante de WhatsApp y todos los scripts de tracking (GA4 + Meta Pixel) están copiados íntegramente en `index.html` y `casos.html`.** Cualquier cambio de marca, texto del footer, o ajuste de tracking hay que hacerlo dos veces y mantenerlo sincronizado a mano. Si agregás una tercera página, se triplica.
2. **La estructura de cada "caso" en `casos.html` es un patrón repetido 4 veces** (5 si contamos el comentado) sin ningún tipo de plantilla — ideal candidato para convertir en datos + template si se sigue creciendo el portfolio.
3. **El número de WhatsApp y variaciones de mensaje están hardcodeados como strings largos en múltiples atributos `href`** — cambiar el número de teléfono implicaría buscar/reemplazar en ~15 lugares distintos entre los dos archivos.

Dado que el sitio no tiene build process ni framework, la solución más simple (sin reescribir todo) sería introducir un mínimo de tooling (por ejemplo, un template estático simple tipo 11ty/Astro, o incluso un script de build casero que inyecte partials de header/footer) antes de seguir agregando páginas o casos — hoy cada página nueva multiplica el mantenimiento manual.

---

## Resumen — Top 5 problemas más urgentes

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| 1 | **Imágenes de casos sin optimizar** (22MB en PNG sin comprimir, sin WebP, sin responsive images) — pega directo en velocidad de carga de `casos.html`, que es la página que más debería convencer a un lead técnico. | 🔴 Alto — afecta performance, SEO (Core Web Vitals) y la primera impresión de un portfolio técnico. | 🟡 Medio — comprimir/convertir a WebP y regenerar los `src` es mecánico, no requiere rediseño. |
| 2 | **Formulario sin página de confirmación propia (`_next` faltante) y tracking de conversión que se dispara antes de confirmar el envío.** El lead completa el formulario y termina en una página genérica de Formspree fuera de la marca; y GA4/Meta Pixel puede contar leads que en realidad no se guardaron. | 🔴 Alto — es el corazón de la conversión del sitio (formulario = lead calificado) y hoy tiene una fuga de UX y de medición. | 🟢 Bajo — agregar `_next` o pasar a fetch/AJAX con mensaje de éxito inline es un cambio chico. |
| 3 | **Header, footer, tracking y botón de WhatsApp duplicados en cada HTML.** Cada cambio de marca, copy o número de teléfono hay que replicarlo a mano en 2+ archivos, y el riesgo de desincronización crece con cada página nueva (como el proyecto SaaS que se quiere agregar). | 🟠 Medio-alto — no rompe nada hoy, pero frena y encarece cada mejora futura de contenido/estructura. | 🟡 Medio — requiere introducir algún mecanismo de partials/templating (11ty, Astro, o build casero), no solo editar HTML. |
| 4 | **Casos de portfolio 100% hardcodeados en HTML sin separación de datos.** Agregar el proyecto SaaS que se quiere sumar implica copiar/pegar ~90 líneas y mantenerlas sincronizadas con el resto — no escala bien si se planea agregar más casos seguido. | 🟠 Medio | 🟡 Medio — mover a un array de datos (JSON/JS) + función de render, sin cambiar el diseño visual. |
| 5 | **Falta de minificación y assets sueltos sin usar** (CSS/JS sin minificar, y 4 imágenes de "reseñas" de ~4MB ya subidas pero sin usar porque el caso está comentado). Impacto individual bajo, pero es "peso muerto" fácil de limpiar. | 🟢 Bajo-medio | 🟢 Bajo — borrar assets no usados y minificar CSS/JS es rápido y de bajo riesgo. |

**Nota:** no se detectaron indicios de que el formulario esté completamente roto (el endpoint de Formspree responde correctamente), pero sí dos puntos débiles concretos en la experiencia y medición de la conversión (#2 arriba) que conviene resolver antes de invertir en más tráfico o rediseño visual.
