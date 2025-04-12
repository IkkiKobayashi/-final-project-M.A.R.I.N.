(() => {
  const state = {
    showPassword: false,
  };

  function togglePasswordVisibility() {
    state.showPassword = !state.showPassword;

    const passwordInput = document.getElementById("password-input");
    const toggleIcon = document.getElementById("password-toggle-icon");

    if (passwordInput && toggleIcon) {
      if (state.showPassword) {
        passwordInput.type = "text";
        toggleIcon.src = "img/show-pass.png"; // Updated to use show-pass.png
      } else {
        passwordInput.type = "password";
        toggleIcon.src = "img/hide-pass.png"; // Updated to use hide-pass.png
      }
    }
  }

  function handleForgotPasswordClick(event) {
    event.preventDefault(); // Prevent default link behavior
    window.location.href = "forgot-password.html"; // Redirect to forgot-password.html
  }

  // Initialize event listeners when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".toggle-password");
    if (toggleButton) {
      toggleButton.addEventListener("click", togglePasswordVisibility);
    }

    const forgotPasswordLink = document.querySelector(".forgot-password");
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", handleForgotPasswordClick);
    }
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  // Handle navigation item clicks
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      navItems.forEach((navItem) => {
        navItem.classList.remove("active");
      });

      // Add active class to clicked item
      this.classList.add("active");
    });
  });

  // Responsive adjustments
  function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");

    if (width < 768) {
      sidebar.style.width = "100%";
      mainContent.style.marginLeft = "0";
    } else {
      sidebar.style.width = "16rem";
      mainContent.style.marginLeft = "0";
    }
  }

  // Initial call and event listener for resize
  handleResize();
  window.addEventListener("resize", handleResize);

  // Initialize Chart.js for the sales chart
  if (document.getElementById("salesChart")) {
    const ctx = document.getElementById("salesChart").getContext("2d");

    // Chart data
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const purchaseData = [
      35000, 40000, 22500, 17500, 22500, 7500, 40000, 30000, 25000, 32000,
      28000, 38000,
    ];
    const salesData = [
      25000, 22500, 27500, 25000, 20000, 22500, 25000, 28000, 30000, 35000,
      32000, 42000,
    ];

    // Create gradient for bars
    const purchaseGradient = ctx.createLinearGradient(0, 0, 0, 400);
    purchaseGradient.addColorStop(0, "#04b4fc");
    purchaseGradient.addColorStop(1, "rgba(4, 180, 252, 0.3)");

    const salesGradient = ctx.createLinearGradient(0, 0, 0, 400);
    salesGradient.addColorStop(0, "#46a46c");
    salesGradient.addColorStop(1, "rgba(70, 164, 108, 0.3)");

    // Create the chart
    const salesChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          {
            label: "Purchase",
            data: purchaseData,
            backgroundColor: purchaseGradient,
            borderColor: "#04b4fc",
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
          {
            label: "Sales",
            data: salesData,
            backgroundColor: salesGradient,
            borderColor: "#46a46c",
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleFont: {
              size: 13,
            },
            bodyFont: {
              size: 12,
            },
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              label: function (context) {
                return (
                  context.dataset.label + ": ₱" + context.raw.toLocaleString()
                );
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              callback: function (value) {
                return "₱" + value / 1000 + "k";
              },
            },
          },
        },
      },
    });

    // Handle period button clicks
    const periodButtons = document.querySelectorAll(".period-button");

    periodButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        periodButtons.forEach((btn) => {
          btn.classList.remove("active");
        });

        // Add active class to clicked button
        this.classList.add("active");

        // Update chart data based on period
        const period = this.textContent.trim();
        let newPurchaseData, newSalesData, newLabels;

        if (period === "Monthly") {
          newLabels = months;
          newPurchaseData = purchaseData;
          newSalesData = salesData;
        } else if (period === "Quarterly") {
          newLabels = ["Q1", "Q2", "Q3", "Q4"];
          newPurchaseData = [
            (purchaseData[0] + purchaseData[1] + purchaseData[2]) / 3,
            (purchaseData[3] + purchaseData[4] + purchaseData[5]) / 3,
            (purchaseData[6] + purchaseData[7] + purchaseData[8]) / 3,
            (purchaseData[9] + purchaseData[10] + purchaseData[11]) / 3,
          ];
          newSalesData = [
            (salesData[0] + salesData[1] + salesData[2]) / 3,
            (salesData[3] + salesData[4] + salesData[5]) / 3,
            (salesData[6] + salesData[7] + salesData[8]) / 3,
            (salesData[9] + salesData[10] + salesData[11]) / 3,
          ];
        } else if (period === "Yearly") {
          newLabels = ["2023", "2024", "2025"];
          newPurchaseData = [
            purchaseData.slice(0, 4).reduce((a, b) => a + b, 0) / 4,
            purchaseData.slice(4, 8).reduce((a, b) => a + b, 0) / 4,
            purchaseData.slice(8, 12).reduce((a, b) => a + b, 0) / 4,
          ];
          newSalesData = [
            salesData.slice(0, 4).reduce((a, b) => a + b, 0) / 4,
            salesData.slice(4, 8).reduce((a, b) => a + b, 0) / 4,
            salesData.slice(8, 12).reduce((a, b) => a + b, 0) / 4,
          ];
        }

        // Update chart
        salesChart.data.labels = newLabels;
        salesChart.data.datasets[0].data = newPurchaseData;
        salesChart.data.datasets[1].data = newSalesData;
        salesChart.update();
      });
    });
  }

  // Animate the bar chart (for SVG fallback if Chart.js is not available)
  setTimeout(() => {
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => {
      const height = bar.getAttribute("data-height");
      bar.setAttribute("y", 250 - height);
      bar.setAttribute("height", height);
    });
  }, 500);

  // Bar chart tooltip functionality (for SVG fallback)
  const bars = document.querySelectorAll(".bar");
  const tooltip = document.querySelector(".chart-tooltip");
  if (bars.length > 0 && tooltip) {
    const tooltipTitle = document.querySelector(".tooltip-title");
    const tooltipValue = document.querySelector(".tooltip-value");

    bars.forEach((bar) => {
      bar.addEventListener("mouseover", function (e) {
        const value = this.getAttribute("data-value");
        const month = this.getAttribute("data-month");
        const type = this.classList.contains("purchase-bar")
          ? "Purchase"
          : "Sales";

        tooltipTitle.textContent = `${month}: ${type}`;
        tooltipValue.textContent = `Value: ₱${value}`;

        // Position the tooltip
        const rect = this.getBoundingClientRect();
        const svgRect = document
          .querySelector(".sales-chart")
          .getBoundingClientRect();

        const x = rect.left - svgRect.left;
        const y = rect.top - svgRect.top;

        tooltip.setAttribute("transform", `translate(${x - 50}, ${y - 60})`);
        tooltip.setAttribute("opacity", "1");
      });

      bar.addEventListener("mouseout", function () {
        tooltip.setAttribute("opacity", "0");
      });
    });
  }

  // Animate counters
  const counters = document.querySelectorAll(".counter");

  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-target"));
    const duration = 2000; // 2 seconds
    const step = Math.ceil(target / (duration / 20)); // Update every 20ms
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current > target) {
        current = target;
        clearInterval(interval);
      }
      counter.textContent = current;
    };

    const interval = setInterval(updateCounter, 20);
  });

  // Add some interactivity to the cards
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.classList.add("shadow");
    });

    card.addEventListener("mouseleave", function () {
      this.classList.remove("shadow");
    });
  });

  // Make the activity list more lively with a simple animation
  const activityItems = document.querySelectorAll(".activity-item");

  activityItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
});

// Add this to your existing script.js
document.addEventListener('DOMContentLoaded', function() {
  // Make dropdowns match parent width
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (button && menu) {
      // Set menu width to match button width
      menu.style.minWidth = `${button.offsetWidth}px`;
      
      // Update on window resize
      window.addEventListener('resize', () => {
        menu.style.minWidth = `${button.offsetWidth}px`;
      });
    }
  });

  // Footer link animations
  const footerLinks = document.querySelectorAll('.footer-links a');
  
  footerLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.transition = 'all 0.3s ease';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });

    // Add ripple effect on click
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      this.appendChild(ripple);
      
      // Position ripple
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size/2}px`;
      ripple.style.top = `${e.clientY - rect.top - size/2}px`;
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
        // Navigate after animation completes
        window.location.href = this.href;
      }, 600);
    });
  });

  // Add ripple effect styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});
