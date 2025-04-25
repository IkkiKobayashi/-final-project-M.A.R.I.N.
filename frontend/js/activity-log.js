document.addEventListener("DOMContentLoaded", function () {
  // Get store information from localStorage
  const storeInfo = JSON.parse(localStorage.getItem("selectedStore"));
  if (storeInfo) {
    document.querySelector(".store-name").textContent += storeInfo.name;
    document.querySelector(".store-address").textContent += storeInfo.address;
  }

  // Initialize filters
  const userFilter = document.getElementById("user-filter");
  const dateFilter = document.getElementById("date-filter");
  const actionFilter = document.getElementById("action-filter");

  // Fetch and display activity logs
  fetchActivityLogs();

  // Add event listeners for filters
  userFilter.addEventListener("change", filterActivityLogs);
  dateFilter.addEventListener("change", filterActivityLogs);
  actionFilter.addEventListener("change", filterActivityLogs);

  // Function to fetch activity logs
  async function fetchActivityLogs() {
    try {
      // Get data from localStorage
      const employees = JSON.parse(localStorage.getItem("employees")) || [];
      const products = JSON.parse(localStorage.getItem("products")) || [];
      const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
      const activityLogs =
        JSON.parse(localStorage.getItem("activityLogs")) || [];

      // Populate user filter options from employees
      populateUserFilter(employees);

      // Display logs
      displayActivityLogs(activityLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      showError("Failed to load activity logs");
    }
  }

  // Function to populate user filter
  function populateUserFilter(employees) {
    const userFilter = document.getElementById("user-filter");
    userFilter.innerHTML = '<option value="">All Users</option>';

    employees.forEach((employee) => {
      const option = document.createElement("option");
      option.value = employee.id;
      option.textContent = employee.name;
      userFilter.appendChild(option);
    });
  }

  // Function to display activity logs
  function displayActivityLogs(logs) {
    const tbody = document.getElementById("activity-log-body");
    tbody.innerHTML = "";

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    logs.forEach((log) => {
      const row = document.createElement("tr");

      // Format timestamp
      const timestamp = new Date(log.timestamp).toLocaleString();

      // Create action badge
      const actionBadge = document.createElement("span");
      actionBadge.className = `action-badge ${log.action}`;
      actionBadge.textContent =
        log.action.charAt(0).toUpperCase() + log.action.slice(1);

      row.innerHTML = `
          <td>${timestamp}</td>
          <td>${log.userName}</td>
          <td>${actionBadge.outerHTML}</td>
          <td>${log.entityType}</td>
          <td>${log.details}</td>
      `;

      tbody.appendChild(row);
    });
  }

  // Function to filter activity logs
  function filterActivityLogs() {
    const selectedUserId = userFilter.value;
    const selectedDate = dateFilter.value;
    const selectedAction = actionFilter.value;

    const activityLogs = JSON.parse(localStorage.getItem("activityLogs")) || [];
    let filteredLogs = activityLogs;

    if (selectedUserId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.userId === selectedUserId
      );
    }

    if (selectedDate) {
      filteredLogs = filteredLogs.filter((log) => {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        return logDate === selectedDate;
      });
    }

    if (selectedAction) {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === selectedAction
      );
    }

    displayActivityLogs(filteredLogs);
  }

  // Function to show error message
  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;

    const contentWrapper = document.querySelector(".content-wrapper");
    contentWrapper.insertBefore(errorDiv, contentWrapper.firstChild);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
});

// Function to log activity (to be called from other modules)
function logActivity(userId, userName, action, entityType, details) {
  const activityLogs = JSON.parse(localStorage.getItem("activityLogs")) || [];

  const newLog = {
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    entityType,
    details,
  };

  activityLogs.push(newLog);
  localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
}
