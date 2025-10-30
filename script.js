(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  function showStatus(msg, color = 'crimson') {
    if (!status) return alert(msg);
    status.style.color = color;
    status.textContent = msg;
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const phone = '+63' + (data.phone || '').replace(/\D/g, '');

    if (!data.name || !data.email || !data.phone || !data.address || !data.orderType) {
      return showStatus('Please complete all required fields.');
    }

    if (data.captcha?.toUpperCase() !== 'SWEET') {
      return showStatus('Captcha incorrect.');
    }

    showStatus('⏳ Sending your order...', 'blue');

    try {
      const proxyRes = await fetch('https://sweetbites-server.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, phone })
      });

      const resJson = await proxyRes.json();
      if (!resJson.success) throw new Error(resJson.message);

      await saveToFirebase({ ...data, phone });

      showStatus('✅ Order sent successfully!', 'green');
      form.reset();

      setTimeout(() => (window.location.href = 'thanks.html'), 1200);
    } catch (err) {
      console.error(err);
      showStatus('⚠️ Error sending order. Please try again.');
    }
  });

  async function saveToFirebase(data) {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
    const { getFirestore, addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');

    const firebaseConfig = {
      apiKey: 'AIzaSyCkxYnwFBOTO_vz6bkJJWM1tSatq4H6yeY',
      authDomain: 'sweetbites-admin-console.firebaseapp.com',
      projectId: 'sweetbites-admin-console',
      storageBucket: 'sweetbites-admin-console.firebasestorage.app',
      messagingSenderId: '125142981711',
      appId: '1:125142981711:web:7ad785732b705597069e3a'
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    await addDoc(collection(db, 'orders'), {
      ...data,
      timestamp: serverTimestamp(),
      status: 'Pending'
    });
  }
})();
