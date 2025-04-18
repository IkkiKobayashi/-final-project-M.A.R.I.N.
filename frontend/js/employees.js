document.addEventListener("DOMContentLoaded", () => {
  // Sample employee data (in a real app, this would come from a database)
  let employees = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "(123) 456-7890",
      role: "manager",
      department: "Sales",
      joinedDate: "Jan 15, 2022",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "(234) 567-8901",
      role: "staff",
      department: "Inventory",
      joinedDate: "Mar 10, 2022",
    },
    {
      id: 3,
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.johnson@example.com",
      phone: "(345) 678-9012",
      role: "staff",
      department: "Customer Service",
      joinedDate: "Apr 22, 2022",
    },
    {
      id: 4,
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@example.com",
      phone: "(456) 789-0123",
      role: "manager",
      department: "Inventory",
      joinedDate: "Feb 5, 2022",
    },
    {
      id: 5,
      firstName: "Michael",
      lastName: "Wilson",
      email: "michael.wilson@example.com",
      phone: "(567) 890-1234",
      role: "staff",
      department: "Sales",
      joinedDate: "May 18, 2022",
    },
    {
      id: 6,
      firstName: "Sarah",
      lastName: "Brown",
      email: "sarah.brown@example.com",
      phone: "(678) 901-2345",
      role: "staff",
      department: "Customer Service",
      joinedDate: "Jun 30, 2022",
    },
  ]

  // DOM elements
  const viewBtns = document.querySelectorAll(".view-btn")
  const gridView = document.getElementById("grid-view")
  const listView = document.getElementById("list-view")
  const addEmployeeBtn = document.getElementById("add-employee-btn")
  const addEmployeeModal = document.getElementById("add-employee-modal")
  const editEmployeeModal = document.getElementById("edit-employee-modal")
  const deleteConfirmModal = document.getElementById("delete-confirm-modal")
  const addEmployeeForm = document.getElementById("add-employee-form")
  const editEmployeeForm = document.getElementById("edit-employee-form")
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

  // Open add employee modal
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener("click", () => {
      addEmployeeModal.classList.add("show")
    })
  }

  // Close modals
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      addEmployeeModal.classList.remove("show")
      editEmployeeModal.classList.remove("show")
      deleteConfirmModal.classList.remove("show")
    })
  })

  // Add employee form submission
  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const firstName = document.getElementById("employee-first-name").value
      const lastName = document.getElementById("employee-last-name").value
      const email = document.getElementById("employee-email").value
      const phone = document.getElementById("employee-phone").value
      const role = document.getElementById("employee-role").value
      const department = document.getElementById("employee-department").value

      // Generate a new ID (in a real app, this would be handled by the backend)
      const newId = employees.length > 0 ? Math.max(...employees.map((e) => e.id)) + 1 : 1

      // Get current date for joined date
      const today = new Date()
      const joinedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

      // Add new employee
      employees.push({
        id: newId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        role: role,
        department: department.charAt(0).toUpperCase() + department.slice(1).replace("-", " "), // Format department
        joinedDate: joinedDate,
      })

      // Reset form and close modal
      addEmployeeForm.reset()
      addEmployeeModal.classList.remove("show")

      // In a real app, you would refresh the employee list or add the new employee to the DOM
      alert("Employee added successfully!")
    })
  }

  // Edit employee functionality
  const editBtns = document.querySelectorAll(".edit-btn")

  editBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const employeeId = Number.parseInt(this.getAttribute("data-id"))
      openEditModal(employeeId)
    })
  })

  function openEditModal(employeeId) {
    const employee = employees.find((e) => e.id === employeeId)

    if (employee) {
      document.getElementById("edit-employee-id").value = employee.id
      document.getElementById("edit-employee-first-name").value = employee.firstName
      document.getElementById("edit-employee-last-name").value = employee.lastName
      document.getElementById("edit-employee-email").value = employee.email
      document.getElementById("edit-employee-phone").value = employee.phone
      document.getElementById("edit-employee-role").value = employee.role
      document.getElementById("edit-employee-department").value = employee.department.toLowerCase().replace(" ", "-")

      editEmployeeModal.classList.add("show")
    }
  }

  // Edit employee form submission
  if (editEmployeeForm) {
    editEmployeeForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const id = Number.parseInt(document.getElementById("edit-employee-id").value)
      const firstName = document.getElementById("edit-employee-first-name").value
      const lastName = document.getElementById("edit-employee-last-name").value
      const email = document.getElementById("edit-employee-email").value
      const phone = document.getElementById("edit-employee-phone").value
      const role = document.getElementById("edit-employee-role").value
      const department = document.getElementById("edit-employee-department").value

      // Update employee
      const employeeIndex = employees.findIndex((e) => e.id === id)

      if (employeeIndex !== -1) {
        employees[employeeIndex] = {
          ...employees[employeeIndex],
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          role: role,
          department: department.charAt(0).toUpperCase() + department.slice(1).replace("-", " "), // Format department
        }
      }

      // Reset form and close modal
      editEmployeeForm.reset()
      editEmployeeModal.classList.remove("show")

      // In a real app, you would update the employee in the DOM
      alert("Employee updated successfully!")
    })
  }

  // Delete employee functionality
  const deleteBtns = document.querySelectorAll(".delete-btn")

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const employeeId = Number.parseInt(this.getAttribute("data-id"))
      openDeleteModal(employeeId)
    })
  })

  function openDeleteModal(employeeId) {
    document.getElementById("delete-employee-id").value = employeeId
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
      const employeeId = Number.parseInt(document.getElementById("delete-employee-id").value)

      // Remove employee
      employees = employees.filter((e) => e.id !== employeeId)

      // Close modal
      deleteConfirmModal.classList.remove("show")

      // In a real app, you would remove the employee from the DOM
      alert("Employee deleted successfully!")
    })
  }

  // Filter functionality
  const roleFilter = document.getElementById("role-filter")
  const departmentFilter = document.getElementById("department-filter")

  function applyFilters() {
    const role = roleFilter.value
    const department = departmentFilter.value

    console.log("Filtering by:", { role, department })

    // In a real app, this would filter the employees based on the selected filters
  }

  if (roleFilter) {
    roleFilter.addEventListener("change", applyFilters)
  }

  if (departmentFilter) {
    departmentFilter.addEventListener("change", applyFilters)
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

        // In a real app, this would load the corresponding page of employees
        console.log("Navigating to page:", this.textContent.trim())
      })
    }
  })
})
