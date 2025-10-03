// === Theme Toggle Script (Works Across All Pages) ===

// Get the toggle button
const themeToggle = document.getElementById("theme-toggle");

// Function to apply the stored or default theme
function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
}

// Load theme from localStorage or default to light
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

// Update toggle button text based on theme
if (themeToggle) {
    themeToggle.textContent = savedTheme === "dark" ? "Light Mode" : "Dark Mode";
}

// Toggle on click
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);

        themeToggle.textContent = newTheme === "dark" ? "Light Mode" : "Dark Mode";
    });
}


