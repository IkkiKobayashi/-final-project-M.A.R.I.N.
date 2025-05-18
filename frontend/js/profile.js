import config from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!userData || !token) {
    window.location.href = "login.html";
    return;
  }

  // Update profile information
  updateProfileInfo(userData);

  // Add event listeners for profile picture upload
  setupProfilePictureUpload();
});

function updateProfileInfo(userData) {
  // Update profile picture
  const profilePicture = document.getElementById("profilePicture");
  if (userData.profileImage) {
    profilePicture.style.backgroundImage = `url(${userData.profileImage})`;
    profilePicture.classList.remove("placeholder");
  }

  // Update name
  const profileName = document.getElementById("profileName");
  profileName.value = userData.fullName || "";

  // Update role
  const roleValue = document.querySelector(".role-value");
  roleValue.textContent = userData.role || "Admin";

  // Update contact details
  const profileEmail = document.getElementById("profileEmail");
  profileEmail.value = userData.email || "";

  const profilePhone = document.getElementById("profilePhone");
  profilePhone.value = userData.phone || "";

  // Update location (address)
  const profileLocation = document.getElementById("profileLocation");
  profileLocation.value = userData.address || "";

  // Update joined date
  const joinedDate = document.querySelector(
    ".detail-item:last-child .non-editable-field span"
  );
  if (userData.joinedDate) {
    const date = new Date(userData.joinedDate);
    joinedDate.textContent = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Update header profile picture
  const headerProfileImg = document.querySelector(".profile-btn .profile-img");
  if (userData.profileImage) {
    headerProfileImg.style.backgroundImage = `url(${userData.profileImage})`;
    headerProfileImg.classList.remove("placeholder");
  }

  // Update header name
  const headerName = document.querySelector(".profile-btn span");
  headerName.textContent = userData.fullName || "Admin";
}

function setupProfilePictureUpload() {
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePicture = document.getElementById("profilePicture");

  profilePictureInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Please upload an image file", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch(`${config.apiUrl}/api/users/profile-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile picture");
      }

      // Update profile picture
      profilePicture.style.backgroundImage = `url(${data.profileImage})`;
      profilePicture.classList.remove("placeholder");

      // Update header profile picture
      const headerProfileImg = document.querySelector(
        ".profile-btn .profile-img"
      );
      headerProfileImg.style.backgroundImage = `url(${data.profileImage})`;
      headerProfileImg.classList.remove("placeholder");

      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      userData.profileImage = data.profileImage;
      localStorage.setItem("user", JSON.stringify(userData));

      showNotification("Profile picture updated successfully", "success");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      showNotification(
        error.message || "Failed to update profile picture",
        "error"
      );
    }
  });
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        <span>${message}</span>
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
