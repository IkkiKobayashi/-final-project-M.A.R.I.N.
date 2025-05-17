document.addEventListener("DOMContentLoaded", async function () {
  const storeInfo = JSON.parse(localStorage.getItem("currentStore"));
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
        `http://localhost:5000/dashboard/metrics/${storeInfo.id}`,
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
        `http://localhost:5000/dashboard/alerts/${storeInfo.id}`,
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

  // Initial update
  updateDashboardMetrics();
  updateInventoryAlertsFromAPI();

  // Update metrics every 5 minutes
  setInterval(updateDashboardMetrics, 300000);
  setInterval(updateInventoryAlertsFromAPI, 300000);
});
