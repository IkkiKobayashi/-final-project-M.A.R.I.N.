document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
      if (!username || !password) {
        throw new Error("Please fill in all fields");
      }

      // Disable form while submitting
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include", // Important for handling cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Store the token if your API returns one
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "Login failed. Please try again.");
    } finally {
      // Re-enable form
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.textContent = "Log In";
    }
  });
});
