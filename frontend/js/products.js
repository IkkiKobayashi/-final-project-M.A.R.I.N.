// DOM Elements
const viewToggle = document.querySelector(".view-toggle");
const productsView = document.querySelector(".products-view");
const addProductBtn = document.querySelector(".add-product-btn");
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector(".close-modal-btn");
const productForm = document.querySelector("#productForm");
const imageUpload = document.querySelector(".image-upload");
const productImage = document.querySelector("#productImage");
const imagePreview = document.querySelector(".upload-preview img");
const cancelBtn = document.querySelector(".cancel-btn");
const submitBtn = document.querySelector(".submit-btn");
const modalTitle = document.querySelector("#modalTitle");
const productId = document.querySelector("#productId");

// View Toggle
viewToggle.addEventListener("click", (e) => {
  if (e.target.classList.contains("toggle-btn")) {
    // Remove active class from all buttons
    viewToggle.querySelectorAll(".toggle-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    e.target.classList.add("active");

    // Update view
    if (e.target.dataset.view === "grid") {
      productsView.classList.remove("list-view");
      productsView.classList.add("grid-view");
    } else {
      productsView.classList.remove("grid-view");
      productsView.classList.add("list-view");
    }
  }
});

// Modal Functions
function openModal() {
  modal.classList.add("active");
  modalTitle.textContent = "Add New Product";
  productId.value = ""; // Clear any existing product ID
  resetForm();
}

function closeModal() {
  modal.classList.remove("active");
  resetForm();
}

// Form Reset
function resetForm() {
  productForm.reset();
  imagePreview.src = "";
  imagePreview.style.display = "none";
}

// Event Listeners
addProductBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// Image Upload
imageUpload.addEventListener("click", () => {
  productImage.click();
});

productImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Update preview
      const previewContainer = document.querySelector(".upload-preview");
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
  }
});

// Form Submission
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(productForm);
  const imageFile = productImage.files[0];
  let imageData = "";

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageData = e.target.result;
      saveProductWithImage(formData, imageData);
    };
    reader.readAsDataURL(imageFile);
  } else {
    // If editing and no new image selected, keep the existing image
    if (productId.value) {
      const existingProduct = JSON.parse(localStorage.getItem("products")).find(
        (p) => p.id === productId.value
      );
      imageData = existingProduct
        ? existingProduct.image
        : "img/default-product.png";
    } else {
      imageData = "img/default-product.png";
    }
    saveProductWithImage(formData, imageData);
  }
});

