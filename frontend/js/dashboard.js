// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard data
  initializeDashboard();
});

// Function to initialize dashboard data
function initializeDashboard() {
  // In a real application, this would fetch data from an API
  // For now, we'll use sample data
  const sampleData = {
    totalProducts: 0,
    currentInventory: 0,
    itemsNearExpiry: 0,
    outOfStock: 0,
    alerts: [], // Alerts will be populated based on inventory data
    recentActivity: [], // Activity will be populated from activity log
  };

  // Update summary cards
  updateSummaryCards(sampleData);

  // Update inventory alerts (will be populated when inventory data is available)
  updateInventoryAlerts(sampleData.alerts);

  // Update recent activity (will be populated from activity log)
  updateRecentActivity(sampleData.recentActivity);
}

// Function to update summary cards
function updateSummaryCards(data) {
  const cards = {
    "Total Products": data.totalProducts,
    "Current Inventory": data.currentInventory,
    "Items Near Expiry": data.itemsNearExpiry,
    "Out of Stock": data.outOfStock,
  };

  document.querySelectorAll(".card").forEach((card) => {
    const title = card.querySelector("h3").textContent;
    const countElement = card.querySelector(".count");
    if (cards[title] !== undefined) {
      countElement.textContent = cards[title];
    }
  });
}

// Function to update inventory alerts
function updateInventoryAlerts(alerts) {
  const alertsContainer = document.querySelector(".alerts-container");
  alertsContainer.innerHTML = "";

  if (alerts.length === 0) {
    // Show a message when there are no alerts
    alertsContainer.innerHTML = `
      <div class="no-alerts">
        <i class="fas fa-check-circle"></i>
        <p>No inventory alerts at this time.</p>
      </div>
    `;
    return;
  }

  alerts.forEach((alert) => {
    const alertElement = document.createElement("div");
    alertElement.className = `alert ${alert.type}`;

    const icon =
      alert.type === "low-stock" ? "fa-exclamation-circle" : "fa-clock";
    alertElement.innerHTML = `
      <i class="fas ${icon}"></i>
      <div class="alert-content">
        <h4>${alert.product}</h4>
        <p>${alert.message}</p>
        ${
          alert.type === "low-stock"
            ? `<span>Current Stock: ${alert.currentStock}</span>`
            : `<span>Days Left: ${alert.daysLeft}</span>`
        }
      </div>
    `;

    alertsContainer.appendChild(alertElement);
  });
}

// Function to update recent activity
function updateRecentActivity(activities) {
  const activityFeed = document.querySelector(".activity-feed");
  activityFeed.innerHTML = "";

  if (activities.length === 0) {
    // Show a message when there are no activities
    activityFeed.innerHTML = `
      <div class="no-activity">
        <i class="fas fa-history"></i>
        <p>No recent activity to display.</p>
      </div>
    `;
    return;
  }

  activities.forEach((activity) => {
    const activityElement = document.createElement("div");
    activityElement.className = "activity-item";

    activityElement.innerHTML = `
      <div class="activity-icon">
        <i class="fas ${getActivityIcon(activity.action)}"></i>
      </div>
      <div class="activity-content">
        <p class="activity-text">
          <strong>${activity.user}</strong> ${activity.action} ${activity.item}
        </p>
        <span class="activity-time">${activity.timestamp}</span>
      </div>
    `;

    activityFeed.appendChild(activityElement);
  });
}

// Helper function to get activity icon
function getActivityIcon(action) {
  const icons = {
    Added: "fa-plus-circle",
    Updated: "fa-edit",
    Deleted: "fa-trash-alt",
  };
  return icons[action] || "fa-info-circle";
}
