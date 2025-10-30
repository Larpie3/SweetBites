(function () {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  function showStatus(msg, color = 'crimson') {
    if (!status) return alert(msg);
    status.style.color = color;
    status.textContent = msg;
  }

  function isLocalPhoneValid(v) {
    if (!v) return false;
    const digits = v.replace(/\D/g, '');
    return /^[9]\d{9}$/.test(digits);
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

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
      showStatus('Phone must be 10 digits and start with 9 (e.g., 9123456789).');
      return;
    }

    if (captcha.toUpperCase() !== 'SWEET') {
      showStatus('Captcha word is incorrect.');
      return;
    }

    const fullPhone = '+63' + phoneRaw.replace(/\D/g, '');
    const formData = new FormData(form);

    showStatus('⏳ Sending your order...', 'blue');

    try {
      const web3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      if (!web3Response.ok) throw new Error('Web3Forms submission failed.');

      const proxyResponse = await fetch('https://sweetbites-server.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: fullPhone, orderType, message }),
      });
      if (!proxyResponse.ok) throw new Error('Backup Google Sheets submission failed.');

      await saveToFirebase({ name, email, phone: fullPhone, orderType, message });

      showStatus('✅ Order sent successfully!', 'green');
      form.reset();

      setTimeout(() => {
        window.location.href = 'thanks.html';
      }, 1500);

    } catch (err) {
      console.error(err);
      showStatus('⚠️ There was an error sending your order. Please try again.');
    }
  });

  async function saveToFirebase(data) {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js');
    const { getFirestore, addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js');

    const firebaseConfig = {
      apiKey: 'AIzaSyCkxYnwFBOTO_vz6bkJJWM1tSatq4H6yeY',
      authDomain: 'sweetbites-admin-console.firebaseapp.com',
      projectId: 'sweetbites-admin-console',
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    await addDoc(collection(db, 'orders'), {
      ...data,
      timestamp: serverTimestamp(),
    });
  }
})();
