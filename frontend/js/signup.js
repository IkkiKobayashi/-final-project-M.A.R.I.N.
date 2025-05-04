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

      // Disable form while submitting
      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Creating account...";

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          username,
          password,
        }),
        credentials: "include",
        mode: "cors",
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server response was not JSON");
      }

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      alert("Account created successfully! Please login.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Error creating account. Please try again.");
    } finally {
      // Re-enable form
      const submitButton = signupForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";
    }
  });
});
