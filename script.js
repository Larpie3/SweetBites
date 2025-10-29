(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form) return;

  const THEME_KEY = 'sweetbites_theme_v2';
  const htmlEl = document.documentElement;
  const themeBtn = document.querySelector('#theme-toggle');
  const defaultTheme = localStorage.getItem(THEME_KEY) || 'light';
  htmlEl.setAttribute('data-theme', defaultTheme);
  if(themeBtn) themeBtn.textContent = defaultTheme === 'dark' ? 'Light' : 'Dark';
  document.addEventListener('click', e => {
    if(!e.target) return;
    if(e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')){
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', next);
      if(themeBtn) themeBtn.textContent = next === 'dark' ? 'Light' : 'Dark';
      localStorage.setItem(THEME_KEY, next);
    }
  });

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

    const formData = new FormData(form);
    formData.set('phone', fullPhone);

    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new URLSearchParams(formData)
      });
    } catch(err){
      console.error('Web3Forms error:', err);
    }

    const backupData = {
      name, email, phone: fullPhone, orderType, message
    };

    try {
      await fetch('https://sweetbites-server.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      window.location.href = "thanks.html";
    } catch(err){
      showStatus('⚠️ There was an error sending your order. Please try again.');
      console.error('Google backup error:', err);
    }
  });
})();
