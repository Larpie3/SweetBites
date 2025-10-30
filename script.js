import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcg8n-7trSSe2fvvPE0dOocnNG1x5fZ7s",
  authDomain: "sweetbites-admin-console.firebaseapp.com",
  projectId: "sweetbites-admin-console",
  storageBucket: "sweetbites-admin-console.firebasestorage.app",
  messagingSenderId: "125142981711",
  appId: "1:125142981711:web:7ad785732b705597069e3a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const themeToggle = document.getElementById("theme-toggle");

  // Smooth fade-up animations
  const fadeUps = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.2 });
  fadeUps.forEach(el => observer.observe(el));

  // Theme toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    themeToggle.textContent = document.body.classList.contains("dark-theme") ? "Light" : "Dark";
  });

  // Form submission handler
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formStatus.textContent = "Sending...";
    formStatus.className = "";

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const phone = "+63" + contactForm.phone.value.trim();
    const orderType = contactForm.orderType.value.trim();
    const message = contactForm.message.value.trim();
    const captcha = contactForm.captcha.value.trim().toUpperCase();

    if (captcha !== "SWEET") {
      formStatus.textContent = "Captcha failed. Please type SWEET.";
      formStatus.classList.add("error");
      return;
    }

    try {
      // Send to Firebase
      await addDoc(collection(db, "orders"), {
        name,
        email,
        phone,
        orderType,
        message,
        status: "Pending",
        timestamp: new Date().toISOString(),
      });

      // Send to Web3Forms (for email notification)
      const formData = new FormData(contactForm);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Web3Forms error");

      formStatus.textContent = "Order sent successfully!";
      formStatus.classList.add("success");
      contactForm.reset();
    } catch (err) {
      console.error(err);
      formStatus.textContent = "Failed to send. Please try again.";
      formStatus.classList.add("error");
    }
  });
});
