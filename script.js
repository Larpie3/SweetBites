(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const THEME_KEY = 'sweetbites_theme_v2';
  const htmlEl = document.documentElement;
  const themeBtn = document.querySelector('#theme-toggle');

  // ===== Theme Toggle =====
  function applyTheme(t) {
    htmlEl.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    if (themeBtn) themeBtn.textContent = t === 'dark' ? 'Light' : 'Dark';
  }

  applyTheme(localStorage.getItem(THEME_KEY) || 'light');

  document.addEventListener('click', (e) => {
    if (e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')) {
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
  });

  if (!form) return;

  function showStatus(msg, color) {
    if (!status) return alert(msg);
    status.style.color = color || 'crimson';
    status.textContent = msg;
  }

  function isLocalPhoneValid(v) {
    if (!v) return false;
    const digits = v.replace(/\D/g, '');
    return /^[9]\d{9}$/.test(digits);
  }

  // ===== Handle Form Submit =====
  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const phoneRaw = form.querySelector('[name="phone"]').value.trim();
    const orderType = form.querySelector('[name="orderType"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    const captcha = form.querySelector('#captcha').value.trim();

    if (!name || !email || !phoneRaw || !orderType || !message) {
      showStatus('Please complete all required fields.');
      return;
    }

    if (!isLocalPhoneValid(phoneRaw)) {
      showStatus('Phone must be 10 digits and start with 9 (e.g. 9123456789).');
      return;
    }

    if (captcha.toUpperCase() !== 'SWEET') {
      showStatus('Captcha word is incorrect.');
      return;
    }

    const fullPhone = '+63' + phoneRaw.replace(/\D/g, '');

    const formData = {
      name,
      email,
      phone: fullPhone,
      orderType,
      message,
      timestamp: new Date().toLocaleString(),
    };

    try {
      // 1️⃣ Send to Web3Forms
      showStatus('⏳ Sending order...');
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'f4a0d85e-a43d-4074-8220-5c4c74d09726',
          ...formData,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error('Web3Forms failed.');

      // 2️⃣ Send backup to Google Apps Script via your proxy
      fetch('https://sweetbites-server.onrender.com/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch((err) => console.warn('Backup failed:', err));

      // ✅ Success → redirect
      showStatus('✅ Order sent! Redirecting...', 'green');
      setTimeout(() => (window.location.href = 'thanks.html'), 1200);
    } catch (err) {
      console.error('Error sending form:', err);
      showStatus('⚠️ There was an error sending your order. Please try again.');
    }
  });
})();
