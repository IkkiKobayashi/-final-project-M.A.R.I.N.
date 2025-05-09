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
  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  let currentView = "grid";
  let editingEmployeeId = null;
  let currentImageData = null;

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
      if (file) {
        if (!file.type.match("image.*")) {
          showNotification("Please select an image file", "error");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          showNotification("Image size should be less than 5MB", "error");
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          currentImageData = e.target.result;
          updateImagePreview(currentImageData);
        };
        reader.readAsDataURL(file);
      }
    });
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

  // Search handler
  searchInput.addEventListener("input", handleSearch);

  // View toggle handlers
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => handleViewToggle(btn));
  });

  // Image Upload Handling
  imageUpload.addEventListener("click", function () {
    profileImage.click();
  });

  profileImage.addEventListener("change", handleImageUpload);

  // Functions
  function saveEmployee() {
    const name = document.getElementById("employeeName").value;
    const email = document.getElementById("employeeEmail").value;
    const role = document.getElementById("employeeRole").value;
    const phone = document.getElementById("employeePhone").value;
    const department = document.getElementById("employeeDepartment").value;
    const joinedDate = document.getElementById("employeeJoinedDate").value;
    const accountPassword = document.getElementById("accountPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate required fields
    if (
      !name ||
      !email ||
      !role ||
      !phone ||
      !department ||
      !joinedDate ||
      !accountPassword ||
      !confirmPassword
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Validate passwords
    if (accountPassword !== confirmPassword) {
      showNotification("Passwords do not match", "error");
      return;
    }
    if (accountPassword.length < 8) {
      showNotification("Password must be at least 8 characters long", "error");
      return;
    }

    const employee = {
      id: editingEmployeeId || Date.now().toString(),
      name,
      email,
      role,
      phone,
      department,
      joinedDate,
      profileImage: currentImageData || "img/user img/store admin.jpg",
      account: {
        email: email, // Using the same email for login
        password: accountPassword,
        role: role,
      },
    };

    if (editingEmployeeId) {
      const index = employees.findIndex((emp) => emp.id === editingEmployeeId);
      if (index !== -1) {
        // Preserve the existing image if no new image was uploaded
        if (!currentImageData) {
          employee.profileImage = employees[index].profileImage;
        }
        employees[index] = employee;
      }
    } else {
      employees.push(employee);
    }

    localStorage.setItem("employees", JSON.stringify(employees));
    showNotification("Employee saved successfully!");
    closeModal();
    renderEmployees();
  }

  function openModal(employee = null) {
    employeeModal.classList.add("active");
    if (employee) {
      editingEmployeeId = employee.id;
      document.querySelector(".modal-title").textContent = "Edit Employee";
      populateForm(employee);
    } else {
      editingEmployeeId = null;
      document.querySelector(".modal-title").textContent = "Add New Employee";
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

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match("image.*")) {
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
        imagePreview.innerHTML = `<img src="${currentImageData}" alt="Profile Preview">`;
      };
      reader.onerror = function () {
        showNotification("Error reading image file", "error");
      };
      reader.readAsDataURL(file);
    }
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

  function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
      employees = employees.filter((emp) => emp.id !== id);
      localStorage.setItem("employees", JSON.stringify(employees));
      renderEmployees();
      showNotification("Employee deleted successfully");
    }
  }

  function editEmployee(id) {
    const employee = employees.find((emp) => emp.id === id);
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
          <button class="edit-btn" onclick="editEmployee('${employee.id}')">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
          <button class="delete-btn" onclick="deleteEmployee('${employee.id}')">
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

  // Initial render
  renderEmployees();
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

// Make handleImageUpload globally available
window.handleImageUpload = function (input) {
  const file = input.files[0];
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
    const imagePreview = document.getElementById("imagePreview");
    const icon = imagePreview.querySelector("i");
    const text = imagePreview.querySelector(".upload-text");

    // Create or update image element
    let img = imagePreview.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      imagePreview.appendChild(img);
    }
    img.src = e.target.result;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "50%";

    // Hide icon and text
    if (icon) icon.style.display = "none";
    if (text) text.style.display = "none";
  };
  reader.readAsDataURL(file);
};
