const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    category: {
      type: String,
      enum: ["technical", "access", "inventory", "billing", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "on_hold", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [commentSchema],
    attachments: [
      {
        filename: String,
        path: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolution: {
      note: String,
      resolvedAt: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: Date,
    tags: [String],
    // For tracking time spent on the ticket
    timeTracking: {
      totalTime: { type: Number, default: 0 }, // in minutes
      logs: [
        {
          startTime: Date,
          endTime: Date,
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          notes: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
supportTicketSchema.index({ store: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ createdBy: 1, status: 1 });
supportTicketSchema.index({ priority: 1, status: 1, createdAt: -1 });

// Virtual for ticket age
supportTicketSchema.virtual("age").get(function () {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});

// Method to add time tracking entry
supportTicketSchema.methods.addTimeTrackingLog = async function (
  startTime,
  endTime,
  userId,
  notes
) {
  const timeSpent = Math.floor(
    (new Date(endTime) - new Date(startTime)) / (1000 * 60)
  ); // Convert to minutes
  this.timeTracking.logs.push({
    startTime,
    endTime,
    user: userId,
    notes,
  });
  this.timeTracking.totalTime += timeSpent;
  await this.save();
};

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
