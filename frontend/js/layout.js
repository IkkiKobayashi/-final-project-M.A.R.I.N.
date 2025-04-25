document.addEventListener("DOMContentLoaded", () => {
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

  // Search functionality
  const searchInput = document.querySelector(".search-input");
  const searchCategory = document.querySelector(".search-category");
  const searchButton = document.querySelector(".search-button");

  const performSearch = () => {
    const query = searchInput.value.trim();
    const category = searchCategory.value;

    if (query) {
      // In a real application, this would make an API call
      console.log(`Searching for "${query}" in category: ${category}`);
      // Redirect to search results page or update content
    }
  };

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Activity Log functionality
  const notificationBtn = document.querySelector(".notification-btn");
  const notificationBadge = document.querySelector(".notification-badge");
  const activityList = document.querySelector(".activity-list");

  // Activity type configurations
  const activityTypes = {
    inventory: {
      icon: "box",
      class: "inventory",
    },
    employee: {
      icon: "user",
      class: "employee",
    },
    product: {
      icon: "tag",
      class: "product",
    },
    order: {
      icon: "shopping-cart",
      class: "order",
    },
    system: {
      icon: "cog",
      class: "system",
    },
  };

  // Sample recent activities (in a real app, this would come from an API/database)
  const recentActivities = [
    {
      id: 1,
      type: "inventory",
      message: "Added 50 units of Product A to inventory",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "employee",
      message: "New employee John Doe added to the system",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "product",
      message: "Updated price for Product B",
      time: "2 hours ago",
    },
    {
      id: 4,
      type: "order",
      message: "New order #1234 received",
      time: "3 hours ago",
    },
    {
      id: 5,
      type: "system",
      message: "System backup completed successfully",
      time: "4 hours ago",
    },
  ];

  // Update notification badge
  function updateNotificationBadge() {
    const count = recentActivities.length;
    notificationBadge.textContent = count;
    notificationBadge.style.display = count > 0 ? "block" : "none";
  }

  // Render recent activities
  function renderActivities() {
    activityList.innerHTML = recentActivities
      .map((activity) => {
        const activityConfig = activityTypes[activity.type];
        return `
        <div class="activity-item" data-id="${activity.id}">
          <div class="activity-icon ${activityConfig.class}">
            <i class="fas fa-${activityConfig.icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-message">${activity.message}</div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `;
      })
      .join("");

    updateNotificationBadge();
  }

  // Toggle notification dropdown
  notificationBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    notificationBtn.classList.toggle("active");
  });

  // Close notification dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!notificationBtn.contains(e.target)) {
      notificationBtn.classList.remove("active");
    }
  });

  // Initialize notifications
  renderActivities();

  // Profile dropdown functionality
  const profileDropdown = document.querySelector(".profile-dropdown");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target)) {
      dropdownMenu.style.display = "none";
    }
  });

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
});
