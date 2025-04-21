document.addEventListener("DOMContentLoaded", function () {
  // View Toggle Functionality
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const inventoryView = document.querySelector(".inventory-view");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");
      // Update view
      inventoryView.className = "inventory-view " + this.dataset.view + "-view";
    });
  });

  // Search Functionality
  const searchInput = document.querySelector(".search-input");
  const inventoryItems = document.querySelectorAll(
    ".inventory-item:not(.add-product)"
  );

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    inventoryItems.forEach((item) => {
      const productName = item.querySelector("h3").textContent.toLowerCase();
      const shouldShow = productName.includes(searchTerm);
      item.style.display = shouldShow ? "block" : "none";
    });
  });
});
