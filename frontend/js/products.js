document.addEventListener("DOMContentLoaded", () => {
  // Sample product data (in a real app, this would come from a database)
  let products = [
    { id: 1, name: "Organic Apples", category: "Produce", price: 2.99, quantity: 150, expiry: 30 },
    { id: 2, name: "Whole Milk", category: "Dairy", price: 3.49, quantity: 75, expiry: 7 },
    { id: 3, name: "Whole Wheat Bread", category: "Bakery", price: 3.99, quantity: 25, expiry: 5 },
    { id: 4, name: "Bottled Water (24-pack)", category: "Beverages", price: 4.99, quantity: 10, expiry: 365 },
    { id: 5, name: "Cheddar Cheese", category: "Dairy", price: 5.49, quantity: 0, expiry: 14 },
    { id: 6, name: "Orange Juice", category: "Beverages", price: 3.99, quantity: 5, expiry: 10 },
  ]

  // DOM elements
  const viewBtns = document.querySelectorAll(".view-btn")
  const gridView = document.getElementById("grid-view")
  const listView = document.getElementById("list-view")
  const addProductBtn = document.getElementById("add-product-btn")
  const addProductModal = document.getElementById("add-product-modal")
  const editProductModal = document.getElementById("edit-product-modal")
  const deleteConfirmModal = document.getElementById("delete-confirm-modal")
  const addProductForm = document.getElementById("add-product-form")
  const editProductForm = document.getElementById("edit-product-form")
  const closeModalBtns = document.querySelectorAll(".close-modal")
  const cancelDeleteBtn = document.getElementById("cancel-delete")
  const confirmDeleteBtn = document.getElementById("confirm-delete")

  // View toggle functionality
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

  // Open add product modal
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      addProductModal.classList.add("show")
    })
  }

  // Close modals
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      addProductModal.classList.remove("show")
      editProductModal.classList.remove("show")
      deleteConfirmModal.classList.remove("show")
    })
  })

  // Add product form submission
  if (addProductForm) {
    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const name = document.getElementById("product-name").value
      const category = document.getElementById("product-category").value
      const price = Number.parseFloat(document.getElementById("product-price").value)
      const quantity = Number.parseInt(document.getElementById("product-quantity").value)
      const expiry = Number.parseInt(document.getElementById("product-expiry").value)

      // Generate a new ID (in a real app, this would be handled by the backend)
      const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1

      // Add new product
      products.push({
        id: newId,
        name: name,
        category: category,
        price: price,
        quantity: quantity,
        expiry: expiry,
      })

      // Reset form and close modal
      addProductForm.reset()
      addProductModal.classList.remove("show")

      // In a real app, you would refresh the product list or add the new product to the DOM
      alert("Product added successfully!")
    })
  }

  // Edit product functionality
  const editBtns = document.querySelectorAll(".edit-btn")

  editBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = Number.parseInt(this.getAttribute("data-id"))
      openEditModal(productId)
    })
  })

  function openEditModal(productId) {
    const product = products.find((p) => p.id === productId)

    if (product) {
      document.getElementById("edit-product-id").value = product.id
      document.getElementById("edit-product-name").value = product.name
      document.getElementById("edit-product-category").value = product.category.toLowerCase()
      document.getElementById("edit-product-price").value = product.price
      document.getElementById("edit-product-quantity").value = product.quantity
      document.getElementById("edit-product-expiry").value = product.expiry

      editProductModal.classList.add("show")
    }
  }

  // Edit product form submission
  if (editProductForm) {
    editProductForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const id = Number.parseInt(document.getElementById("edit-product-id").value)
      const name = document.getElementById("edit-product-name").value
      const category = document.getElementById("edit-product-category").value
      const price = Number.parseFloat(document.getElementById("edit-product-price").value)
      const quantity = Number.parseInt(document.getElementById("edit-product-quantity").value)
      const expiry = Number.parseInt(document.getElementById("edit-product-expiry").value)

      // Update product
      const productIndex = products.findIndex((p) => p.id === id)

      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          name: name,
          category: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
          price: price,
          quantity: quantity,
          expiry: expiry,
        }
      }

      // Reset form and close modal
      editProductForm.reset()
      editProductModal.classList.remove("show")

      // In a real app, you would update the product in the DOM
      alert("Product updated successfully!")
    })
  }

  // Delete product functionality
  const deleteBtns = document.querySelectorAll(".delete-btn")

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = Number.parseInt(this.getAttribute("data-id"))
      openDeleteModal(productId)
    })
  })

  function openDeleteModal(productId) {
    document.getElementById("delete-product-id").value = productId
    deleteConfirmModal.classList.add("show")
  }

  // Cancel delete
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      deleteConfirmModal.classList.remove("show")
    })
  }

  // Confirm delete
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      const productId = Number.parseInt(document.getElementById("delete-product-id").value)

      // Remove product
      products = products.filter((p) => p.id !== productId)

      // Close modal
      deleteConfirmModal.classList.remove("show")

      // In a real app, you would remove the product from the DOM
      alert("Product deleted successfully!")
    })
  }

  // Filter functionality
  const categoryFilter = document.getElementById("category-filter")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      const category = this.value

      console.log("Filtering by category:", category)

      // In a real app, this would filter the products based on the selected category
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

        // In a real app, this would load the corresponding page of products
        console.log("Navigating to page:", this.textContent.trim())
      })
    }
  })
})
