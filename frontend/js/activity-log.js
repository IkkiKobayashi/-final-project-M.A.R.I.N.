document.addEventListener("DOMContentLoaded", async function () {
  // Get store information from localStorage
  const storeInfo = JSON.parse(localStorage.getItem("selectedStore"));
  if (storeInfo) {
    document.querySelector(".store-name").textContent =
      "Store: " + storeInfo.name;
    document.querySelector(".store-address").textContent =
      "Address: " + storeInfo.address;
  }

  // Initialize filters
  const userFilter = document.getElementById("user-filter");
  const dateFilter = document.getElementById("date-filter");
  const actionFilter = document.getElementById("action-filter");

  let allLogs = [];
  let users = [];

  // Fetch and display activity logs from backend
  async function fetchActivityLogs() {
    try {
      if (!storeInfo || !storeInfo._id) return;
      const res = await fetch(`/activity-log/store/${storeInfo._id}`);
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      allLogs = await res.json();

      // Extract unique users for filter
      users = [];
      allLogs.forEach((log) => {
        if (log.user && !users.some((u) => u._id === log.user._id)) {
          users.push(log.user);
        }
      });
      populateUserFilter(users);

      displayActivityLogs(allLogs);
    } catch (error) {
      showError("Failed to load activity logs");
    }
  }

  // Populate user filter dropdown
  function populateUserFilter(users) {
    userFilter.innerHTML = '<option value="">All Users</option>';
    users.forEach((user) => {
      if (user) {
        const option = document.createElement("option");
        option.value = user._id;
        option.textContent = user.name + (user.role ? ` (${user.role})` : "");
        userFilter.appendChild(option);
      }
    });
  }

  // Display activity logs in the table
  function displayActivityLogs(logs) {
    const tbody = document.getElementById("activity-log-body");
    tbody.innerHTML = "";

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    logs.forEach((log) => {
      const row = document.createElement("tr");
      const timestamp = new Date(log.createdAt).toLocaleString();

      // Action badge
      const actionBadge = document.createElement("span");
      actionBadge.className = `action-badge ${log.action}`;
      actionBadge.textContent =
        log.action.charAt(0).toUpperCase() + log.action.slice(1);

      row.innerHTML = `
        <td>${timestamp}</td>
        <td>${log.user ? log.user.name : "Unknown"}</td>
        <td>${actionBadge.outerHTML}</td>
        <td>${log.entityType}</td>
        <td>${log.details}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Filter logs based on selected filters
  function filterActivityLogs() {
    let filteredLogs = allLogs;

    const selectedUserId = userFilter.value;
    const selectedDate = dateFilter.value;
    const selectedAction = actionFilter.value;

    if (selectedUserId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.user && log.user._id === selectedUserId
      );
    }
    if (selectedDate) {
      filteredLogs = filteredLogs.filter((log) => {
        const logDate = new Date(log.createdAt).toISOString().split("T")[0];
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

  // Show error message
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

  // Event listeners for filters
  userFilter.addEventListener("change", filterActivityLogs);
  dateFilter.addEventListener("change", filterActivityLogs);
  actionFilter.addEventListener("change", filterActivityLogs);

  // Add search bar filter for activity log page
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      const searchTerm = e.target.value.toLowerCase();
      // Filter logs by search term (search in user, entityType, details)
      let filteredLogs = allLogs.filter((log) => {
        const user = log.user ? log.user.name.toLowerCase() : "";
        const entityType = log.entityType ? log.entityType.toLowerCase() : "";
        const details = log.details ? log.details.toLowerCase() : "";
        return (
          user.includes(searchTerm) ||
          entityType.includes(searchTerm) ||
          details.includes(searchTerm)
        );
      });
      displayActivityLogs(filteredLogs);
    });
  }

  // Initial fetch
  fetchActivityLogs();
});
