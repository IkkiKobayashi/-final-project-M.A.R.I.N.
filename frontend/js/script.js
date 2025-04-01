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
        toggleIcon.src = "img/Show pass.png"; // Updated to use Show pass.png
      } else {
        passwordInput.type = "password";
        toggleIcon.src = "img/Hide pass.png"; // Updated to use Hide pass.png
      }
    }
  }

  // Initialize event listeners when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".toggle-password");
    if (toggleButton) {
      toggleButton.addEventListener("click", togglePasswordVisibility);
    }
  });
})();