// Save Product with Image
function saveProductWithImage(formData, imageData) {
  const product = {
    id: productId.value || Date.now().toString(),
    name: formData.get("productName"),
    price: formData.get("productPrice"),
    quantity: formData.get("productQuantity"),
    expiry: formData.get("productExpiry"),
    image: imageData,
  };

  // Update or add product to view
  if (productId.value) {
    // Update existing product card
    const existingCard = document.querySelector(
      `.product-card[data-id="${product.id}"]`
    );
    if (existingCard) {
      existingCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-details">
            <span class="product-price">₱${product.price}</span>
            <span class="product-quantity">${product.quantity} in stock</span>
          </div>
          <div class="product-expiry">Expires: ${product.expiry}</div>
        </div>
        <div class="product-actions">
          <button class="action-btn edit-btn">
            <i class="fas fa-edit"></i>
            Edit
          </button>
          <button class="action-btn delete-btn">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      `;

      // Reattach event listeners
      const editBtn = existingCard.querySelector(".edit-btn");
      const deleteBtn = existingCard.querySelector(".delete-btn");

      editBtn.addEventListener("click", () => {
        editProduct(product);
      });

      deleteBtn.addEventListener("click", () => {
        if (deleteProduct(product.id)) {
          existingCard.remove();
        }
      });
    }
  } else {
    // Add new product to view
    addProductToView(product);
  }

  // Save to localStorage
  saveProduct(product);

  // Close modal and reset form
  closeModal();
}

// Save Product to localStorage
function saveProduct(product) {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  if (productId.value) {
    // Update existing product
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
    }
  } else {
    // Add new product
    products.push(product);
  }

  localStorage.setItem("products", JSON.stringify(products));
}

// Delete Confirmation Modal
function showDeleteConfirmation(productName) {
  const confirmationModal = document.createElement("div");
  confirmationModal.className = "modal delete-confirmation-modal";
  confirmationModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Confirm Deletion</h2>
        <button class="close-modal-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete <strong>${productName}</strong>?</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <div class="modal-actions">
        <button class="cancel-btn">Cancel</button>
        <button class="confirm-delete-btn">Delete</button>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(confirmationModal);

  // Show modal
  confirmationModal.classList.add("active");

  // Return a promise that resolves when user makes a choice
  return new Promise((resolve) => {
    const closeModal = () => {
      confirmationModal.classList.remove("active");
      setTimeout(() => {
        confirmationModal.remove();
      }, 300);
    };

    // Handle close button
    confirmationModal
      .querySelector(".close-modal-btn")
      .addEventListener("click", () => {
        closeModal();
        resolve(false);
      });

    // Handle cancel button
    confirmationModal
      .querySelector(".cancel-btn")
      .addEventListener("click", () => {
        closeModal();
        resolve(false);
      });

    // Handle confirm button
    confirmationModal
      .querySelector(".confirm-delete-btn")
      .addEventListener("click", () => {
        closeModal();
        resolve(true);
      });
  });
}

// Delete Product
async function deleteProduct(productId, productName) {
  const confirmed = await showDeleteConfirmation(productName);

  if (confirmed) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== productId);
    localStorage.setItem("products", JSON.stringify(products));
    return true;
  }
  return false;
}

// Add Product to View
function addProductToView(product) {
  const productCard = document.createElement("div");
  productCard.className = "product-card";
  productCard.dataset.id = product.id;

  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <div class="product-details">
        <span class="product-price">₱${product.price}</span>
        <span class="product-quantity">${product.quantity} in stock</span>
      </div>
      <div class="product-expiry">Expires: ${product.expiry}</div>
    </div>
    <div class="product-actions">
      <button class="action-btn edit-btn">
        <i class="fas fa-edit"></i>
        Edit
      </button>
      <button class="action-btn delete-btn">
        <i class="fas fa-trash"></i>
        Delete
      </button>
    </div>
  `;

  // Add event listeners for edit and delete
  const editBtn = productCard.querySelector(".edit-btn");
  const deleteBtn = productCard.querySelector(".delete-btn");

  editBtn.addEventListener("click", () => {
    editProduct(product);
  });

  deleteBtn.addEventListener("click", async () => {
    if (await deleteProduct(product.id, product.name)) {
      productCard.remove();
    }
  });

  // Add to view
  productsView.appendChild(productCard);
}

// Edit Product
function editProduct(product) {
  // Set modal title and product ID
  modalTitle.textContent = "Edit Product";
  productId.value = product.id;

  // Fill form with product data
  document.querySelector("#productName").value = product.name;
  document.querySelector("#productPrice").value = product.price;
  document.querySelector("#productQuantity").value = product.quantity;
  document.querySelector("#productExpiry").value = product.expiry;

  // Handle image preview
  const previewContainer = document.querySelector(".upload-preview");
  if (product.image && product.image !== "img/default-product.png") {
    previewContainer.innerHTML = `<img src="${product.image}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
  } else {
    previewContainer.innerHTML = `
      <i class="fas fa-cloud-upload-alt"></i>
      <span>Click to upload image</span>
    `;
  }

  // Open modal
  modal.classList.add("active");

  // Update type indicator if product has a type
  if (product.type) {
    const typeIndicator = document.getElementById("typeIndicator");
    typeIndicator.className = "type-indicator active " + product.type;
    typeIndicator.textContent =
      document.getElementById("productType").options[
        document.getElementById("productType").selectedIndex
      ].text;
  }
}

// Load Products on Page Load
function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  products.forEach((product) => addProductToView(product));
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set default view
  const gridBtn = viewToggle.querySelector('[data-view="grid"]');
  gridBtn.classList.add("active");
  productsView.classList.add("grid-view");

  // Load existing products
  loadProducts();
});

// Add event listener for product type selection
document.getElementById("productType").addEventListener("change", function () {
  const typeIndicator = document.getElementById("typeIndicator");
  const selectedType = this.value;

  // Remove all existing classes
  typeIndicator.className = "type-indicator";

  if (selectedType) {
    // Add active class and type-specific class
    typeIndicator.classList.add("active", selectedType);
    // Set the text content
    typeIndicator.textContent = this.options[this.selectedIndex].text;
  }
});
