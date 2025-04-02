(() => {
  const state = {
    showPassword: false,
  };

  function togglePasswordVisibility() {
    state.showPassword = !state.showPassword;

    const passwordInput = document.getElementById("password-input");
    const toggleIcon = document.getElementById("password-toggle-icon");

    if (passwordInput && toggleIcon) {
      if (state.showPassword) {
        passwordInput.type = "text";
        toggleIcon.src = "img/show-pass.png"; // Updated to use show-pass.png
      } else {
        passwordInput.type = "password";
        toggleIcon.src = "img/hide-pass.png"; // Updated to use hide-pass.png
      }
    }
  }

  function handleForgotPasswordClick(event) {
    event.preventDefault(); // Prevent default link behavior
    window.location.href = "forgot-password.html"; // Redirect to forgot-password.html
  }

  // Initialize event listeners when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".toggle-password");
    if (toggleButton) {
      toggleButton.addEventListener("click", togglePasswordVisibility);
    }

    const forgotPasswordLink = document.querySelector(".forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", handleForgotPasswordClick);
    }
  });
})();
