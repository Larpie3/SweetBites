/* script.js
   Shared JS for:
   - Theme toggling (persisted via localStorage)
   - Contact form validation (phone rules you requested)
   - Submission via mailto: (opens user's email client with populated content)
   NOTE: For true server-side emailing you'll later need a backend or a service (Formspree, EmailJS, etc).
*/

/* ---------- THEME HANDLING ---------- */
(function(){
  const THEME_KEY = 'sweetbites-theme';
  const body = document.body;

  // Apply saved theme on load
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') body.classList.add('dark-theme');

  // Attach toggle handlers for all theme buttons (there are multiple buttons on pages)
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'themeToggle') {
      body.classList.toggle('dark-theme');
      localStorage.setItem(THEME_KEY, body.classList.contains('dark-theme') ? 'dark' : 'light');
    }
  });
})();

/* ---------- CONTACT FORM HANDLING ---------- */
(function(){
  // Only run if the contact form exists on the page
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('formStatus');

  // Helper: validate phone according to your rules:
  // - user must enter 10 digits
  // - first digit must be 9 (so after +63 it becomes +63 9XXXXXXXXX)
  function validatePhone(value){
    // strip spaces & non-digits just in case
    const digits = (value || '').replace(/\D/g,'');
    // must be exactly 10 digits and start with 9
    return /^[9]\d{9}$/.test(digits);
  }

  form.addEventListener('submit', function(evt){
    evt.preventDefault(); // prevent default submit

    // read values
    const name = (document.getElementById('name').value || '').trim();
    const email = (document.getElementById('email').value || '').trim();
    const phone = (document.getElementById('phone').value || '').trim();
    const orderType = (document.getElementById('orderType').value || '').trim();
    const message = (document.getElementById('message').value || '').trim();

    // Basic validation
    if (!name || !email || !phone || !orderType || !message) {
      status.style.color = 'crimson';
      status.textContent = 'Please complete all required fields.';
      return;
    }

    if (!validatePhone(phone)) {
      status.style.color = 'crimson';
      status.textContent = 'Invalid phone. Enter 10 digits starting with 9 (e.g., 9123456789).';
      return;
    }

    // Construct full international phone
    const phoneDigits = phone.replace(/\D/g, '');
    const fullPhone = `+63${phoneDigits}`;

    // Prepare email via mailto: (this opens user's email client with populated subject and body)
    // Note: mailto has length limits and depends on user's email client. This is a simple no-backend solution.
    const recipient = 'ralphcstnrs3@gmail.com';
    const subject = encodeURIComponent(`SweetBites Order / Inquiry — ${orderType} — from ${name}`);
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${fullPhone}`,
      `Order Type: ${orderType}`,
      '',
      'Message:',
      message
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));

    // Open the user's email app
    const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
    // Attempt to open mailto. Some browsers block window.open for mailto; using location.href is more reliable.
    window.location.href = mailto;

    // Update UI (optimistic)
    status.style.color = 'green';
    status.textContent = 'Message prepared in your email client. If it did not open, please email ralphcstnrs3@gmail.com directly.';
    form.reset();
  });
})();
