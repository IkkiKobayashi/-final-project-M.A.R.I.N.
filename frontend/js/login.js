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

  // Form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const isUsernameValid = validateInput(usernameInput, usernameError);
    const isPasswordValid = validateInput(passwordInput, passwordError);

    if (isUsernameValid && isPasswordValid) {
      // Simulate successful login
      // In a real application, this would make an API call
      window.location.href = "store-selection.html";
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
