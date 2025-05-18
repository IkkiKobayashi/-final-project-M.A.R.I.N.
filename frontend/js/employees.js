// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const employeesView = document.getElementById("employeesView");
  const addEmployeeBtn = document.getElementById("addEmployeeBtn");
  const employeeModal = document.getElementById("employeeModal");
  const employeeForm = document.getElementById("employeeForm");
  const closeModalBtn = document.querySelector(".close-modal-btn");
  const cancelBtn = document.querySelector(".cancel-btn");
  const imagePreview = document.getElementById("imagePreview");
  const profileImage = document.getElementById("profileImage");
  const searchInput = document.querySelector(".search-input");
  const viewToggleBtns = document.querySelectorAll(".toggle-btn");
  const imageUpload = document.querySelector(".image-upload");
  const saveBtn = document.querySelector(".save-btn");

  // Remove required attribute from profile image input to make it optional
  profileImage.removeAttribute("required");

  // State
  let employees = [];
  let currentView = "grid";
  let editingEmployeeId = null;
  let currentImageData = null;
  const API_URL = "https://final-project-m-a-r-i-n.onrender.com/api"; // Updated API URL for Render deployment

  // Event Listeners
  addEmployeeBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Form submission handler
  employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveEmployee();
  });

  // Save button click handler
  saveBtn.addEventListener("click", function (e) {
    e.preventDefault();
    saveEmployee();
  });

  // Image Upload Handling
  if (imagePreview && profileImage) {
    profileImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        showNotification("Please select an image file", "error");
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        currentImageData = e.target.result;
        updateImagePreview(currentImageData);
      };
      reader.onerror = function () {
        showNotification("Error reading image file", "error");
      };
      reader.readAsDataURL(file);
    });
  }

  // Image Upload Click Handler
  imageUpload.addEventListener("click", function () {
    profileImage.click();
  });

  // Search handler
  searchInput.addEventListener("input", handleSearch);

  // View toggle handlers
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => handleViewToggle(btn));
  });

  // Functions
  async function fetchEmployees() {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      employees = data;
      renderEmployees();
    } catch (error) {
      showNotification(error.message, "error");
    }
  }

  async function saveEmployee() {
    const name = document.getElementById("employeeName").value;
    const email = document.getElementById("employeeEmail").value;
    const role = document.getElementById("employeeRole").value;
    const phone = document.getElementById("employeePhone").value;
    const department = document.getElementById("employeeDepartment").value;
    const joinedDate = document.getElementById("employeeJoinedDate").value;

    // Validate required fields
    if (!name || !email || !role || !phone || !department || !joinedDate) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Get store ID from localStorage
    const storeId = localStorage.getItem("storeId");
    if (!storeId) {
      showNotification(
        "Store ID not found. Please select a store first.",
        "error"
      );
      return;
    }

    const employeeData = {
      name,
      email,
      role,
      phone,
      department,
      joinedDate,
      profileImage: currentImageData || "img/user img/store admin.jpg",
      store: storeId,
    };

    try {
      const url = editingEmployeeId
        ? `${API_URL}/employees/${editingEmployeeId}`
        : `${API_URL}/employees`;

      const method = editingEmployeeId ? "PUT" : "POST";

      const token = localStorage.getItem("token");
      if (!token) {
        showNotification(
          "Authentication token not found. Please log in again.",
          "error"
        );
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save employee");
      }

      showNotification("Employee saved successfully!");
      closeModal();
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      showNotification(error.message, "error");
    }
  }

  function openModal(employee = null) {
    employeeModal.classList.add("active");
    document.querySelector(".modal-title").textContent = employee
      ? "Edit Employee"
      : "Add Employee";
    if (employee) {
      editingEmployeeId = employee._id;
      populateForm(employee);
    } else {
      editingEmployeeId = null;
      employeeForm.reset();
      resetImagePreview();
    }
  }

  function closeModal() {
    employeeModal.classList.remove("active");
    employeeForm.reset();
    editingEmployeeId = null;
    resetImagePreview();
  }

  function updateImagePreview(imageData) {
    const imagePreview = document.getElementById("imagePreview");
    const icon = imagePreview.querySelector("i");
    const text = imagePreview.querySelector(".upload-text");

    let img = imagePreview.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      imagePreview.appendChild(img);
    }

    img.src = imageData;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    // Hide icon and text
    if (icon) icon.style.display = "none";
    if (text) text.style.display = "none";
  }

  function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  function populateForm(employee) {
    document.getElementById("employeeName").value = employee.name || "";
    document.getElementById("employeeEmail").value = employee.email || "";
    document.getElementById("employeeRole").value = employee.role || "";
    document.getElementById("employeePhone").value = employee.phone || "";
    document.getElementById("employeeDepartment").value =
      employee.department || "";
    document.getElementById("employeeJoinedDate").value =
      employee.joinedDate || "";

    if (employee.profileImage) {
      currentImageData = employee.profileImage;
      const imagePreview = document.getElementById("imagePreview");
      const img =
        imagePreview.querySelector("img") || document.createElement("img");
      img.src = employee.profileImage;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.borderRadius = "50%";
      imagePreview.appendChild(img);

      const icon = imagePreview.querySelector("i");
      const text = imagePreview.querySelector(".upload-text");
      if (icon) icon.style.display = "none";
      if (text) text.style.display = "none";
    }
  }

  function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEmployees = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.department.toLowerCase().includes(searchTerm)
    );
    renderEmployees(filteredEmployees);
  }

  function handleViewToggle(btn) {
    viewToggleBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.dataset.view;
    renderEmployees();
  }

  async function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete employee");
        }

        showNotification("Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        showNotification(error.message, "error");
      }
    }
  }

  function editEmployee(id) {
    const employee = employees.find((emp) => emp._id === id);
    if (employee) {
      openModal(employee);
    }
  }

  function renderEmployees(employeesToRender = employees) {
    console.log("Rendering employees:", employeesToRender);

    employeesView.className = `employees-view ${currentView}-view`;

    if (employeesToRender.length === 0) {
      employeesView.innerHTML =
        '<div class="no-employees">No employees found</div>';
      return;
    }

    employeesView.innerHTML = employeesToRender
      .map(
        (employee) => `
      <div class="employee-card">
        <div class="employee-image">
          <img src="${employee.profileImage}" alt="${
            employee.name
          }" onerror="this.src='assets/profile-placeholder.jpg'">
        </div>
        <div class="employee-info">
          <h3>${employee.name}</h3>
          <p class="role">${
            employee.role.charAt(0).toUpperCase() + employee.role.slice(1)
          }</p>
          <p class="department">${employee.department}</p>
          <p class="email">${employee.email}</p>
          <p class="phone">${employee.phone}</p>
          <p class="joined-date">Joined: ${new Date(
            employee.joinedDate
          ).toLocaleDateString()}</p>
        </div>
        <div class="employee-actions">
          <button class="edit-btn" onclick="editEmployee('${employee._id}')">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
          <button class="delete-btn" onclick="deleteEmployee('${employee._id}')">
            <i class="fas fa-trash"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Make functions globally available
  window.editEmployee = editEmployee;
  window.deleteEmployee = deleteEmployee;

  // Initial fetch of employees
  fetchEmployees();
});

// Function to reset image preview
function resetImagePreview() {
  const imagePreview = document.getElementById("imagePreview");
  const uploadText = imagePreview.querySelector(".upload-text");
  const uploadIcon = imagePreview.querySelector("i");
  const img = imagePreview.querySelector("img");

  if (img) {
    img.remove();
  }
  if (uploadIcon) {
    uploadIcon.style.display = "block";
  }
  if (uploadText) {
    uploadText.style.display = "block";
  }
  currentImageData = null;
}
