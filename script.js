// THEME TOGGLE + ANIMATIONS
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-theme", currentTheme === "dark");
  themeToggle.textContent = currentTheme === "dark" ? "Light" : "Dark";

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const newTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = newTheme === "dark" ? "Light" : "Dark";
  });

  // Fade-up animation on scroll
  const fadeUps = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.2 }
  );
  fadeUps.forEach((el) => observer.observe(el));
});

// CONTACT FORM HANDLER
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

    // ✅ Fixed captcha — case insensitive and trims spaces
    if (captcha.replace(/\s+/g, '').toUpperCase() !== 'SWEET') {
      showStatus('Captcha word is incorrect. Please type SWEET exactly.');
      return;
    }

    const fullPhone = '+63' + phoneRaw.replace(/\D/g, '');
    const formData = new FormData(form);

    showStatus('⏳ Sending your order...', 'blue');

    try {
      // Send to Web3Forms
      const web3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      if (!web3Response.ok) throw new Error('Web3Forms submission failed.');

      // Send to backend proxy (for Firebase)
      const proxyResponse = await fetch('https://sweetbites-server.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: fullPhone, orderType, message }),
      });
      if (!proxyResponse.ok) throw new Error('Backend submission failed.');

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
})();

