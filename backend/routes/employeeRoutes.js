const express = require("express");
const router = express.Router();
const { auth, checkRole } = require("../middleware/auth");
const EmployeeController = require("../controllers/EmployeeController");

// All routes require authentication
router.use(auth);

// Get all employees (accessible by admin and manager)
router.get(
  "/",
  checkRole(["admin", "manager"]),
  EmployeeController.getAllEmployees
);

// Get single employee (accessible by admin and manager)
router.get(
  "/:id",
  checkRole(["admin", "manager"]),
  EmployeeController.getEmployee
);

// Create employee (only admin)
router.post("/", checkRole(["admin"]), EmployeeController.createEmployee);

// Update employee (only admin)
router.put("/:id", checkRole(["admin"]), EmployeeController.updateEmployee);

// Delete employee (only admin)
router.delete("/:id", checkRole(["admin"]), EmployeeController.deleteEmployee);

module.exports = router;
