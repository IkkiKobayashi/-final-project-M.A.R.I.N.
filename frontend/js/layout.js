document.addEventListener("DOMContentLoaded", () => {
  // Profile dropdown functionality
  const profileBtn = document.querySelector(".profile-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (profileBtn && dropdownMenu) {
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
  }

  // Profile picture synchronization functionality
  function updateProfilePicture(imageUrl) {
    // Update profile picture in the admin dropdown
    const adminProfilePictures = document.querySelectorAll(".profile-img");
    adminProfilePictures.forEach((img) => {
      img.src = imageUrl;
      img.onerror = function () {
        // If image fails to load, use default placeholder
        this.src = "assets/profile-placeholder.jpg";
      };
    });

    // Update profile picture in the profile page if we're on that page
    const profilePicture = document.getElementById("profilePicture");
    if (profilePicture) {
      profilePicture.src = imageUrl;
      profilePicture.onerror = function () {
        // If image fails to load, use default placeholder
        this.src = "assets/profile-placeholder.jpg";
      };
    }

    // Save the profile picture URL to localStorage
    localStorage.setItem("profilePicture", imageUrl);
  }

  // Initialize profile picture from localStorage on page load
  const savedProfilePicture = localStorage.getItem("profilePicture");
  if (savedProfilePicture) {
    updateProfilePicture(savedProfilePicture);
  } else {
    // If no saved profile picture, use the default placeholder
    const defaultProfilePicture = "assets/profile-placeholder.jpg";
    updateProfilePicture(defaultProfilePicture);
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
  sidebarHeader.addEventListener("click", toggleSidebar);

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
  manageStoreBtn.addEventListener("click", () => {
    window.location.href = "store-selection.html";
  });

  function updateHeaderProfile() {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      // Update header profile picture
      const headerProfileImg = document.querySelector(
        ".profile-btn .profile-img"
      );
      if (userData.profileImage) {
        headerProfileImg.style.backgroundImage = `url(${config.apiUrl}/${userData.profileImage})`;
        headerProfileImg.classList.remove("placeholder");
      }

      // Update header name
      const headerName = document.querySelector(".profile-btn span");
      headerName.textContent = userData.name || "Admin";
    }
  }

  // Call updateHeaderProfile when the page loads
  document.addEventListener("DOMContentLoaded", updateHeaderProfile);
});
