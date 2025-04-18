document.addEventListener("DOMContentLoaded", () => {
  // Sample store data (in a real app, this would come from a database)
  let stores = [
    { id: 1, name: "Downtown Store", location: "Main Street, Downtown" },
    { id: 2, name: "Mall Branch", location: "Central Mall, 2nd Floor" },
    { id: 3, name: "East Side Store", location: "East Boulevard, Suite 101" },
  ]

  // DOM elements
  const storesGrid = document.getElementById("stores-grid")
  const addStoreBtn = document.getElementById("add-store-btn")
  const addStoreModal = document.getElementById("add-store-modal")
  const editStoreModal = document.getElementById("edit-store-modal")
  const deleteConfirmModal = document.getElementById("delete-confirm-modal")
  const addStoreForm = document.getElementById("add-store-form")
  const editStoreForm = document.getElementById("edit-store-form")
  const closeModalBtns = document.querySelectorAll(".close-modal")
  const cancelDeleteBtn = document.getElementById("cancel-delete")
  const confirmDeleteBtn = document.getElementById("confirm-delete")

  // Render stores
  function renderStores() {
    storesGrid.innerHTML = ""

    if (stores.length === 0) {
      storesGrid.innerHTML = '<p class="no-stores">No stores found. Add your first store to get started.</p>'
      return
    }

    stores.forEach((store) => {
      const storeCard = document.createElement("div")
      storeCard.className = "store-card"
      storeCard.innerHTML = `
                <h3>${store.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${store.location}</p>
                <div class="store-options">
                    <button class="options-btn"><i class="fas fa-ellipsis-v"></i></button>
                    <div class="options-dropdown">
                        <div class="dropdown-item edit-store" data-id="${store.id}">
                            <i class="fas fa-edit"></i> Edit
                        </div>
                        <div class="dropdown-item delete delete-store" data-id="${store.id}">
                            <i class="fas fa-trash-alt"></i> Delete
                        </div>
                    </div>
                </div>
            `

      // Add click event to select store
      storeCard.addEventListener("click", (e) => {
        // Prevent triggering when clicking on options
        if (!e.target.closest(".store-options")) {
          selectStore(store)
        }
      })

      storesGrid.appendChild(storeCard)
    })

    // Add event listeners for options buttons
    document.querySelectorAll(".options-btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation()
        const dropdown = this.nextElementSibling

        // Close all other dropdowns
        document.querySelectorAll(".options-dropdown.show").forEach((d) => {
          if (d !== dropdown) d.classList.remove("show")
        })

        dropdown.classList.toggle("show")
      })
    })

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-store").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation()
        const storeId = Number.parseInt(this.getAttribute("data-id"))
        openEditModal(storeId)
      })
    })

    document.querySelectorAll(".delete-store").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation()
        const storeId = Number.parseInt(this.getAttribute("data-id"))
        openDeleteModal(storeId)
      })
    })
  }

  // Select store and redirect to dashboard
  function selectStore(store) {
    // In a real app, you might save the selected store ID in localStorage or a cookie
    localStorage.setItem("selectedStore", JSON.stringify(store))
    window.location.href = "dashboard.html"
  }

  // Open add store modal
  addStoreBtn.addEventListener("click", () => {
    addStoreModal.classList.add("show")
  })

  // Open edit store modal
  function openEditModal(storeId) {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      document.getElementById("edit-store-id").value = store.id
      document.getElementById("edit-store-name").value = store.name
      document.getElementById("edit-store-location").value = store.location
      editStoreModal.classList.add("show")
    }
  }

  // Open delete confirmation modal
  function openDeleteModal(storeId) {
    document.getElementById("delete-store-id").value = storeId
    deleteConfirmModal.classList.add("show")
  }

  // Close modals
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      addStoreModal.classList.remove("show")
      editStoreModal.classList.remove("show")
      deleteConfirmModal.classList.remove("show")
    })
  })

  // Cancel delete
  cancelDeleteBtn.addEventListener("click", () => {
    deleteConfirmModal.classList.remove("show")
  })

  // Add store form submission
  addStoreForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const name = document.getElementById("store-name").value
    const location = document.getElementById("store-location").value

    // Generate a new ID (in a real app, this would be handled by the backend)
    const newId = stores.length > 0 ? Math.max(...stores.map((s) => s.id)) + 1 : 1

    stores.push({
      id: newId,
      name: name,
      location: location,
    })

    // Reset form and close modal
    addStoreForm.reset()
    addStoreModal.classList.remove("show")

    // Re-render stores
    renderStores()
  })

  // Edit store form submission
  editStoreForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const id = Number.parseInt(document.getElementById("edit-store-id").value)
    const name = document.getElementById("edit-store-name").value
    const location = document.getElementById("edit-store-location").value

    // Update store
    const storeIndex = stores.findIndex((s) => s.id === id)
    if (storeIndex !== -1) {
      stores[storeIndex] = {
        ...stores[storeIndex],
        name: name,
        location: location,
      }
    }

    // Reset form and close modal
    editStoreForm.reset()
    editStoreModal.classList.remove("show")

    // Re-render stores
    renderStores()
  })

  // Confirm delete
  confirmDeleteBtn.addEventListener("click", () => {
    const storeId = Number.parseInt(document.getElementById("delete-store-id").value)

    // Remove store
    stores = stores.filter((s) => s.id !== storeId)

    // Close modal
    deleteConfirmModal.classList.remove("show")

    // Re-render stores
    renderStores()
  })

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".options-dropdown.show").forEach((dropdown) => {
      dropdown.classList.remove("show")
    })
  })

  // Initial render
  renderStores()
})
