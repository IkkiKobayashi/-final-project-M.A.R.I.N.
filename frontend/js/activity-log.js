document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const userFilter = document.getElementById("user-filter")
  const actionFilter = document.getElementById("action-filter")
  const dateFilter = document.getElementById("date-filter")
  const clearFiltersBtn = document.getElementById("clear-filters-btn")

  // Filter functionality
  function applyFilters() {
    const user = userFilter.value
    const action = actionFilter.value
    const date = dateFilter.value

    console.log("Filtering by:", { user, action, date })

    // In a real app, this would filter the activity log based on the selected filters
    // For this demo, we'll just log the filter values
  }

  if (userFilter) {
    userFilter.addEventListener("change", applyFilters)
  }

  if (actionFilter) {
    actionFilter.addEventListener("change", applyFilters)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", applyFilters)
  }

  // Clear filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      if (userFilter) userFilter.value = "all"
      if (actionFilter) actionFilter.value = "all"
      if (dateFilter) dateFilter.value = ""

      // Re-apply filters (which will now be the default values)
      applyFilters()
    })
  }

  // Pagination functionality
  const paginationBtns = document.querySelectorAll(".pagination-btn")

  paginationBtns.forEach((btn) => {
    if (!btn.disabled) {
      btn.addEventListener("click", function () {
        // Remove active class from all buttons
        paginationBtns.forEach((b) => {
          if (b.textContent.trim() !== "<" && b.textContent.trim() !== ">") {
            b.classList.remove("active")
          }
        })

        // Add active class to clicked button if it's a number
        if (this.textContent.trim() !== "<" && this.textContent.trim() !== ">") {
          this.classList.add("active")
        }

        // In a real app, this would load the corresponding page of activities
        console.log("Navigating to page:", this.textContent.trim())
      })
    }
  })
})
