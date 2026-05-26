/* ==========================================================
   EFECTO INTERACTIVO TARJETAS SERVICIOS
========================================================== */

const cards = document.querySelectorAll('.card');

cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--x');
    card.style.removeProperty('--y');
  });
});


/* ==========================================================
   TRACKING GOOGLE ANALYTICS + META PIXEL
========================================================== */

function trackWhatsAppClick(label = 'whatsapp_button') {

  if (typeof fbq === 'function') {
    fbq('track', 'Contact');
  }

  if (typeof gtag === 'function') {
    gtag('event', 'click_whatsapp', {
      event_category: 'engagement',
      event_label: label
    });
  }

}


function trackLeadSubmit(formName = 'contact_form') {

  if (typeof fbq === 'function') {
    fbq('track', 'Lead');
  }

  if (typeof gtag === 'function') {
    gtag('event', 'submit_form', {
      event_category: 'lead',
      event_label: formName
    });
  }

}


function trackViewCasesClick(source = 'cases_button') {

  if (typeof gtag === 'function') {
    gtag('event', 'view_cases_page', {
      event_category: 'engagement',
      event_label: source
    });
  }

}


/* ==========================================================
   LIGHTBOX CASOS REALES
========================================================== */

const lightbox = document.getElementById('caseLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.querySelector('.lightbox-close');

if (lightbox && lightboxImage && lightboxClose) {

  function openLightbox(image) {

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    lightbox.classList.add('is-open');

    document.body.style.overflow = 'hidden';

    if (typeof fbq === 'function') {
      fbq('track', 'ViewContent');
    }

    if (typeof gtag === 'function') {
      gtag('event', 'view_case_image');
    }

  }

  function closeLightbox() {

    lightbox.classList.remove('is-open');

    document.body.style.overflow = '';

    lightboxImage.src = '';
    lightboxImage.alt = '';

  }

  document.querySelectorAll('.case-image').forEach((image) => {

    image.addEventListener('click', () => {
      openLightbox(image);
    });

  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (event) => {

    if (event.target === lightbox) {
      closeLightbox();
    }

  });

  document.addEventListener('keydown', (event) => {

    if (
      event.key === 'Escape' &&
      lightbox.classList.contains('is-open')
    ) {
      closeLightbox();
    }

  });

}


/* ==========================================================
   BOTONES WHATSAPP CASOS REALES
========================================================== */

document.querySelectorAll('[data-track-contact]').forEach((button) => {

  button.addEventListener('click', () => {

    if (typeof fbq === 'function') {
      fbq('track', 'Contact');
    }

    if (typeof gtag === 'function') {
      gtag('event', 'click_whatsapp', {
        event_category: 'engagement',
        event_label: 'cases_page_whatsapp'
      });
    }

  });

});