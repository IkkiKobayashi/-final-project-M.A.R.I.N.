const Store = require("../models/Store");
const Product = require("../models/Product");

exports.getDashboardMetrics = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const store = await Store.findOne({
      _id: storeId,
      owner: req.userId,
    }).populate("inventory.product");

    if (!store) {
      return res
        .status(404)
        .json({ success: false, message: "Store not found" });
    }

    // Calculate metrics
    const totalProducts = store.inventory.length;
    const currentInventory = store.inventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const nearExpiry = store.inventory.filter((item) => {
      if (item.expiryDate) {
        const daysUntilExpiry = Math.ceil(
          (item.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }
      return false;
    }).length;

    const outOfStock = store.inventory.filter(
      (item) => item.quantity <= 0
    ).length;

    // Generate alerts
    const alerts = [];
    if (outOfStock > 0) {
      alerts.push({
        type: "warning",
        message: `${outOfStock} items are out of stock`,
      });
    }
    if (nearExpiry > 0) {
      alerts.push({
        type: "warning",
        message: `${nearExpiry} items are nearing expiry`,
      });
    }

    res.json({
      success: true,
      metrics: {
        totalProducts,
        currentInventory,
        nearExpiry,
        outOfStock,
        alerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
