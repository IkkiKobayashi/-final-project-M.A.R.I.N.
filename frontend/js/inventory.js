document.addEventListener("DOMContentLoaded", function () {
  // View Toggle Functionality
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const inventoryView = document.querySelector(".inventory-view");

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
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const products = document.querySelectorAll(".product-card");

    products.forEach((product) => {
      const productName = product
        .querySelector(".product-name")
        .textContent.toLowerCase();
      product.style.display = productName.includes(searchTerm)
        ? "block"
        : "none";
    });
  });

  // Initialize inventory with debugging
  console.log("Loading products...");
  const products = JSON.parse(localStorage.getItem("products")) || [];
  console.log("Products from localStorage:", products);

  if (products.length === 0) {
    console.log("No products found in localStorage");
    // Add a message to the inventory view
    const container = document.querySelector(".inventory-view");
    container.innerHTML = `
      <div class="no-products-message">
        <i class="fas fa-box-open"></i>
        <p>No products found. Please add products in the Products page first.</p>
        <a href="products.html" class="btn-primary">Go to Products</a>
      </div>
    `;
  } else {
    displayProducts(products);
  }
});

// Product Management Functions
function loadProducts() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  console.log("Loading products in loadProducts:", products);
  displayProducts(products);
}

function displayProducts(products) {
  const container = document.querySelector(".inventory-view");
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
  card.dataset.id = product.id;

  const statusTag = getStatusTag(product);
  const expiryDate = new Date(product.expiry);
  const daysUntilExpiry = Math.ceil(
    (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
  );

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="product-image">
    ${statusTag}
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
    <div class="stock-actions">
      <button class="stock-btn add-stock-btn" onclick="openStockModal('${
        product.id
      }', 'add')">
        <i class="fas fa-plus"></i> Add Stock
      </button>
      <button class="stock-btn deduct-stock-btn" onclick="openStockModal('${
        product.id
      }', 'deduct')">
        <i class="fas fa-minus"></i> Deduct Stock
      </button>
    </div>
  `;

  return card;
}

function getStatusTag(product) {
  const expiryDate = new Date(product.expiry);
  const daysUntilExpiry = Math.ceil(
    (expiryDate - new Date()) / (1000 * 60 * 60 * 24)
  );
  const lastStocked = product.lastStocked
    ? new Date(product.lastStocked)
    : null;
  const daysSinceLastStocked = lastStocked
    ? Math.ceil((new Date() - lastStocked) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate stock percentage
  const stockPercentage = (product.quantity / (product.quantity + 1)) * 100; // Using quantity + 1 as original quantity if not set

  if (product.quantity === 0) {
    return '<span class="status-tag status-out-of-stock">Out of Stock</span>';
  } else if (stockPercentage < 25) {
    return '<span class="status-tag status-low-stock">Low Stock</span>';
  } else if (daysUntilExpiry <= 7) {
    return '<span class="status-tag status-near-expiry">Near Expiry</span>';
  } else if (daysSinceLastStocked && daysSinceLastStocked <= 2) {
    return '<span class="status-tag status-recently-stocked">Recently Stocked</span>';
  }

  return "";
}

// Stock Management Modal Functions
function openStockModal(productId, action) {
  const modal = document.getElementById("stockModal");
  const form = document.getElementById("stockForm");
  const actionText = action === "add" ? "Add" : "Deduct";

  document.getElementById("stockAction").textContent = actionText;
  form.dataset.productId = productId;
  form.dataset.action = action;

  modal.style.display = "block";
}

function closeStockModal() {
  const modal = document.getElementById("stockModal");
  modal.style.display = "none";
  document.getElementById("stockForm").reset();
}

// Handle stock updates
document.getElementById("stockForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const productId = this.dataset.productId;
  const action = this.dataset.action;
  const quantity = parseInt(document.getElementById("stockQuantity").value);

  updateStock(productId, action, quantity);
  closeStockModal();
});

function updateStock(productId, action, quantity) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex !== -1) {
    const product = products[productIndex];
    const currentQuantity = parseInt(product.quantity);

    if (action === "add") {
      product.quantity = currentQuantity + quantity;
      product.lastStocked = new Date().toISOString();
    } else {
      product.quantity = Math.max(0, currentQuantity - quantity);
    }

    localStorage.setItem("products", JSON.stringify(products));
    displayProducts(products);
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("stockModal");
  if (event.target === modal) {
    closeStockModal();
  }
};
