/* script.js - SweetBites
   - Theme toggle persists across pages using localStorage
   - Contact form validation: phone must be 10 digits starting with 9 (local), will be prefixed with +63 before submit
   - Simple CAPTCHA (word "SWEET") check
*/

(function(){
  'use strict';

  /* THEME */
  const THEME_KEY = 'sweetbites_theme_v1';
  const htmlEl = document.documentElement;

  function applyTheme(t){
    htmlEl.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    // update any toggle button text if present
    const buttons = document.querySelectorAll('#theme-toggle, .theme-fab');
    buttons.forEach(b=>{
      if (b) b.textContent = (t === 'dark') ? 'Light' : 'Dark';
    });
  }

  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);

  // toggle handler (works across pages)
  document.addEventListener('click', e=>{
    if (!e.target) return;
    if (e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')){
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
  });

  /* CONTACT FORM VALIDATION & SUBMIT */
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  function showStatus(msg, color='crimson'){
    if (!status) return alert(msg);
    status.style.color = color;
    status.textContent = msg;
  }

  function isLocalPhoneValid(v){
    if (!v) return false;
    const digits = v.replace(/\D/g,'');
    // Expect exactly 10 digits and first digit is 9 -> e.g., 9123456789
    return /^[9]\d{9}$/.test(digits);
  }

  form.addEventListener('submit', function(evt){
    evt.preventDefault(); // we validate then submit programmatically

    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const phoneRaw = (form.querySelector('[name="phone"]')?.value || '').trim();
    const orderType = (form.querySelector('[name="orderType"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();
    const captcha = (form.querySelector('#captcha')?.value || '').trim();
    const honey = (form.querySelector('[name="_honey"]')?.value || '').trim();

    // Honeypot: if filled, silently stop
    if (honey) {
      return; // bot detected
    }

    // basic presence checks
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

    // prepare phone in international format: +63 + local digits
    const digits = phoneRaw.replace(/\D/g,'');
    const full = '+63' + digits;
    // set the phone input value to full (so FormSubmit receives international number)
    const phoneInput = form.querySelector('[name="phone"]');
    if (phoneInput) phoneInput.value = full;

    // optimistic UI then submit
    showStatus('Sending...', 'var(--gold-var)');

    // small delay for UX then submit
    setTimeout(()=> {
      form.submit(); // form.method is POST and action points to FormSubmit
    }, 300);
  });

})();


