import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // Inventory Overview Chart
  const inventoryCtx = document.getElementById("inventoryChart")

  if (inventoryCtx) {
    new Chart(inventoryCtx, {
      type: "bar",
      data: {
        labels: ["In Stock", "Low Stock", "Near Expiry", "Expired", "Out of Stock"],
        datasets: [
          {
            label: "Inventory Status",
            data: [1200, 150, 120, 50, 48],
            backgroundColor: ["#3a7bd5", "#4dabf7", "#fcc419", "#ff6b6b", "#868e96"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    })
  }

  // Products by Category Chart
  const categoryCtx = document.getElementById("categoryChart")

  if (categoryCtx) {
    new Chart(categoryCtx, {
      type: "doughnut",
      data: {
        labels: ["Groceries", "Beverages", "Dairy", "Bakery", "Produce", "Other"],
        datasets: [
          {
            data: [35, 20, 15, 10, 15, 5],
            backgroundColor: ["#3a7bd5", "#00d2ff", "#51cf66", "#fcc419", "#ff6b6b", "#868e96"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
          },
        },
      },
    })
  }
})
