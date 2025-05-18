import config from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const phoneInput = document.getElementById("phone");
  const locationInput = document.getElementById("location");

  const validateForm = () => {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const phone = phoneInput.value.trim();
    const location = locationInput.value.trim();

    if (
      !fullName ||
      !email ||
      !username ||
      !password ||
      !confirmPassword ||
      !phone ||
      !location
    ) {
      throw new Error("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error("Please enter a valid phone number");
    }
  };

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const phone = phoneInput.value.trim();
    const location = locationInput.value.trim();

    try {
      validateForm();

      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";

      const response = await fetch(`${config.apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          username,
          password,
          phone,
          location,
        }),
      });

      // Log the raw response for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      let data;
      try {
        const textResponse = await response.text();
        console.log("Raw response:", textResponse);
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid server response");
      }

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data.success) {
        showNotification(
          "Account created successfully! Please log in.",
          "success"
        );
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message || "Failed to create account", "error");
    } finally {
      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = "Create Account";
    }
  });
});

// Notification function
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
