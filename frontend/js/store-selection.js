// Store Data Management
let stores = [];

// DOM Elements
const storeGrid = document.querySelector(".store-grid");
const searchInput = document.querySelector(".search-box input");
const filterButtons = document.querySelectorAll(".filter-btn");
const addStoreBtn = document.querySelector(".add-store-btn");
const emptyState = document.querySelector(".empty-state");

// Add Modal Elements
const addModal = document.querySelector("#addStoreModal");
const closeAddModalBtn = addModal.querySelector(".close-modal-btn");
const addStoreForm = document.querySelector("#addStoreForm");
const cancelAddStoreBtn = document.querySelector("#cancelAddStore");
const submitAddStoreBtn = document.querySelector("#submitAddStore");
const imageInput = document.querySelector("#storeImage");
const imagePreview = document.querySelector("#imagePreview");

// Edit Modal Elements
const editModal = document.querySelector("#editStoreModal");
const closeEditModalBtn = editModal.querySelector(".close-modal-btn");
const editStoreForm = document.querySelector("#editStoreForm");
const cancelEditStoreBtn = document.querySelector("#cancelEditStore");
const submitEditStoreBtn = document.querySelector("#submitEditStore");
const editImageInput = document.querySelector("#editStoreImage");
const editImagePreview = document.querySelector("#editImagePreview");

// Current States
let currentFilter = "all stores";
let searchQuery = "";
let selectedImage = null;
let editingStoreId = null;

// Utility Functions
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  return "Just now";
};

// Store Card Creation
const createStoreCard = (store) => {
  const card = document.createElement("div");
  card.className = "store-card";
  card.innerHTML = `
        <div class="store-actions">
            <button class="action-btn edit-btn" title="Edit Store" data-id="${
              store.id
            }">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" title="Delete Store" data-id="${
              store.id
            }">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
        <div class="store-status status-${store.status}">
            <i class="fas fa-circle"></i>
            ${store.status.charAt(0).toUpperCase() + store.status.slice(1)}
        </div>
        <img src="${store.image}" alt="${store.name}" class="store-image">
        <div class="store-content">
            <h3 class="store-title">${store.name}</h3>
            <div class="store-details">
                <div class="store-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${store.address}</span>
                </div>
                <div class="store-info">
                    <i class="fas fa-user"></i>
                    <span>${store.manager}</span>
                </div>
                <div class="store-info">
                    <i class="fas fa-clock"></i>
                    <span>Last updated: ${formatTimeAgo(
                      store.lastUpdated
                    )}</span>
                </div>
            </div>
        </div>
    `;

  // Add Event Listeners
  card.addEventListener("click", (e) => {
    if (!e.target.closest(".action-btn")) {
      navigateToStore(store.id);
    }
  });

  const editBtn = card.querySelector(".edit-btn");
  const deleteBtn = card.querySelector(".delete-btn");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    editStore(store.id);
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteStore(store.id);
  });

  return card;
};

