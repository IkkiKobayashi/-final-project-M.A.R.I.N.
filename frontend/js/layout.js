document.addEventListener("DOMContentLoaded", () => {
  // Profile dropdown functionality
  const profileBtn = document.querySelector(".profile-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (profileBtn && dropdownMenu) {
    // Toggle dropdown on button click
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Close dropdown when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  // Profile picture synchronization functionality
  function updateProfilePicture(imageUrl) {
    // Update profile picture in the admin dropdown
    const adminProfilePictures = document.querySelectorAll(".profile-img");
    adminProfilePictures.forEach((img) => {
      if (imageUrl) {
        // If the image URL is relative, prepend the API URL
        const fullImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${config.apiUrl}/${imageUrl}`;
        img.src = fullImageUrl;
        img.onerror = function () {
          this.src = "img/profile-placeholder.jpg";
        };
      } else {
        img.src = "img/profile-placeholder.jpg";
      }
    });

    // Update profile picture in the profile page if we're on that page
    const profilePicture = document.getElementById("profilePicture");
    if (profilePicture) {
      if (imageUrl) {
        const fullImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `${config.apiUrl}/${imageUrl}`;
        profilePicture.src = fullImageUrl;
        profilePicture.onerror = function () {
          this.src = "img/profile-placeholder.jpg";
        };
      } else {
        profilePicture.src = "img/profile-placeholder.jpg";
      }
    }
  }

  // Initialize profile picture from user data in localStorage
  const userData = JSON.parse(localStorage.getItem("userData"));
  const token = localStorage.getItem("token");

  if (userData) {
    // Update profile image
    if (userData.profileImage) {
      updateProfilePicture(userData.profileImage);
    } else {
      updateProfilePicture("img/profile-placeholder.jpg");
    }

    // Update profile name
    const profileName = profileBtn.querySelector("span");
    if (profileName) {
      profileName.textContent = userData.name || "User";
    }
  }

  // Handle profile picture upload if we're on the profile page
  const profilePictureInput = document.getElementById("profilePictureInput");
  if (profilePictureInput) {
    profilePictureInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageUrl = e.target.result;
          updateProfilePicture(imageUrl);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Sidebar functionality
  const sidebar = document.querySelector(".sidebar");
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPath = window.location.pathname;

  // Set active state for current page
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath.split("/").pop()) {
      link.classList.add("active");
    }
  });

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    sidebar.classList.toggle("collapsed");
    localStorage.setItem(
      "sidebarCollapsed",
      sidebar.classList.contains("collapsed")
    );
  };

  // Check for saved state
  if (localStorage.getItem("sidebarCollapsed") === "true") {
    sidebar.classList.add("collapsed");
  }

  // Add click event to sidebar header for toggling
  const sidebarHeader = document.querySelector(".sidebar-header");
  if (sidebarHeader) {
    sidebarHeader.addEventListener("click", toggleSidebar);
  }

  // Handle mobile menu
  const handleMobileMenu = () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.add("collapsed");
    } else {
      if (localStorage.getItem("sidebarCollapsed") === "false") {
        sidebar.classList.remove("collapsed");
      }
    }
  };

  // Initial check
  handleMobileMenu();

  // Listen for window resize
  window.addEventListener("resize", handleMobileMenu);

  // Store management
  const manageStoreBtn = document.querySelector(".manage-store-btn");
  if (manageStoreBtn) {
    manageStoreBtn.addEventListener("click", () => {
      window.location.href = "store-selection.html";
    });
  }

  // Handle logout
  const logoutLink = document.querySelector(
    ".dropdown-item[href='login.html']"
  );
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      // Clear any stored data
      localStorage.removeItem("selectedStore");
      localStorage.removeItem("user");
      // Redirect to login page
      window.location.href = "login.html";
    });
  }

  // Update store info if available
  const storeInfo = JSON.parse(localStorage.getItem("currentStore"));
  if (storeInfo) {
    const storeNameElement = document.querySelector(".store-name");
    const storeAddressElement = document.querySelector(".store-address");

    if (storeNameElement) {
      storeNameElement.textContent = storeInfo.name;
    }
    if (storeAddressElement) {
      storeAddressElement.textContent = storeInfo.address;
    }
  }
});
