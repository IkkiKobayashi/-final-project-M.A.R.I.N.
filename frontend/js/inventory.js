document.addEventListener("DOMContentLoaded", function () {
  // View Toggle Functionality
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const inventoryView = document.querySelector(".inventory-view");
  const searchInput = document.querySelector(".search-input");

  // Inventory-specific search function
  const searchInventory = (query) => {
    const searchTerm = query.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach((product) => {
      const productName = product
        .querySelector(".product-name")
        .textContent.toLowerCase();
      const productType = product
        .querySelector(".product-type")
        .textContent.toLowerCase();
      const productQuantity = product
        .querySelector(".product-quantity")
        .textContent.toLowerCase();
      const productExpiry = product
        .querySelector(".product-expiry")
        .textContent.toLowerCase();

      const matchesSearch =
        productName.includes(searchTerm) ||
        productType.includes(searchTerm) ||
        productQuantity.includes(searchTerm) ||
        productExpiry.includes(searchTerm);

      product.style.display = matchesSearch ? "block" : "none";
    });
  };

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      inventoryView.className = "inventory-view " + this.dataset.view + "-view";
    });
  });

  // Add Product Button Functionality
  const addProductBtn = document.getElementById("addProductBtn");
  if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
      window.location.href = "products.html";
    });
  }

  // Search Functionality
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchInventory(e.target.value);
    });
  }

  // Stock Form Event Listener
  const stockForm = document.getElementById("stockForm");
  if (stockForm) {
    stockForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const productId = this.dataset.productId;
      const action = this.dataset.action;
      const quantity = parseInt(document.getElementById("stockQuantity").value);

      updateStock(productId, action, quantity);
      closeStockModal();
    });
  }

  // Initialize inventory by fetching products from backend
  fetchAndDisplayProducts();
});

