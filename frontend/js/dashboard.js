document.addEventListener("DOMContentLoaded", async function () {
  const storeInfo = JSON.parse(localStorage.getItem("selectedStore"));
  if (!storeInfo) {
    window.location.href = "store-selection.html";
    return;
  }

  // Update store info
  document.querySelector(".store-name").textContent = storeInfo.name;
  document.querySelector(".store-address").textContent = storeInfo.address;

  // Fetch and update dashboard metrics
  async function updateDashboardMetrics() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/dashboard/metrics/${storeInfo.id}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        // Update summary cards
        document.querySelector(".card:nth-child(1) .count").textContent =
          data.metrics.totalProducts;
        document.querySelector(".card:nth-child(2) .count").textContent =
          data.metrics.currentInventory;
        document.querySelector(".card:nth-child(3) .count").textContent =
          data.metrics.nearExpiry;
        document.querySelector(".card:nth-child(4) .count").textContent =
          data.metrics.outOfStock;
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  }

  // Fetch and display inventory alerts from backend
  async function updateInventoryAlertsFromAPI() {
    const alertsContainer = document.querySelector(".alerts-container");
    alertsContainer.innerHTML = `<div>Loading alerts...</div>`;
    try {
      const response = await fetch(
        `http://localhost:5000/api/dashboard/alerts/${storeInfo.id}`,
        { credentials: "include" }
      );
      const alerts = await response.json();

      if (Array.isArray(alerts) && alerts.length > 0) {
        alertsContainer.innerHTML = alerts
          .map((alert) => {
            let itemsList = "";
            if (alert.items && alert.items.length > 0) {
              itemsList =
                "<ul>" +
                alert.items
                  .map((item) => {
                    if (alert.type === "low_stock") {
                      return `<li>${item.name} - ${item.quantity} left</li>`;
                    } else if (alert.type === "expiring_soon") {
                      return `<li>${item.name} - Expires: ${new Date(
                        item.expiryDate
                      ).toLocaleDateString()}</li>`;
                    }
                    return `<li>${item.name}</li>`;
                  })
                  .join("") +
                "</ul>";
            }
            return `
              <div class="alert ${alert.type}">
                <i class="fas ${
                  alert.type === "low_stock"
                    ? "fa-exclamation-triangle"
                    : "fa-clock"
                }"></i>
                <span>${alert.message}</span>
                ${itemsList}
              </div>
            `;
          })
          .join("");
      } else {
        alertsContainer.innerHTML = `
          <div class="no-alerts">
            <i class="fas fa-check-circle"></i>
            <p>No inventory alerts at this time.</p>
          </div>
        `;
      }
    } catch (error) {
      alertsContainer.innerHTML = `
        <div class="no-alerts">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load alerts.</p>
        </div>
      `;
      console.error("Error fetching inventory alerts:", error);
    }
  }

  // Fetch and display recent activities from backend
  async function updateRecentActivityFromAPI() {
    const activityFeed = document.querySelector(".activity-feed");
    activityFeed.innerHTML = `<div>Loading recent activity...</div>`;
    try {
      const response = await fetch(
        `http://localhost:5000/api/activity-log/recent/${storeInfo.id}`,
        { credentials: "include" }
      );
      const activities = await response.json();

      if (Array.isArray(activities) && activities.length > 0) {
        activityFeed.innerHTML = activities
          .map((activity) => {
            // Choose icon based on entityType or action
            let icon = "fa-info-circle";
            if (activity.entityType === "product") icon = "fa-box";
            else if (activity.entityType === "inventory") icon = "fa-warehouse";
            else if (activity.entityType === "employee") icon = "fa-user";
            else if (activity.entityType === "store") icon = "fa-store";
            else if (activity.entityType === "system") icon = "fa-cog";
            else if (activity.entityType === "user") icon = "fa-user-circle";

            // Action badge color
            let actionClass = "";
            if (activity.action === "add") actionClass = "add";
            else if (activity.action === "edit") actionClass = "edit";
            else if (activity.action === "delete") actionClass = "delete";

            // Format time
            const time = new Date(activity.createdAt || activity.timestamp).toLocaleString();

            return `
              <div class="activity-item">
                <div class="activity-icon">
                  <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text">
                    <span class="activity-user">${activity.user?.name || activity.user || "Unknown"}</span>
                    <span class="activity-action action-badge ${actionClass}">${activity.action?.charAt(0).toUpperCase() + activity.action?.slice(1) || ""}</span>
                    <span class="activity-entity">${activity.entityType ? "on " + activity.entityType : ""}</span>
                    <span class="activity-details">${activity.details || ""}</span>
                  </div>
                  <div class="activity-time">${time}</div>
                </div>
              </div>
            `;
          })
          .join("");
      } else {
        activityFeed.innerHTML = `
          <div class="no-activity">
            <i class="fas fa-check-circle"></i>
            <p>No recent activity at this time.</p>
          </div>
        `;
      }
    } catch (error) {
      activityFeed.innerHTML = `
        <div class="no-activity">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load recent activity.</p>
        </div>
      `;
      console.error("Error fetching recent activity:", error);
    }
  }

  // Initial update
  updateDashboardMetrics();
  updateInventoryAlertsFromAPI();
  updateRecentActivityFromAPI();

  // Update metrics every 5 minutes
  setInterval(updateDashboardMetrics, 300000);
  setInterval(updateInventoryAlertsFromAPI, 300000);
  setInterval(updateRecentActivityFromAPI, 300000);
});
