const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const { auth, checkRole } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create inventory record
router.post("/", async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all inventory records
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("product")
      .populate("store");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by ID
router.get("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate("product")
      .populate("store");
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inventory
router.put("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete inventory record
router.delete("/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json({ message: "Inventory record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by store
router.get("/store/:storeId", async (req, res) => {
  try {
    const inventory = await Inventory.find({ store: req.params.storeId })
      .populate("product")
      .sort({ status: 1, expiryDate: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get inventory by product
router.get("/product/:productId", async (req, res) => {
  try {
    const inventory = await Inventory.findOne({
      product: req.params.productId,
      store: req.query.storeId,
    }).populate("product");
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add stock (admin and manager only)
router.post("/add-stock", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const { productId, storeId, quantity, batchNumber, expiryDate, location } =
      req.body;

    let inventory = await Inventory.findOne({
      product: productId,
      store: storeId,
      batchNumber: batchNumber,
    });

    if (inventory) {
      inventory.quantity += quantity;
    } else {
      inventory = new Inventory({
        product: productId,
        store: storeId,
        quantity,
        batchNumber,
        expiryDate,
        location,
        lastUpdatedBy: req.user.userId,
      });
    }

    // Update status based on quantity
    inventory.status = await updateInventoryStatus(inventory);
    await inventory.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: storeId,
      action: "add",
      entityType: "inventory",
      entityId: inventory._id,
      details: `Added ${quantity} units to inventory`,
    });
    await activity.save();

    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove stock (admin and manager only)
router.post(
  "/remove-stock",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { productId, storeId, quantity, batchNumber } = req.body;

      const inventory = await Inventory.findOne({
        product: productId,
        store: storeId,
        batchNumber: batchNumber,
      });

      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }

      if (inventory.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      inventory.quantity -= quantity;
      inventory.status = await updateInventoryStatus(inventory);
      inventory.lastUpdatedBy = req.user.userId;
      await inventory.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: storeId,
        action: "remove",
        entityType: "inventory",
        entityId: inventory._id,
        details: `Removed ${quantity} units from inventory`,
      });
      await activity.save();

      res.json(inventory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Get low stock items
router.get("/low-stock/:storeId", async (req, res) => {
  try {
    const inventory = await Inventory.find({
      store: req.params.storeId,
      status: "low_stock",
    }).populate("product");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expiring items
router.get("/expiring/:storeId", async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const inventory = await Inventory.find({
      store: req.params.storeId,
      expiryDate: { $lte: thirtyDaysFromNow, $gt: new Date() },
    }).populate("product");
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock quantity
router.patch("/:id/quantity", async (req, res) => {
  try {
    const { quantity } = req.body;
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );
    if (!inventory) {
      return res.status(404).json({ message: "Inventory record not found" });
    }
    res.json(inventory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper function to update inventory status
async function updateInventoryStatus(inventory) {
  const product = await Product.findById(inventory.product);

  if (inventory.quantity === 0) {
    return "out_of_stock";
  } else if (inventory.quantity <= product.threshold) {
    return "low_stock";
  } else {
    return "in_stock";
  }
}

module.exports = router;
