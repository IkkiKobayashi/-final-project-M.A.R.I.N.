document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const validateForm = () => {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!fullName || fullName.length < 2) {
      throw new Error("Full name must be at least 2 characters long");
    }
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Please enter a valid email address");
    }
    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters long");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
  };

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    try {
      validateForm();

      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          username,
          password,
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

      if (data.success && data.token) {
        // Show success message modal
        const modal = document.createElement("div");
        modal.className = "success-modal";
        modal.innerHTML = `
          <div class="modal-content">
            <h2><i class="fas fa-check-circle"></i> Success!</h2>
            <p>Your account has been created successfully.</p>
            <button onclick="window.location.href='login.html'" class="success-btn">
              Go to Login
            </button>
          </div>
        `;
        document.body.appendChild(modal);
      } else {
        throw new Error(data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error creating account. Please try again.");
    } finally {
      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = "Create Account";
    }
  });
});
