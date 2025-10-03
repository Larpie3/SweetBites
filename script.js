/* script.js - SweetBites
   - Theme toggle persists using localStorage
   - Try Now button scrolls to contact form
   - Contact form validation and POST submit to FormSubmit endpoint
*/

(function(){
  'use strict';

  /* THEME */
  const THEME_KEY = 'sweetbites_theme_v2';
  const htmlEl = document.documentElement;
  const defaultTheme = localStorage.getItem(THEME_KEY) || 'light';

  function applyTheme(t){
    htmlEl.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    const fab = document.querySelectorAll('#theme-toggle, .theme-fab');
    fab.forEach(b => { if (b) b.textContent = (t === 'dark') ? 'Light' : 'Dark'; });
  }
  applyTheme(defaultTheme);

  document.addEventListener('click', e=>{
    if (!e.target) return;
    if (e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')){
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
  });

  /* TRY NOW: ensure it goes to contact form when clicked on index */
  const tryNowBtn = document.getElementById('tryNowBtn');
  if (tryNowBtn){
    tryNowBtn.addEventListener('click', function(e){
      // default behavior goes to contact.html#order; no special handling needed here
    });
  }

  /* CONTACT FORM */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  function showStatus(msg, color){
    if (!status) return alert(msg);
    status.style.color = color || 'crimson';
    status.textContent = msg;
  }

  function isLocalPhoneValid(v){
    if (!v) return false;
    const digits = v.replace(/\D/g,'');
    // expect exactly 10 digits, first digit 9 -> 9123456789
    return /^[9]\d{9}$/.test(digits);
  }

  form.addEventListener('submit', function(evt){
    evt.preventDefault();

    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const phoneRaw = (form.querySelector('[name="phone"]')?.value || '').trim();
    const orderType = (form.querySelector('[name="orderType"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();
    const captcha = (form.querySelector('#captcha')?.value || '').trim();
    const honey = (form.querySelector('[name="_honey"]')?.value || '').trim();

    // honeypot check
    if (honey) return; // likely bot

    if (!name || !email || !phoneRaw || !orderType || !message){
      showStatus('Please complete all required fields.');
      return;
    }

    if (!isLocalPhoneValid(phoneRaw)){
      showStatus('Phone must be 10 digits and start with 9 (e.g. 9123456789).');
      return;
    }

    if (captcha.toUpperCase() !== 'SWEET'){
      showStatus('Captcha word is incorrect.');
      return;
    }

    // convert to international +63
    const digits = phoneRaw.replace(/\D/g,'');
    const fullPhone = '+63' + digits;
    const phoneInput = form.querySelector('[name="phone"]');
    if (phoneInput) phoneInput.value = fullPhone;

    showStatus('Sending...', '#6b3f26');

    // small delay for UX then submit (Form will POST to FormSubmit and redirect to thanks.html)
    setTimeout(()=> form.submit(), 300);
  });

})();



