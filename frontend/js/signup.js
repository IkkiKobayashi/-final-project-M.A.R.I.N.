document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  // Create error message elements
  const fullNameError = document.createElement("div");
  fullNameError.className = "error-message";
  fullNameInput.parentNode.appendChild(fullNameError);

  const emailError = document.createElement("div");
  emailError.className = "error-message";
  emailInput.parentNode.appendChild(emailError);

  const usernameError = document.createElement("div");
  usernameError.className = "error-message";
  usernameInput.parentNode.appendChild(usernameError);

  const passwordError = document.createElement("div");
  passwordError.className = "error-message";
  passwordInput.parentNode.appendChild(passwordError);

  const confirmPasswordError = document.createElement("div");
  confirmPasswordError.className = "error-message";
  confirmPasswordInput.parentNode.appendChild(confirmPasswordError);

  // Input validation functions
  function validateFullName(input, errorElement) {
    const value = input.value.trim();
    if (value.length < 3) {
      errorElement.textContent = "Full name must be at least 3 characters";
      errorElement.style.display = "block";
      return false;
    }
    if (!/^[a-zA-Z\s]*$/.test(value)) {
      errorElement.textContent =
        "Full name can only contain letters and spaces";
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  function validateEmail(input, errorElement) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errorElement.textContent = "Please enter a valid email address";
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  function validateUsername(input, errorElement) {
    const value = input.value.trim();
    if (value.length < 3) {
      errorElement.textContent = "Username must be at least 3 characters";
      errorElement.style.display = "block";
      return false;
    }
    if (!/^[a-zA-Z0-9_]*$/.test(value)) {
      errorElement.textContent =
        "Username can only contain letters, numbers, and underscores";
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  function validatePassword(input, errorElement) {
    const value = input.value;
    if (value.length < 8) {
      errorElement.textContent = "Password must be at least 8 characters";
      errorElement.style.display = "block";
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      errorElement.textContent =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  function validateConfirmPassword(input, passwordInput, errorElement) {
    const confirmValue = input.value;
    const passwordValue = passwordInput.value;
    if (confirmValue !== passwordValue) {
      errorElement.textContent = "Passwords do not match";
      errorElement.style.display = "block";
      return false;
    }
    errorElement.style.display = "none";
    return true;
  }

  // Form submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isFullNameValid = validateFullName(fullNameInput, fullNameError);
    const isEmailValid = validateEmail(emailInput, emailError);
    const isUsernameValid = validateUsername(usernameInput, usernameError);
    const isPasswordValid = validatePassword(passwordInput, passwordError);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPasswordInput,
      passwordInput,
      confirmPasswordError
    );

    if (
      isFullNameValid &&
      isEmailValid &&
      isUsernameValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      try {
        // Show loading state
        const submitBtn = signupForm.querySelector(".signup-btn");
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            username: usernameInput.value.trim(),
            password: passwordInput.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error cases
          if (data.message.includes("Email already registered")) {
            emailError.textContent = "This email is already registered";
            emailError.style.display = "block";
            emailInput.focus();
          } else if (data.message.includes("Username already taken")) {
            usernameError.textContent = "This username is already taken";
            usernameError.style.display = "block";
            usernameInput.focus();
          } else {
            throw new Error(data.message || "Failed to create account");
          }
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
          return;
        }

        // Show success message with animation
        const successMessage = document.createElement("div");
        successMessage.className = "success-message";
        successMessage.innerHTML = `
          <i class="fas fa-check-circle"></i>
          Account created successfully!<br>
          <small>Redirecting to login...</small>
        `;
        signupForm.appendChild(successMessage);

        // Store only necessary user data
        const { token, user } = data;
        localStorage.setItem("temp_token", token); // Temporary storage for verification
        localStorage.setItem("signup_email", user.email); // For auto-fill on login

        // Redirect to login page after animation
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        // Show error message with icon
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.style.display = "block";
        errorDiv.innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          ${error.message || "An error occurred during signup"}
        `;
        signupForm.insertBefore(errorDiv, signupForm.firstChild);

        // Reset button state
        const submitBtn = signupForm.querySelector(".signup-btn");
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        submitBtn.disabled = false;

        // Remove error message after 5 seconds
        setTimeout(() => {
          errorDiv.remove();
        }, 5000);
      }
    }
  });

  // Real-time validation
  fullNameInput.addEventListener("input", () => {
    validateFullName(fullNameInput, fullNameError);
  });

  emailInput.addEventListener("input", () => {
    validateEmail(emailInput, emailError);
  });

  usernameInput.addEventListener("input", () => {
    validateUsername(usernameInput, usernameError);
  });

  passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput, passwordError);
    if (confirmPasswordInput.value) {
      validateConfirmPassword(
        confirmPasswordInput,
        passwordInput,
        confirmPasswordError
      );
    }
  });

  confirmPasswordInput.addEventListener("input", () => {
    validateConfirmPassword(
      confirmPasswordInput,
      passwordInput,
      confirmPasswordError
    );
  });
});
