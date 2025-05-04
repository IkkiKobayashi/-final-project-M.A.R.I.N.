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

        // Update alerts if any
        updateInventoryAlerts(data.metrics.alerts);
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    }
  }

  function updateInventoryAlerts(alerts) {
    const alertsContainer = document.querySelector(".alerts-container");
    alertsContainer.innerHTML = alerts
      .map(
        (alert) => `
            <div class="alert ${alert.type}">
                <i class="fas ${
                  alert.type === "warning"
                    ? "fa-exclamation-triangle"
                    : "fa-info-circle"
                }"></i>
                <span>${alert.message}</span>
            </div>
        `
      )
      .join("");
  }

  // Initial update
  updateDashboardMetrics();

  // Update metrics every 5 minutes
  setInterval(updateDashboardMetrics, 300000);
});
