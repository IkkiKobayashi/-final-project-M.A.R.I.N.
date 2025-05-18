document.addEventListener("DOMContentLoaded", async function () {
  // Get store info from localStorage
  const storeInfo = JSON.parse(localStorage.getItem("currentStore"));
  if (!storeInfo || !storeInfo.id) {
    window.location.href = "store-selection.html";
    return;
  }

  // Update store info
  document.querySelector(".store-name").textContent = storeInfo.name;
  document.querySelector(".store-address").textContent = storeInfo.address;

  // Fetch and update dashboard metrics
  async function updateDashboardMetrics() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/dashboard/stats/${storeInfo.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      const data = await response.json();

      // Update summary cards
      document.querySelector(".card:nth-child(1) .count").textContent =
        data.totalProducts || 0;
      document.querySelector(".card:nth-child(2) .count").textContent =
        data.lowStock || 0;
      document.querySelector(".card:nth-child(3) .count").textContent =
        data.nearExpiry || 0;
      document.querySelector(".card:nth-child(4) .count").textContent =
        data.outOfStock || 0;
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      showNotification("Failed to load dashboard metrics", "error");
    }
  }

  // Fetch and display inventory alerts from backend
  async function updateInventoryAlertsFromAPI() {
    const alertsContainer = document.querySelector(".alerts-container");
    if (!alertsContainer) return;

    alertsContainer.innerHTML = `<div class="loading">Loading alerts...</div>`;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/dashboard/alerts/${storeInfo.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const alerts = await response.json();

      if (Array.isArray(alerts) && alerts.length > 0) {
        alertsContainer.innerHTML = alerts
          .map((alert) => {
            let itemsList = "";
            if (alert.items && alert.items.length > 0) {
              itemsList =
                "<ul class='alert-items'>" +
                alert.items
                  .map((item) => {
                    let itemDetails = "";
                    switch (alert.type) {
                      case "low_stock":
                        itemDetails = `${item.name} - ${item.quantity} left (Threshold: ${item.threshold})`;
                        break;
                      case "near_expiry":
                        itemDetails = `${item.name} - Expires: ${new Date(item.expiryDate).toLocaleDateString()} (${item.quantity} units)`;
                        break;
                      case "expired":
                        itemDetails = `${item.name} - Expired on ${new Date(item.expiryDate).toLocaleDateString()} (${item.quantity} units)`;
                        break;
                      case "out_of_stock":
                        itemDetails = `${item.name}`;
                        break;
                      default:
                        itemDetails = item.name;
                    }
                    return `<li>${itemDetails}</li>`;
                  })
                  .join("") +
                "</ul>";
            }

            let icon = "";
            switch (alert.type) {
              case "low_stock":
                icon = "fa-exclamation-triangle";
                break;
              case "near_expiry":
                icon = "fa-clock";
                break;
              case "expired":
                icon = "fa-times-circle";
                break;
              case "out_of_stock":
                icon = "fa-ban";
                break;
              default:
                icon = "fa-info-circle";
            }

            return `
              <div class="alert ${alert.type} ${alert.severity}">
                <div class="alert-header">
                  <i class="fas ${icon}"></i>
                  <span class="alert-message">${alert.message}</span>
                </div>
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
      console.error("Error fetching inventory alerts:", error);
      alertsContainer.innerHTML = `
        <div class="no-alerts error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load alerts. Please try again later.</p>
        </div>
      `;
    }
  }

  // Initial update
  updateDashboardMetrics();
  updateInventoryAlertsFromAPI();

  // Update metrics every 5 minutes
  setInterval(updateDashboardMetrics, 300000);
  setInterval(updateInventoryAlertsFromAPI, 300000);
});

// Function to show notifications
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Function to fetch dashboard statistics
async function fetchDashboardStats() {
  try {
    const storeInfo = JSON.parse(localStorage.getItem("selectedStore"));
    if (!storeInfo || !storeInfo._id) {
      console.error("No store selected");
      return;
    }

    const response = await fetch(`/api/dashboard/stats/${storeInfo._id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any authentication headers if needed
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard statistics");
    }

    const data = await response.json();
    updateDashboardCards(data);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
  }
}

// Function to update dashboard cards with statistics
function updateDashboardCards(stats) {
  // Update Total Products
  document.querySelector(".card:nth-child(1) .count").textContent =
    stats.totalProducts;

  // Update Low on Stock
  document.querySelector(".card:nth-child(2) .count").textContent =
    stats.lowStock;

  // Update Items Near Expiry
  document.querySelector(".card:nth-child(3) .count").textContent =
    stats.nearExpiry;

  // Update Out of Stock
  document.querySelector(".card:nth-child(4) .count").textContent =
    stats.outOfStock;
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardStats();

  // Refresh dashboard stats every 5 minutes
  setInterval(fetchDashboardStats, 5 * 60 * 1000);
});
