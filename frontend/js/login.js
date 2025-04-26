document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  // Create error message elements
  const usernameError = document.createElement("div");
  usernameError.className = "error-message";
  usernameInput.parentNode.appendChild(usernameError);

  const passwordError = document.createElement("div");
  passwordError.className = "error-message";
  passwordInput.parentNode.appendChild(passwordError);

  // Input validation
  function validateInput(input, errorElement, minLength = 3) {
    const value = input.value.trim();
    if (value.length < minLength) {
      errorElement.textContent = `Must be at least ${minLength} characters`;
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  // Check for signup email and pre-fill
  const signupEmail = localStorage.getItem("signup_email");
  if (signupEmail) {
    usernameInput.value = signupEmail;
    localStorage.removeItem("signup_email"); // Clear after use
  }

  // Form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isUsernameValid = validateInput(usernameInput, usernameError);
    const isPasswordValid = validateInput(passwordInput, passwordError);

    if (isUsernameValid && isPasswordValid) {
      try {
        // Show loading state
        const submitBtn = loginForm.querySelector(".login-btn");
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;

        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: usernameInput.value.trim(),
            password: passwordInput.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid credentials");
        }

        // Clear any temporary signup data
        localStorage.removeItem("temp_token");
        localStorage.removeItem("signup_email");

        // Store the token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Show success message briefly
        const successMessage = document.createElement("div");
        successMessage.className = "success-message";
        successMessage.innerHTML = `
          <i class="fas fa-check-circle"></i>
          Login successful!
        `;
        loginForm.appendChild(successMessage);

        // Redirect after brief success message
        setTimeout(() => {
          window.location.href = "store-selection.html";
        }, 1000);
      } catch (error) {
        // Show error message with icon
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.style.display = "block";
        errorDiv.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          ${error.message}
        `;
        loginForm.insertBefore(errorDiv, loginForm.firstChild);

        // Reset button state
        const submitBtn = loginForm.querySelector(".login-btn");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        // Clear password field on error
        passwordInput.value = "";
        passwordInput.focus();

        // Remove error message after 5 seconds
        setTimeout(() => {
          errorDiv.remove();
        }, 5000);
      }
    }
  });

  // Real-time validation
  usernameInput.addEventListener("input", () => {
    validateInput(usernameInput, usernameError);
  });

  passwordInput.addEventListener("input", () => {
    validateInput(passwordInput, passwordError);
  });
});
