const form = document.getElementById("contactForm");
const statusBox = document.getElementById("formStatus");

function showStatus(message, color = "red") {
  statusBox.textContent = message;
  statusBox.style.color = color;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phoneInput = document.getElementById("phone").value.trim();
  const orderType = document.getElementById("orderType").value.trim();
  const message = document.getElementById("message").value.trim();
  const captcha = document.getElementById("captcha").value.trim();

  if (!name || !email || !phoneInput || !orderType || !message) {
    showStatus("⚠️ Please fill out all fields.");
    return;
  }

  if (!/^9\d{9}$/.test(phoneInput)) {
    showStatus("⚠️ Phone must start with 9 and be 10 digits.");
    return;
  }

  if (captcha.toUpperCase() !== "SWEET") {
    showStatus("⚠️ Wrong captcha word.");
    return;
  }

  const phone = "+63" + phoneInput;
  const data = {
    access_key: "f4a0d85e-a43d-4074-8220-5c4c74d09726",
    name,
    email,
    phone,
    orderType,
    message,
  };

  showStatus("⏳ Sending your order...", "goldenrod");

  try {
    const web3 = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const web3Res = await web3.json();

    const google = await fetch("https://sweetbites-server.onrender.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, orderType, message }),
    });

    if (web3Res.success && google.ok) {
      showStatus("✅ Order sent successfully!", "green");
      setTimeout(() => {
        window.location.href = "thanks.html";
      }, 1000);
    } else {
      showStatus("⚠️ There was an error sending your order.");
    }
  } catch (err) {
    showStatus("⚠️ Error sending order. Please try again.");
  }
});


