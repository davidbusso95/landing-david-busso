'use strict';

// Único lugar donde vive el número de WhatsApp y los mensajes prearmados
// de cada botón del sitio. Para cambiar el número o el texto de un mensaje,
// editá solo este archivo — build.js y los templates HTML lo referencian
// por clave (ver README.md).

const PHONE = '5493513048123';

const MESSAGES = {
  hero_solution: 'Hola David, necesito una solución digital para mi negocio.',
  service_automation: 'Hola David, quiero automatizar un proceso.',
  service_landing: 'Hola David, necesito una landing para captar clientes.',
  service_wordpress: 'Hola David, quiero crear o mejorar una web.',
  service_maintenance: 'Hola David, tengo una web funcionando y quiero revisarla.',
  service_consulting: 'Hola David, necesito orientación para definir una solución digital.',
  cases_generic: 'Hola David, vi tus casos reales y quiero consultarte por una automatización',
  floating_cases: 'Hola David, quiero consultarte por una automatización',
  saas_prospectai: 'Hola David, vi tu SaaS de Prospección Comercial y quiero consultarte por un proyecto similar',
};

function waLink(key) {
  const message = MESSAGES[key];

  if (message === undefined) {
    throw new Error(
      `Mensaje de WhatsApp desconocido: "${key}". Agregalo a MESSAGES en config/whatsapp.js`
    );
  }

  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

module.exports = { PHONE, MESSAGES, waLink };
