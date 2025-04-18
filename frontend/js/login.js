document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form")
  const togglePassword = document.querySelector(".toggle-password")
  const passwordInput = document.getElementById("password")

  // Toggle password visibility
  togglePassword.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)
    this.classList.toggle("fa-eye")
    this.classList.toggle("fa-eye-slash")
  })

  // Form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    // Client-side validation
    if (!username || !password) {
      alert("Please enter both username and password")
      return
    }

    // Simulate login (in a real app, this would be an API call)
    console.log("Login attempt:", { username, password })

    // Redirect to store selection page after successful login
    window.location.href = "store-selection.html"
  })
})
