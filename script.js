(function(){
  'use strict';

  // ====== NAV MENU ======
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  
  if(menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      const isExpanded = nav.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // ====== THEME TOGGLE ======
  const THEME_KEY = 'sweetbites_theme_v2';
  const htmlEl = document.documentElement;
  const defaultTheme = localStorage.getItem(THEME_KEY) || 'light';
  const themeBtn = document.querySelector('#theme-toggle');

  function applyTheme(t){
    htmlEl.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    if(themeBtn) themeBtn.textContent = t === 'dark' ? 'Light' : 'Dark';
  }

  applyTheme(defaultTheme);

  document.addEventListener('click', e => {
    if(!e.target) return;
    if(e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')){
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
  });

  // ====== FORM HANDLING ======
  const form = document.getElementById('contactForm');
  if(!form) return;
  const status = document.getElementById('formStatus');

  function showStatus(msg, color){
    if(!status) return alert(msg);
    status.style.color = color || 'crimson';
    status.textContent = msg;
  }

  function isLocalPhoneValid(v){
    if(!v) return false;
    const digits = v.replace(/\D/g,'');
    return /^[9]\d{9}$/.test(digits);
  }

  form.addEventListener('submit', async function(evt){
    evt.preventDefault();

    const name = (form.querySelector('[name="name"]')?.value || '').trim();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const phoneRaw = (form.querySelector('[name="phone"]')?.value || '').trim();
    const orderType = (form.querySelector('[name="orderType"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();
    const captcha = (form.querySelector('#captcha')?.value || '').trim();

    if(!name || !email || !phoneRaw || !orderType || !message){
      showStatus('Please complete all required fields.');
      return;
    }

    if(!isLocalPhoneValid(phoneRaw)){
      showStatus('Phone must be 10 digits and start with 9 (e.g. 9123456789).');
      return;
    }

    if(captcha.toUpperCase() !== 'SWEET'){
      showStatus('Captcha word is incorrect.');
      return;
    }

    const digits = phoneRaw.replace(/\D/g,'');
    const fullPhone = '+63' + digits;

    const data = {
      access_key: "f4a0d85e-a43d-4074-8220-5c4c74d09726",
      name,
      email,
      phone: fullPhone,
      orderType,
      message
    };

    showStatus('⏳ Sending your order...', '#555');

    try {
      // ✅ Using your Render proxy
      const response = await fetch("https://sweetbites-server.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if(response.ok && result.success){
        showStatus('✅ Order sent successfully! Redirecting...', 'green');
        setTimeout(() => {
          window.location.href = "thanks.html";
        }, 1500);
      } else {
        console.error("Response error:", result);
        showStatus('⚠️ There was an error sending your order. Please try again.', 'crimson');
      }

    } catch(err){
      console.error('Error sending form:', err);
      showStatus('⚠️ Network error. Please try again later.', 'crimson');
    }
  });

})();
