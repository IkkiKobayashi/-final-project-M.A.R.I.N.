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
  const profileImageInput = document.getElementById("profileImage");
  const searchInput = document.querySelector(".search-input");
  const viewToggleBtns = document.querySelectorAll(".toggle-btn");
  const imageUpload = document.querySelector(".image-upload");
  const saveBtn = document.querySelector(".save-btn");

  // Remove required attribute from profile image input to make it optional
  profileImageInput.removeAttribute("required");

  // State
  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  let currentView = "grid";
  let editingEmployeeId = null;
  let currentImageData = null;

  // Event Listeners
  addEmployeeBtn.addEventListener("click", () => openModal());
  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Account creation toggle
  const createAccountCheckbox = document.getElementById("createAccount");
  const accountFields = document.querySelector(".account-fields");
  createAccountCheckbox.addEventListener("change", function () {
    accountFields.style.display = this.checked ? "block" : "none";
    if (this.checked) {
      document.getElementById("accountEmail").required = true;
      document.getElementById("accountPassword").required = true;
      document.getElementById("confirmPassword").required = true;
    } else {
      document.getElementById("accountEmail").required = false;
      document.getElementById("accountPassword").required = false;
      document.getElementById("confirmPassword").required = false;
    }
  });

  // Form submission handler
  employeeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    saveEmployee();
  });

  // Save button click handler - direct approach
  saveBtn.addEventListener("click", function () {
    saveEmployee();
  });

  // Image upload handler
  imageUpload.addEventListener("click", function () {
    profileImageInput.click();
  });

  profileImageInput.addEventListener("change", handleImageUpload);

  // Search handler
  searchInput.addEventListener("input", handleSearch);

  // View toggle handlers
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => handleViewToggle(btn));
  });

  // Functions
  function saveEmployee() {
    console.log("saveEmployee function called");

    // Get form values
    const name = document.getElementById("employeeName").value.trim();
    const email = document.getElementById("employeeEmail").value.trim();
    const role = document.getElementById("employeeRole").value;
    const phone = document.getElementById("employeePhone").value.trim();
    const department = document
      .getElementById("employeeDepartment")
      .value.trim();
    const joinedDate = document.getElementById("employeeJoinedDate").value;
    const createAccount = document.getElementById("createAccount").checked;
    const accountEmail = document.getElementById("accountEmail").value.trim();
    const accountPassword = document.getElementById("accountPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate required fields
    if (!name || !email || !role || !phone || !department || !joinedDate) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Validate account creation fields if account creation is checked
    if (createAccount) {
      if (!accountEmail || !accountPassword || !confirmPassword) {
        showNotification("Please fill in all account creation fields", "error");
        return;
      }
      if (accountPassword !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
      }
      if (accountPassword.length < 8) {
        showNotification(
          "Password must be at least 8 characters long",
          "error"
        );
        return;
      }
    }

    // Create employee object
    const employee = {
      id: editingEmployeeId || Date.now().toString(),
      name: name,
      email: email,
      role: role,
      phone: phone,
      department: department,
      joinedDate: joinedDate,
      profileImage: currentImageData || "assets/profile-placeholder.jpg",
    };

    // Add account information if account creation is checked
    if (createAccount) {
      employee.account = {
        email: accountEmail,
        password: accountPassword,
        role: role,
      };
    }

    // Update or add employee
    if (editingEmployeeId) {
      const index = employees.findIndex((emp) => emp.id === editingEmployeeId);
      if (index !== -1) {
        employees[index] = employee;
      }
    } else {
      employees.push(employee);
    }

    // Save to localStorage
    try {
      localStorage.setItem("employees", JSON.stringify(employees));
      console.log("Saved to localStorage:", employees);

      // Update UI
      renderEmployees();
      closeModal();

      // Show success message
      showNotification("Employee saved successfully!");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      showNotification(
        "Error saving employee data. Please try again.",
        "error"
      );
    }
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
      imagePreview.innerHTML = '<i class="fas fa-user"></i>';
      currentImageData = null;
      document.getElementById("createAccount").checked = false;
      document.querySelector(".account-fields").style.display = "none";
    }
  }

  function closeModal() {
    employeeModal.classList.remove("active");
    employeeForm.reset();
    editingEmployeeId = null;
    currentImageData = null;
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
      imagePreview.innerHTML = `<img src="${employee.profileImage}" alt="Profile Preview">`;
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
      try {
        localStorage.setItem("employees", JSON.stringify(employees));
        renderEmployees();
        showNotification("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        showNotification("Error deleting employee. Please try again.", "error");
      }
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
          <button class="edit-btn" data-id="${employee.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" data-id="${employee.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `
      )
      .join("");

    // Add event listeners to the newly created buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editEmployee(id);
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteEmployee(id);
      });
    });
  }

  // Make functions globally available
  window.editEmployee = editEmployee;
  window.deleteEmployee = deleteEmployee;

  // Initial render
  renderEmployees();
});
