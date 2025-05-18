import config from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData"));
  const token = localStorage.getItem("token");

  if (!userData || !token) {
    window.location.href = "login.html";
    return;
  }

  try {
    // Fetch latest user data from backend
    const response = await fetch(`/api/users/${userData._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const updatedUserData = await response.json();

    // Update localStorage with latest data
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    // Update profile information
    updateProfileInfo(updatedUserData);

    // Add event listeners for profile picture upload
    setupProfilePictureUpload();
  } catch (error) {
    console.error("Error fetching user data:", error);
    showNotification(
      "Failed to load profile data. Please try again later.",
      "error"
    );
  }
});

function updateProfileInfo(userData) {
  // Update profile picture
  const profilePicture = document.getElementById("profilePicture");
  if (userData.profileImage) {
    const imageUrl = userData.profileImage.startsWith("http")
      ? userData.profileImage
      : `/uploads/${userData.profileImage}`;
    profilePicture.src = imageUrl;
    profilePicture.onerror = function () {
      this.src = "img/profile-placeholder.jpg";
    };
  }

  // Update name
  const profileName = document.getElementById("profileName");
  if (profileName) profileName.value = userData.name || "";

  // Update role
  const roleValue = document.querySelector(".role-value");
  if (roleValue) roleValue.textContent = userData.role || "User";

  // Update contact details
  const profileEmail = document.getElementById("profileEmail");
  if (profileEmail) profileEmail.value = userData.email || "";

  const profilePhone = document.getElementById("profilePhone");
  if (profilePhone) profilePhone.value = userData.phone || "";

  // Update address
  const profileAddress = document.getElementById("profileAddress");
  if (profileAddress) profileAddress.value = userData.address || "";

  // Update header profile picture
  const headerProfileImg = document.querySelector(".profile-btn .profile-img");
  if (headerProfileImg && userData.profileImage) {
    const imageUrl = userData.profileImage.startsWith("http")
      ? userData.profileImage
      : `/uploads/${userData.profileImage}`;
    headerProfileImg.src = imageUrl;
    headerProfileImg.onerror = function () {
      this.src = "img/profile-placeholder.jpg";
    };
  }

  // Update header name
  const headerName = document.querySelector(".profile-btn span");
  if (headerName) headerName.textContent = userData.name || "User";
}

function setupProfilePictureUpload() {
  const profilePictureInput = document.getElementById("profilePictureInput");
  const profilePicture = document.getElementById("profilePicture");

  if (!profilePictureInput || !profilePicture) return;

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

      const response = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile picture");
      }

      const data = await response.json();

      // Update profile picture
      const imageUrl = data.profileImage.startsWith("http")
        ? data.profileImage
        : `/uploads/${data.profileImage}`;

      profilePicture.src = imageUrl;
      profilePicture.onerror = function () {
        this.src = "img/profile-placeholder.jpg";
      };

      // Update header profile picture
      const headerProfileImg = document.querySelector(
        ".profile-btn .profile-img"
      );
      if (headerProfileImg) {
        headerProfileImg.src = imageUrl;
        headerProfileImg.onerror = function () {
          this.src = "img/profile-placeholder.jpg";
        };
      }

      // Update user data in localStorage
      const userData = JSON.parse(localStorage.getItem("userData"));
      userData.profileImage = data.profileImage;
      localStorage.setItem("userData", JSON.stringify(userData));

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
