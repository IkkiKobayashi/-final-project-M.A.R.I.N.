document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle functionality
  const sidebarToggle = document.getElementById("sidebar-toggle")
  const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle")
  const sidebar = document.getElementById("sidebar")

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }

  if (mobileSidebarToggle) {
    mobileSidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("mobile-open") &&
      !sidebar.contains(e.target) &&
      e.target !== mobileSidebarToggle
    ) {
      sidebar.classList.remove("mobile-open")
    }
  })

  // Profile dropdown functionality
  const profileDropdownBtn = document.getElementById("profile-dropdown-btn")
  const profileDropdown = document.querySelector(".profile-dropdown")

  if (profileDropdownBtn) {
    profileDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      profileDropdown.classList.toggle("show")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show")
      }
    })
  }

  // Store selector functionality
  const storeSelectorBtn = document.getElementById("store-selector-btn")

  if (storeSelectorBtn) {
    storeSelectorBtn.addEventListener("click", () => {
      window.location.href = "store-selection.html"
    })
  }

  // Load selected store info
  const currentStoreName = document.getElementById("current-store-name")
  const storeInfoName = document.getElementById("store-info-name")
  const storeInfoLocation = document.getElementById("store-info-location")

  // Try to get selected store from localStorage
  const selectedStore = JSON.parse(localStorage.getItem("selectedStore"))

  if (selectedStore) {
    if (currentStoreName) currentStoreName.textContent = selectedStore.name
    if (storeInfoName) storeInfoName.textContent = selectedStore.name
    if (storeInfoLocation) storeInfoLocation.textContent = selectedStore.location
  }
})
