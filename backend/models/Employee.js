const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    role: {
      type: String,
      enum: ["manager", "employee"],
      default: "employee",
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    profileImage: {
      type: String,
      default: "img/user img/store admin.jpg",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: [true, "Store is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    salary: {
      type: Number,
      default: 0,
    },
    position: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    documents: [
      {
        type: {
          type: String,
          enum: ["id", "contract", "certificate", "other"],
        },
        url: String,
        name: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    performance: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comments: String,
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
employeeSchema.index({ email: 1, store: 1 }, { unique: true });
employeeSchema.index({ store: 1, department: 1 });

// Virtual for full employee info
employeeSchema.virtual("fullInfo").get(function () {
  return `${this.name} - ${this.department} (${this.role})`;
});

// Method to get active employees
employeeSchema.statics.getActiveEmployees = function (storeId) {
  return this.find({ store: storeId, isActive: true });
};

// Method to get employees by department
employeeSchema.statics.getEmployeesByDepartment = function (
  storeId,
  department
) {
  return this.find({ store: storeId, department, isActive: true });
};

// Pre-save middleware to ensure email is lowercase
employeeSchema.pre("save", function (next) {
  this.email = this.email.toLowerCase();
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
