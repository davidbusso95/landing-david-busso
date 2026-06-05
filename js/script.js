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
    gtag('event', 'generate_lead', {
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
   BOTONES WHATSAPP
========================================================== */

document.querySelectorAll('[data-track-contact]').forEach((button) => {

  button.addEventListener('click', () => {
    trackWhatsAppClick(button.dataset.trackLabel || 'whatsapp_button');

  });

});


/* ==========================================================
   BOTONES CASOS REALES
========================================================== */

document.querySelectorAll('[data-track-cases]').forEach((button) => {

  button.addEventListener('click', () => {
    trackViewCasesClick(button.dataset.trackLabel || 'cases_button');
  });

});

/* ==========================================================
   FORM TRACKING WITH DELAY BEFORE SUBMIT
========================================================== */

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (typeof trackLeadSubmit === 'function') {
      trackLeadSubmit('main_contact_form');
    }

    setTimeout(function () {
      contactForm.submit();
    }, 500);
  });
}


window.trackWhatsAppClick = trackWhatsAppClick;
window.trackLeadSubmit = trackLeadSubmit;
window.trackViewCasesClick = trackViewCasesClick;


/* ==========================================================
   NAVEGACIÓN MOBILE
========================================================== */

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('primary-navigation');

if (navToggle && navLinks) {

  function setMobileMenuState(isOpen) {
    navToggle.classList.toggle('is-open', isOpen);
    navLinks.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute(
      'aria-label',
      isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
    );
  }

  navToggle.addEventListener('click', () => {
    setMobileMenuState(!navLinks.classList.contains('is-open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
      setMobileMenuState(false);
      navToggle.focus();
    }
  });

}
