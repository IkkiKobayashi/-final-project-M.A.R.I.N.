document.addEventListener("DOMContentLoaded", () => {
  // View toggle functionality
  const viewBtns = document.querySelectorAll(".view-btn")
  const gridView = document.getElementById("grid-view")
  const listView = document.getElementById("list-view")

  viewBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      viewBtns.forEach((b) => b.classList.remove("active"))

      // Add active class to clicked button
      this.classList.add("active")

      // Show the corresponding view
      const viewType = this.getAttribute("data-view")

      if (viewType === "grid") {
        gridView.classList.add("active")
        listView.classList.remove("active")
      } else {
        gridView.classList.remove("active")
        listView.classList.add("active")
      }
    })
  })

  // Filter functionality
  const categoryFilter = document.getElementById("category-filter")
  const statusFilter = document.getElementById("status-filter")

  function applyFilters() {
    const category = categoryFilter.value
    const status = statusFilter.value

    console.log("Filtering by:", { category, status })

    // In a real app, this would filter the actual data
    // For this demo, we'll just log the filter values
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", applyFilters)
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters)
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

        // In a real app, this would load the corresponding page of data
        console.log("Navigating to page:", this.textContent.trim())
      })
    }
  })
})