// Render Functions
const renderStores = () => {
  const filteredStores = stores.filter((store) => {
    const matchesFilter =
      currentFilter === "all stores" || store.status === currentFilter;
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  storeGrid.innerHTML = "";

  if (filteredStores.length === 0) {
    emptyState.style.display = "block";
    storeGrid.style.display = "none";
  } else {
    emptyState.style.display = "none";
    storeGrid.style.display = "grid";
    filteredStores.forEach((store) => {
      storeGrid.appendChild(createStoreCard(store));
    });
  }
};

// Event Handlers
const navigateToStore = (storeId) => {
  // Navigate to store dashboard
  console.log(`Navigating to store ${storeId}`);
};

const editStore = (storeId) => {
  openEditModal(storeId);
};

const deleteStore = (storeId) => {
  if (confirm("Are you sure you want to delete this store?")) {
    stores = stores.filter((store) => store.id !== storeId);
    renderStores();
  }
};

// Modal Functions
const openAddModal = () => {
  addModal.classList.add("active");
  document.body.style.overflow = "hidden";
};

const closeAddModal = () => {
  addModal.classList.remove("active");
  document.body.style.overflow = "";
  resetAddForm();
};

const openEditModal = (storeId) => {
  editingStoreId = storeId;
  const store = stores.find((s) => s.id === storeId);
  if (!store) return;

  // Populate form fields
  editStoreForm.elements.storeId.value = store.id;
  editStoreForm.elements.storeName.value = store.name;
  editStoreForm.elements.storeAddress.value = store.address;
  editStoreForm.elements.storeManager.value = store.manager;
  editStoreForm.elements.storeStatus.value = store.status;

  // Show current image
  editImagePreview.innerHTML = `<img src="${store.image}" alt="${store.name}">`;
  selectedImage = store.image;

  editModal.classList.add("active");
  document.body.style.overflow = "hidden";
};

const closeEditModal = () => {
  editModal.classList.remove("active");
  document.body.style.overflow = "";
  resetEditForm();
};

const resetAddForm = () => {
  addStoreForm.reset();
  imagePreview.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload image</span>
    `;
  selectedImage = null;
};

const resetEditForm = () => {
  editStoreForm.reset();
  editImagePreview.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload new image</span>
    `;
  selectedImage = null;
  editingStoreId = null;
};

// Image Preview Handlers
const handleImageUpload = (e, previewElement) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage = e.target.result;
      previewElement.innerHTML = `<img src="${selectedImage}" alt="Store Preview">`;
    };
    reader.readAsDataURL(file);
  }
};

// Form Submission Handlers
const handleAddStore = (e) => {
  e.preventDefault();

  const formData = new FormData(addStoreForm);
  const newStore = {
    id: Date.now(),
    name: formData.get("storeName"),
    address: formData.get("storeAddress"),
    manager: formData.get("storeManager"),
    status: formData.get("storeStatus"),
    lastUpdated: new Date(),
    image: selectedImage || "https://via.placeholder.com/400x200",
  };

  stores.unshift(newStore);
  closeAddModal();
  renderStores();
  showNotification("Store added successfully!");
};

const handleEditStore = (e) => {
  e.preventDefault();

  const formData = new FormData(editStoreForm);
  const updatedStore = {
    id: parseInt(formData.get("storeId")),
    name: formData.get("storeName"),
    address: formData.get("storeAddress"),
    manager: formData.get("storeManager"),
    status: formData.get("storeStatus"),
    lastUpdated: new Date(),
    image: selectedImage || stores.find((s) => s.id === editingStoreId).image,
  };

  // Update store in array
  stores = stores.map((store) =>
    store.id === updatedStore.id ? updatedStore : store
  );

  closeEditModal();
  renderStores();
  showNotification("Store updated successfully!");
};

// Notification Function
const showNotification = (message) => {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Event Listeners
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderStores();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.textContent.trim().toLowerCase();
    renderStores();
  });
});

// Add Modal Event Listeners
addStoreBtn.addEventListener("click", openAddModal);
closeAddModalBtn.addEventListener("click", closeAddModal);
cancelAddStoreBtn.addEventListener("click", closeAddModal);
imageInput.addEventListener("change", (e) =>
  handleImageUpload(e, imagePreview)
);
addStoreForm.addEventListener("submit", handleAddStore);
submitAddStoreBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (addStoreForm.checkValidity()) {
    handleAddStore(e);
  } else {
    addStoreForm.reportValidity();
  }
});

// Edit Modal Event Listeners
closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditStoreBtn.addEventListener("click", closeEditModal);
editImageInput.addEventListener("change", (e) =>
  handleImageUpload(e, editImagePreview)
);
editStoreForm.addEventListener("submit", handleEditStore);
submitEditStoreBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (editStoreForm.checkValidity()) {
    handleEditStore(e);
  } else {
    editStoreForm.reportValidity();
  }
});

// Close modals when clicking outside
[addModal, editModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.contains("active") &&
        (modal === addModal ? closeAddModal() : closeEditModal());
    }
  });
});

// Initial Render
renderStores();
