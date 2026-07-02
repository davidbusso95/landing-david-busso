'use strict';

/*
 * Build estático sin dependencias externas.
 *
 * Lee las plantillas en /src, resuelve:
 *   - <!-- include:nombre -->   -> inyecta partials/nombre.html
 *   - {{wa:clave}}              -> link de WhatsApp resuelto desde config/whatsapp.js
 *   - {{token}}                 -> valor definido en `locals` para esa página (ver PAGES abajo)
 * y escribe el HTML final en la raíz del proyecto (index.html, casos.html), listo
 * para servir como sitio estático.
 *
 * Uso: node build.js
 */

const fs = require('fs');
const path = require('path');
const { waLink } = require('./config/whatsapp');

const ROOT_DIR = __dirname;
const PARTIALS_DIR = path.join(ROOT_DIR, 'partials');

const INCLUDE_PATTERN = /<!--\s*include:([\w-]+)\s*-->/g;
const TOKEN_PATTERN = /\{\{\s*([\w:.-]+)\s*\}\}/g;

function navLink({ href, label, className, external }) {
  const classAttr = className ? ` class="${className}"` : '';
  const targetAttr = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${classAttr}${targetAttr}>${label}</a>`;
}

function joinNavLinks(links) {
  return links.join('\n        ');
}

const HOME_NAV_LINKS = joinNavLinks([
  navLink({ href: '#servicios', label: 'Servicios' }),
  navLink({ href: '#casos', label: 'Casos' }),
  navLink({ href: '#mantenimiento', label: 'Mantenimiento' }),
  navLink({ href: 'casos.html', label: 'Casos reales', external: true }),
  navLink({ href: '#contacto', label: 'Contacto', className: 'btn btn-primary' }),
]);

const CASOS_NAV_LINKS = joinNavLinks([
  navLink({ href: 'index.html', label: 'Inicio' }),
  navLink({ href: 'index.html#servicios', label: 'Servicios' }),
  navLink({ href: 'index.html#casos', label: 'Casos' }),
  navLink({ href: 'index.html#mantenimiento', label: 'Mantenimiento' }),
  navLink({ href: 'index.html#contacto', label: 'Contacto', className: 'btn btn-primary' }),
]);

// Cada página define su propio "locals": valores que solo tiene sentido que
// varíen por página (qué nav-links mostrar, si el logo del header es un link
// o no, qué mensaje de WhatsApp usa el botón flotante). Todo lo demás
// (estructura del header/footer, scripts de tracking, ícono de WhatsApp)
// vive una sola vez en /partials.
const PAGES = [
  {
    src: path.join(ROOT_DIR, 'src', 'index.html'),
    out: path.join(ROOT_DIR, 'index.html'),
    locals: {
      brand_open: '<div class="brand">',
      brand_close: '</div>',
      nav_links: HOME_NAV_LINKS,
      float_href: waLink('service_automation'),
    },
  },
  {
    src: path.join(ROOT_DIR, 'src', 'casos.html'),
    out: path.join(ROOT_DIR, 'casos.html'),
    locals: {
      brand_open: '<a class="brand" href="index.html">',
      brand_close: '</a>',
      nav_links: CASOS_NAV_LINKS,
      float_href: waLink('floating_cases'),
    },
  },
];

function substituteTokens(str, locals) {
  return str.replace(TOKEN_PATTERN, (match, key) => {
    if (key.startsWith('wa:')) {
      return waLink(key.slice(3));
    }

    if (Object.prototype.hasOwnProperty.call(locals, key)) {
      return locals[key];
    }

    throw new Error(
      `Token desconocido "{{${key}}}". Definilo en "locals" dentro de build.js, o si es un ` +
      `mensaje de WhatsApp usá "{{wa:clave}}" y agregá la clave en config/whatsapp.js.`
    );
  });
}

function expandIncludes(str, locals) {
  return str.replace(INCLUDE_PATTERN, (match, name) => {
    const partialPath = path.join(PARTIALS_DIR, `${name}.html`);

    if (!fs.existsSync(partialPath)) {
      throw new Error(`No se encontró el partial "partials/${name}.html" (referenciado como <!-- include:${name} -->).`);
    }

    const raw = fs.readFileSync(partialPath, 'utf8');
    return substituteTokens(raw, locals);
  });
}

function buildPage({ src, out, locals }) {
  if (!fs.existsSync(src)) {
    throw new Error(`No se encontró la plantilla fuente: ${path.relative(ROOT_DIR, src)}`);
  }

  let html = fs.readFileSync(src, 'utf8');
  html = substituteTokens(html, locals);
  html = expandIncludes(html, locals);

  fs.writeFileSync(out, html, 'utf8');
  console.log(`  ✓ ${path.relative(ROOT_DIR, src)} -> ${path.relative(ROOT_DIR, out)}`);
}

function main() {
  console.log('Generando páginas estáticas...');
  PAGES.forEach(buildPage);
  console.log('Listo.');
}

main();
