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
const searchInput = document.querySelector(".search-input");

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
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(productForm);
  const imageFile = productImage.files[0];
  let imageData = "";

  if (imageFile) {
    imageData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imageFile);
    });
  } else {
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
  }

  await saveProductWithImage(formData, imageData);
});

// Remove the submitBtn click handler for saving product
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  productForm.requestSubmit();
});

// Save Product with Image
async function saveProductWithImage(formData, imageData) {
  try {
    const product = {
      id: productId.value || Date.now().toString(),
      name: formData.get("productName"),
      price: formData.get("productPrice"),
      quantity: formData.get("productQuantity"),
      expiry: formData.get("productExpiry"),
      type: formData.get("productType"),
      image: imageData,
    };

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
      id: "system",
      name: "System",
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
            <div class="product-type">${
              product.type.charAt(0).toUpperCase() + product.type.slice(1)
            }</div>
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

        // Log edit activity
        logActivity(
          currentUser.id,
          currentUser.name,
          "edit",
          "Product",
          `Updated product: ${product.name}`
        );

        // Reattach event listeners
        const editBtn = existingCard.querySelector(".edit-btn");
        const deleteBtn = existingCard.querySelector(".delete-btn");

        editBtn.addEventListener("click", () => {
          editProduct(product);
        });

        deleteBtn.addEventListener("click", async () => {
          if (await deleteProduct(product.id, product.name)) {
            existingCard.remove();
          }
        });
      }
    } else {
      // Add new product to view
      addProductToView(product);
      // Log add activity
      logActivity(
        currentUser.id,
        currentUser.name,
        "add",
        "Product",
        `Added new product: ${product.name}`
      );
    }

    // Save to localStorage
    saveProduct(product);
  } finally {
    closeModal();
  }
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
async function deleteProduct(productId, productName) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
    id: "system",
    name: "System",
  };

  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal delete-confirmation-modal active";
    modal.style.display = "flex";

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirm Deletion</h2>
          <button type="button" class="close-modal-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>${productName}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="cancel-btn">Cancel</button>
          <button type="button" class="confirm-delete-btn">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const confirmDeleteBtn = modal.querySelector(".confirm-delete-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const closeModalBtn = modal.querySelector(".close-modal-btn");

    const handleDelete = () => {
      // Remove from localStorage
      let products = JSON.parse(localStorage.getItem("products")) || [];
      const index = products.findIndex((p) => String(p.id) === String(productId));

      if (index > -1) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));

        // Log activity
        logActivity(
          currentUser.id,
          currentUser.name,
          "delete",
          "Product",
          `Deleted product: ${productName}`
        );

        modal.remove();
        loadProducts(); // Reload products to refresh the view
        resolve(true);
      } else {
        console.warn("Product not found in localStorage:", productId);
        modal.remove();
        resolve(false);
      }
    };

    const handleCancel = () => {
      modal.remove();
      resolve(false);
    };

    // Event Listeners
    confirmDeleteBtn.addEventListener("click", handleDelete);
    cancelBtn.addEventListener("click", handleCancel);
    closeModalBtn.addEventListener("click", handleCancel);
  });
}

// Sort functionality
let currentSort = null;

function sortProducts(sortBy) {
  const productsView = document.querySelector(".products-view");
  const products = Array.from(productsView.children);

  products.sort((a, b) => {
    switch (sortBy) {
      case "name":
        const nameA = a
          .querySelector(".product-name")
          .textContent.toLowerCase();
        const nameB = b
          .querySelector(".product-name")
          .textContent.toLowerCase();
        return nameA.localeCompare(nameB);

      case "price":
        const priceA = parseFloat(
          a.querySelector(".product-price").textContent.replace("₱", "")
        );
        const priceB = parseFloat(
          b.querySelector(".product-price").textContent.replace("₱", "")
        );
        return priceA - priceB;

      case "type":
        const typeA = a
          .querySelector(".product-type")
          .textContent.toLowerCase();
        const typeB = b
          .querySelector(".product-type")
          .textContent.toLowerCase();
        return typeA.localeCompare(typeB);

      case "expiry":
        const expiryA = new Date(
          a.querySelector(".product-expiry").textContent.split(": ")[1]
        );
        const expiryB = new Date(
          b.querySelector(".product-expiry").textContent.split(": ")[1]
        );
        return expiryA - expiryB;

      case "quantity":
        const quantityA = parseInt(
          a.querySelector(".product-quantity").textContent
        );
        const quantityB = parseInt(
          b.querySelector(".product-quantity").textContent
        );
        return quantityB - quantityA;

      default:
        return 0;
    }
  });

  // Clear and re-append sorted products
  productsView.innerHTML = "";
  products.forEach((product) => productsView.appendChild(product));

  // Update active sort option
  document.querySelectorAll(".sort-option").forEach((option) => {
    option.classList.remove("active");
    if (option.dataset.sort === sortBy) {
      option.classList.add("active");
    }
  });

  currentSort = sortBy;
}

// Add event listeners for sort options
document.querySelectorAll(".sort-option").forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    const sortBy = option.dataset.sort;
    sortProducts(sortBy);
  });
});

// Modify the addProductToView function to maintain sort order
const originalAddProductToView = addProductToView;
addProductToView = function (product) {
  originalAddProductToView(product);
  if (currentSort) {
    sortProducts(currentSort);
  }
};

// Add Product to View
function addProductToView(product) {
  const productCard = document.createElement("div");
  productCard.className = "product-card";
  productCard.dataset.id = product.id;

  productCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <div class="product-type">${
        product.type.charAt(0).toUpperCase() + product.type.slice(1)
      }</div>
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
  productsView.innerHTML = "";
  products.forEach((product) => addProductToView(product));
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Set default view
  const gridBtn = viewToggle.querySelector('[data-view="grid"]');
  gridBtn.classList.add("active");
  productsView.classList.add("grid-view");

  // Load existing products from localStorage
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

// Product-specific search function
const searchProducts = (query) => {
  const products = Array.from(productsView.children);
  const searchTerm = query.toLowerCase();

  products.forEach((product) => {
    const productName = product
      .querySelector(".product-name")
      .textContent.toLowerCase();
    const productType = product
      .querySelector(".product-type")
      .textContent.toLowerCase();
    const productPrice = product
      .querySelector(".product-price")
      .textContent.toLowerCase();

    const matchesSearch =
      productName.includes(searchTerm) ||
      productType.includes(searchTerm) ||
      productPrice.includes(searchTerm);

    product.style.display = matchesSearch ? "block" : "none";
  });
};

// Event Listeners
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchProducts(e.target.value);
  });
}
