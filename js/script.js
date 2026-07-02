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


function trackDemoClick(label = 'demo_button') {

  if (typeof fbq === 'function') {
    fbq('trackCustom', 'ClickDemoSaaS', { label });
  }

  if (typeof gtag === 'function') {
    gtag('event', 'click_demo_saas', {
      event_category: 'engagement',
      event_label: label
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

    lightboxImage.src = image.currentSrc || image.src;
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
   BOTONES DEMO (PROYECTOS PROPIOS)
========================================================== */

document.querySelectorAll('[data-track-demo]').forEach((button) => {

  button.addEventListener('click', () => {
    trackDemoClick(button.dataset.trackLabel || 'demo_button');
  });

});

/* ==========================================================
   ENVÍO DEL FORMULARIO POR AJAX (SIN SALIR DEL SITIO)
========================================================== */

const contactForm = document.getElementById('contact-form');
const contactFormSubmitButton = document.getElementById('contact-form-submit');
const formErrorMessage = document.getElementById('form-error-message');
const formSuccessMessage = document.getElementById('form-success-message');
const formSuccessReset = document.getElementById('form-success-reset');

function showFormError(message) {
  if (!formErrorMessage) return;
  formErrorMessage.textContent = message;
  formErrorMessage.hidden = false;
}

function hideFormError() {
  if (!formErrorMessage) return;
  formErrorMessage.hidden = true;
  formErrorMessage.textContent = '';
}

if (contactForm) {
  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    hideFormError();

    if (contactFormSubmitButton) {
      contactFormSubmitButton.disabled = true;
    }

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        }).catch(function () {
          return { ok: response.ok, data: null };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          const errors =
            result.data &&
            Array.isArray(result.data.errors) &&
            result.data.errors.map(function (error) { return error.message; }).join(', ');

          throw new Error(
            errors || 'No se pudo enviar el formulario. Probá de nuevo en unos minutos.'
          );
        }

        if (typeof trackLeadSubmit === 'function') {
          trackLeadSubmit('main_contact_form');
        }

        contactForm.hidden = true;

        if (formSuccessMessage) {
          formSuccessMessage.hidden = false;
          formSuccessMessage.focus();
        }
      })
      .catch(function (error) {
        showFormError(
          error.message ||
          'Hubo un problema al enviar tu consulta. Probá de nuevo o escribime por WhatsApp.'
        );
      })
      .finally(function () {
        if (contactFormSubmitButton) {
          contactFormSubmitButton.disabled = false;
        }
      });
  });
}

if (formSuccessReset && contactForm && formSuccessMessage) {
  formSuccessReset.addEventListener('click', function () {
    contactForm.reset();
    contactForm.hidden = false;
    formSuccessMessage.hidden = true;
  });
}


window.trackWhatsAppClick = trackWhatsAppClick;
window.trackLeadSubmit = trackLeadSubmit;
window.trackViewCasesClick = trackViewCasesClick;
window.trackDemoClick = trackDemoClick;


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
