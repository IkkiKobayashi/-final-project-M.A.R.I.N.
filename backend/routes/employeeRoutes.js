const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, checkRole } = require("../middleware/auth");
const EmployeeController = require("../controllers/EmployeeController");
const ActivityLog = require("../models/ActivityLog");

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

// Get employees by store (admin and manager only)
router.get(
  "/store/:storeId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const employees = await User.find({
        store: req.params.storeId,
        role: { $ne: "admin" },
      }).select("-password");
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Add employee to store (admin and manager only)
router.post(
  "/store/:storeId",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { email, name, role, department, phone } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create new employee
      const employee = new User({
        email,
        name,
        role: role || "employee",
        store: req.params.storeId,
        department,
        phone,
        password: Math.random().toString(36).slice(-8), // Generate random password
      });

      await employee.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: req.params.storeId,
        action: "add",
        entityType: "employee",
        entityId: employee._id,
        details: `Added new employee: ${employee.name}`,
      });
      await activity.save();

      // TODO: Send welcome email with password

      res.status(201).json({
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update employee details (admin and manager only)
router.put("/:id", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Ensure employee belongs to manager's store
    if (
      req.user.role === "manager" &&
      employee.store.toString() !== req.user.store.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this employee" });
    }

    // Only admin can change role to manager
    if (req.body.role === "manager" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to promote to manager" });
    }

    Object.assign(employee, req.body);
    await employee.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: employee.store,
      action: "edit",
      entityType: "employee",
      entityId: employee._id,
      details: `Updated employee details: ${employee.name}`,
    });
    await activity.save();

    res.json({
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove employee from store (admin and manager only)
router.delete("/:id", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Ensure employee belongs to manager's store
    if (
      req.user.role === "manager" &&
      employee.store.toString() !== req.user.store.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove this employee" });
    }

    // Store employee data for activity log
    const employeeData = {
      name: employee.name,
      store: employee.store,
    };

    await employee.remove();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: employeeData.store,
      action: "delete",
      entityType: "employee",
      entityId: req.params.id,
      details: `Removed employee: ${employeeData.name}`,
    });
    await activity.save();

    res.json({ message: "Employee removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee performance metrics
router.get(
  "/:id/performance",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const activities = await ActivityLog.find({
        user: req.params.id,
        createdAt: { $gte: startDate },
      });

      // Group activities by type and calculate metrics
      const metrics = {
        totalActivities: activities.length,
        byType: {},
        byDate: {},
      };

      activities.forEach((activity) => {
        // Count by type
        metrics.byType[activity.entityType] =
          (metrics.byType[activity.entityType] || 0) + 1;

        // Count by date
        const date = activity.createdAt.toISOString().split("T")[0];
        metrics.byDate[date] = (metrics.byDate[date] || 0) + 1;
      });

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update employee work schedule
router.put(
  "/:id/schedule",
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { schedule } = req.body;
      const employee = await User.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Ensure employee belongs to manager's store
      if (
        req.user.role === "manager" &&
        employee.store.toString() !== req.user.store.toString()
      ) {
        return res
          .status(403)
          .json({
            message: "Not authorized to update this employee's schedule",
          });
      }

      employee.schedule = schedule;
      await employee.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: employee.store,
        action: "edit",
        entityType: "employee",
        entityId: employee._id,
        details: `Updated work schedule for: ${employee.name}`,
      });
      await activity.save();

      res.json({ message: "Schedule updated successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
