const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { auth, checkRole } = require("../middleware/auth");

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log("Store route accessed:", {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Apply auth middleware to all routes
router.use(auth);

// Store routes with proper controller methods
router.get("/", storeController.getStores);
router.get("/:id", storeController.getStoreById);

router.post("/", async (req, res, next) => {
  try {
    await storeController.createStore(req, res);
  } catch (error) {
    console.error("Route error:", error);
    next(error);
  }
});

router.put(
  "/:id",
  checkRole(["admin", "manager"]),
  storeController.updateStore
);

router.delete("/:id", checkRole(["admin"]), storeController.deleteStore);
router.patch(
  "/:id/inventory",
  checkRole(["admin", "manager"]),
  storeController.updateStoreInventory
);

module.exports = router;
