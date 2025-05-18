import config from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    try {
      if (!username || !password) {
        throw new Error("Please fill in all fields");
      }

      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Logging in...';

      console.log(
        "Attempting to login with API URL:",
        `${config.apiUrl}/api/auth/login`
      );

      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "store-selection.html"; // Changed from dashboard.html
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Failed to login. Please try again.");
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
  });
});
