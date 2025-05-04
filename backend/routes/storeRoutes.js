const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { auth, checkRole } = require("../middleware/auth");

// Protect all routes with authentication
router.use(auth);

// Store routes with proper controller methods
router.get("/", storeController.getStores);
router.get("/:id", storeController.getStoreById);
router.post("/", checkRole(["admin"]), storeController.createStore);

// Simplify the updateStore route
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
