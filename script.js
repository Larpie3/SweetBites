(function () {
  const THEME_KEY = 'sweetbites_theme_v2';
  const root = document.documentElement;

  function applyTheme(t) {
    if (t === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = t === 'dark' ? 'Light' : 'Dark';
  }

  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);

  document.addEventListener('click', function (e) {
    if (!e.target) return;
    if (e.target.id === 'theme-toggle' || e.target.classList.contains('theme-fab')) {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    // IntersectionObserver for fade-up / reveal animations
    const elems = document.querySelectorAll('.fade-up, .reveal');
    if (elems.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.12 });
      elems.forEach(el => io.observe(el));
    }

    // Mobile nav toggle if present
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', nav.classList.contains('active'));
      });
    }

    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');

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

    if (!form) return;

    form.addEventListener('submit', async function (evt) {
      evt.preventDefault();

      const fd = new FormData(form);
      const name = (fd.get('name') || '').trim();
      const email = (fd.get('email') || '').trim();
      const phoneRaw = (fd.get('phone') || '').trim();
      const orderType = (fd.get('orderType') || '').trim();
      const address = (fd.get('address') || '').trim();
      const flavor = (fd.get('flavor') || '').trim();
      const size = (fd.get('size') || '').trim();
      const notes = (fd.get('notes') || '').trim();
      const message = (fd.get('message') || '').trim();
      const captcha = (fd.get('captcha') || '').trim();
      const access_key = (fd.get('access_key') || '').trim();

      if (!name || !email || !phoneRaw || !orderType) {
        showStatus('Please complete all required fields.');
        return;
      }

      if (!isLocalPhoneValid(phoneRaw)) {
        showStatus('Phone must be 10 digits and start with 9 (e.g., 9123456789).');
        return;
      }

     if (captcha.replace(/\s+/g, '').toUpperCase() !== 'SWEET') {
      showStatus('Captcha word is incorrect. Please type SWEET exactly.');
      return;
      }

      const fullPhone = '+63' + phoneRaw.replace(/\D/g, '');
      const payload = {
        access_key,
        name,
        email,
        phone: fullPhone,
        orderType,
        address,
        flavor,
        size,
        notes,
        message
      };

      showStatus('⏳ Sending your order...', 'blue');

      try {
        const proxyUrl = 'https://sweetbites-server.onrender.com/submit';
        const proxyRes = await fetch(proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!proxyRes.ok) {
          const txt = await proxyRes.text().catch(() => '');
          throw new Error('Proxy error: ' + (txt || proxyRes.status));
        }

        const proxyJson = await proxyRes.json().catch(() => ({}));
        if (proxyJson.success === false) {
          throw new Error(proxyJson.message || 'Proxy indicated failure');
        }

        await saveToFirebase({ ...payload, phone: fullPhone });

        showStatus('✅ Order sent successfully!', 'green');
        form.reset();
        setTimeout(() => {
          window.location.href = 'thanks.html';
        }, 1200);

      } catch (err) {
        console.error('Order submit error:', err);
        showStatus('⚠️ There was an error sending your order. Please try again.');
      }
    });

    async function saveToFirebase(data) {
      try {
        const modApp = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
        const modFs = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');

        const firebaseConfig = {
          apiKey: 'AIzaSyCkxYnwFBOTO_vz6bkJJWM1tSatq4H6yeY',
          authDomain: 'sweetbites-admin-console.firebaseapp.com',
          projectId: 'sweetbites-admin-console',
          storageBucket: 'sweetbites-admin-console.firebasestorage.app',
          messagingSenderId: '125142981711',
          appId: '1:125142981711:web:7ad785732b705597069e3a'
        };

        const app = modApp.initializeApp(firebaseConfig);
        const db = modFs.getFirestore(app);
        const { addDoc, collection, serverTimestamp } = modFs;

        await addDoc(collection(db, 'orders'), {
          ...data,
          timestamp: serverTimestamp(),
          status: 'Pending'
        });
      } catch (err) {
        console.error('Firebase save failed:', err);
      }
    }
  });
})();