// Fetch products from backend and display them
async function fetchAndDisplayProducts() {
  try {
    const currentStore = JSON.parse(localStorage.getItem("currentStore"));
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Please log in to view products", "error");
      window.location.href = "login.html";
      return;
    }

    if (!currentStore || !currentStore.id) {
      showNotification("Please select a store first", "error");
      window.location.href = "store-selection.html";
      return;
    }

    console.log("Fetching products for store:", currentStore.id);
    const response = await fetch(
      `http://localhost:5000/api/products?storeId=${currentStore.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      throw new Error(
        errorData.msg || `Failed to fetch products: ${response.status}`
      );
    }

    const products = await response.json();
    console.log("Fetched products:", products);

    // Clear existing products
    const container = document.querySelector(".inventory-view");
    if (!container) return;
    container.innerHTML = "";

    if (!Array.isArray(products)) {
      console.error("Invalid products data:", products);
      throw new Error("Invalid response format from server");
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products-message">
          <i class="fas fa-box-open"></i>
          <p>No products found for this store</p>
          <a href="products.html" class="btn-primary">Add Products</a>
        </div>
      `;
      return;
    }

    // Display products
    displayProducts(products);

    // Update local storage with minimal data (excluding images)
    try {
      const minimalProducts = products.map((product) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        type: product.type,
        expiry: product.expiry,
        // Don't store image data in localStorage
      }));
      localStorage.setItem("products", JSON.stringify(minimalProducts));
    } catch (storageError) {
      console.warn("Could not update localStorage:", storageError);
      // Continue execution even if localStorage fails
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification(error.message || "Failed to load products", "error");

    const container = document.querySelector(".inventory-view");
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load products</p>
          <button onclick="fetchAndDisplayProducts()" class="retry-btn">
            <i class="fas fa-sync"></i> Retry
          </button>
        </div>
      `;
    }
  }
}

// Add notification function
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Product Management Functions
function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  console.log("Loading products in loadProducts:", products);
  displayProducts(products);
}

function displayProducts(products) {
  const container = document.querySelector(".inventory-view");
  if (!container) return;

  container.innerHTML = "";

  console.log("Displaying products:", products);
  products.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

function createProductCard(product) {
  console.log("Creating card for product:", product);

  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.id = product._id || product.id;

  const statusTag = getStatusTag(product);

  // Safely handle expiry date
  let expiryDate = null;
  let daysUntilExpiry = null;
  if (product.expiry) {
    try {
      expiryDate = new Date(product.expiry);
      daysUntilExpiry = Math.ceil(
        (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
      );
    } catch (error) {
      console.warn(`Invalid expiry date for product ${product.name}:`, error);
    }
  }

  // Handle image URL with proper path resolution
  let imageUrl = "img/placeholder-product.png"; // Default placeholder
  if (product.image) {
    if (product.image.startsWith("data:image")) {
      // If it's a base64 image, use it directly
      imageUrl = product.image;
    } else if (product.image.startsWith("http")) {
      // If it's an absolute URL, use it as is
      imageUrl = product.image;
    } else if (product.image.startsWith("/")) {
      // If it's a root-relative path, remove the leading slash
      imageUrl = product.image.substring(1);
    } else {
      // If it's a relative path, use it as is
      imageUrl = product.image;
    }
  }

  // Format price with 2 decimal places
  const formattedPrice =
    typeof product.price === "number" ? product.price.toFixed(2) : "0.00";

  // Format product type with proper capitalization
  const formattedType = product.type
    ? product.type.charAt(0).toUpperCase() + product.type.slice(1).toLowerCase()
    : "";

  card.innerHTML = `
    <div class="product-image-container">
      <img 
        src="${imageUrl}" 
        alt="${product.name || "Product image"}" 
        class="product-image"
        onerror="this.onerror=null; this.src='img/placeholder-product.png';"
      >
    </div>
    ${statusTag}
    <div class="product-info">
      <h3 class="product-name">${product.name || "Unnamed Product"}</h3>
      <div class="product-type">${formattedType}</div>
      <div class="product-details">
        <span class="product-price">₱${formattedPrice}</span>
        <span class="product-quantity">${product.quantity || 0} in stock</span>
      </div>
      ${product.expiry ? `<div class="product-expiry">Expires: ${product.expiry}</div>` : ""}
    </div>
    <div class="stock-actions">
      <button class="stock-btn add-stock-btn" data-action="add" data-product-id="${product._id || product.id}">
        <i class="fas fa-plus"></i> Add Stock
      </button>
      <button class="stock-btn deduct-stock-btn" data-action="deduct" data-product-id="${product._id || product.id}">
        <i class="fas fa-minus"></i> Deduct Stock
      </button>
    </div>
  `;

  // Add event listeners to the buttons
  const addBtn = card.querySelector(".add-stock-btn");
  const deductBtn = card.querySelector(".deduct-stock-btn");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      openStockModal(product._id || product.id, "add");
    });
  }

  if (deductBtn) {
    deductBtn.addEventListener("click", () => {
      openStockModal(product._id || product.id, "deduct");
    });
  }

  return card;
}

function getStatusTag(product) {
  const expiryDate = new Date(product.expiry);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  const lastStocked = product.lastStocked
    ? new Date(product.lastStocked)
    : null;
  const daysSinceLastStocked = lastStocked
    ? Math.ceil((now - lastStocked) / (1000 * 60 * 60 * 24))
    : null;

  // Expired
  if (product.expiry && expiryDate < now) {
    return '<span class="status-tag status-expired">Expired</span>';
  }
  // Near Expiry (within 7 days)
  if (product.expiry && daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
    return '<span class="status-tag status-near-expiry">Near Expiry</span>';
  }
  // Recently Stocked (within 2 days)
  if (daysSinceLastStocked !== null && daysSinceLastStocked <= 2) {
    return '<span class="status-tag status-recently-stocked">Recently Stocked</span>';
  }
  // Out of Stock
  if (product.quantity === 0) {
    return '<span class="status-tag status-out-of-stock">Out of Stock</span>';
  }
  // Low Stock
  const stockPercentage = (product.quantity / (product.quantity + 1)) * 100;
  if (stockPercentage < 25) {
    return '<span class="status-tag status-low-stock">Low Stock</span>';
  }
  return "";
}

// Stock Management Modal Functions
function openStockModal(productId, action) {
  const modal = document.getElementById("stockModal");
  const form = document.getElementById("stockForm");
  const actionText = action === "add" ? "Add" : "Deduct";

  if (!modal || !form) {
    console.error("Modal or form elements not found");
    return;
  }

  const actionElement = document.getElementById("stockAction");
  if (actionElement) {
    actionElement.textContent = actionText;
  }

  form.dataset.productId = productId;
  form.dataset.action = action;
  modal.style.display = "block";
}

function closeStockModal() {
  const modal = document.getElementById("stockModal");
  const form = document.getElementById("stockForm");

  if (!modal || !form) {
    console.error("Modal or form elements not found");
    return;
  }

  modal.style.display = "none";
  form.reset();
}

function updateStock(productId, action, quantity) {
  if (!productId || !action || isNaN(quantity)) {
    console.error("Invalid parameters for updateStock");
    return;
  }

  // Fetch the current product data from the backend first
  fetch(`http://localhost:5000/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      return response.json();
    })
    .then((product) => {
      const currentQuantity = parseInt(product.quantity) || 0;
      const newQuantity = parseInt(quantity) || 0;

      // Update the quantity based on the action
      if (action === "add") {
        product.quantity = currentQuantity + newQuantity;
        product.lastStocked = new Date().toISOString();
      } else {
        product.quantity = Math.max(0, currentQuantity - newQuantity);
      }

      // Update the product on the backend
      return fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      return response.json();
    })
    .then((updatedProduct) => {
      // Refresh the products display
      fetchAndDisplayProducts();
      showNotification(
        `Stock ${action === "add" ? "added" : "deducted"} successfully`
      );
    })
    .catch((error) => {
      console.error("Error updating stock:", error);
      showNotification(error.message || "Failed to update stock", "error");
    });
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("stockModal");
  if (event.target === modal) {
    closeStockModal();
  }
};
