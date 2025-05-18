const Employee = require("../models/Employee");
const ActivityLog = require("../models/ActivityLog");

class EmployeeController {
  // Get all employees
  static async getAllEmployees(req, res) {
    try {
      let query = {};

      // If manager, only show employees from their store
      if (req.user.role === "manager") {
        query.store = req.user.store;
      }

      const employees = await Employee.find(query).populate(
        "store",
        "name address"
      );

      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get single employee
  static async getEmployee(req, res) {
    try {
      const employee = await Employee.findById(req.params.id).populate(
        "store",
        "name address"
      );

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Check if manager has access to this employee
      if (
        req.user.role === "manager" &&
        employee.store.toString() !== req.user.store.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this employee" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Create employee
  static async createEmployee(req, res) {
    try {
      const {
        name,
        email,
        role,
        department,
        phone,
        joinedDate,
        profileImage,
        store,
      } = req.body;

      // Validate store
      if (!store) {
        return res.status(400).json({ message: "Store ID is required" });
      }

      // Validate user's store access
      if (req.user.role !== "admin" && req.user.store?.toString() !== store) {
        return res
          .status(403)
          .json({ message: "Not authorized to add employees to this store" });
      }

      // Check if email already exists in the store
      const existingEmployee = await Employee.findOne({
        email,
        store,
      });

      if (existingEmployee) {
        return res
          .status(400)
          .json({ message: "Email already registered in this store" });
      }

      const employee = new Employee({
        name,
        email,
        role: role || "employee",
        department,
        phone,
        joinedDate: joinedDate || new Date(),
        profileImage: profileImage || "img/user img/store admin.jpg",
        store,
      });

      await employee.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: employee.store,
        action: "add",
        entityType: "employee",
        entityId: employee._id,
        details: `Created new employee: ${employee.name}`,
      });
      await activity.save();

      res.status(201).json({
        message: "Employee created successfully",
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          phone: employee.phone,
          joinedDate: employee.joinedDate,
          profileImage: employee.profileImage,
          store: employee.store,
        },
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }
      res.status(400).json({ message: error.message });
    }
  }

  // Update employee
  static async updateEmployee(req, res) {
    try {
      const updates = { ...req.body };
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Check if manager has access to this employee
      if (
        req.user.role === "manager" &&
        employee.store.toString() !== req.user.store.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this employee" });
      }

      // Check if trying to change role to admin
      if (updates.role === "admin") {
        return res
          .status(403)
          .json({ message: "Cannot promote to admin role" });
      }

      Object.assign(employee, updates);
      await employee.save();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: employee.store,
        action: "edit",
        entityType: "employee",
        entityId: employee._id,
        details: `Updated employee: ${employee.name}`,
      });
      await activity.save();

      res.json({
        message: "Employee updated successfully",
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          phone: employee.phone,
          joinedDate: employee.joinedDate,
          profileImage: employee.profileImage,
        },
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(400).json({ message: error.message });
    }
  }

  // Delete employee
  static async deleteEmployee(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Check if manager has access to this employee
      if (
        req.user.role === "manager" &&
        employee.store.toString() !== req.user.store.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this employee" });
      }

      // Store data for activity log
      const employeeData = {
        name: employee.name,
        store: employee.store,
      };

      await employee.deleteOne();

      // Log activity
      const activity = new ActivityLog({
        user: req.user.userId,
        store: employeeData.store,
        action: "delete",
        entityType: "employee",
        entityId: req.params.id,
        details: `Deleted employee: ${employeeData.name}`,
      });
      await activity.save();

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = EmployeeController;
