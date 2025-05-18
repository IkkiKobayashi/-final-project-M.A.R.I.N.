const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");
const ActivityLog = require("../models/ActivityLog");
const { auth, checkRole } = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Create ticket
router.post("/", async (req, res) => {
  try {
    const ticket = new SupportTicket({
      ...req.body,
      createdBy: req.user.userId,
      status: "open",
    });
    await ticket.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: ticket.store,
      action: "add",
      entityType: "support_ticket",
      entityId: ticket._id,
      details: `Created support ticket: ${ticket.subject}`,
    });
    await activity.save();

    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all tickets (admin only)
router.get("/", checkRole(["admin"]), async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("store", "name");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's tickets
router.get("/my-tickets", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ createdBy: req.user.userId })
      .populate("assignedTo", "name email")
      .populate("store", "name");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assigned tickets
router.get("/assigned", checkRole(["admin", "manager"]), async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ assignedTo: req.user.userId })
      .populate("createdBy", "name email")
      .populate("store", "name");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets by store
router.get("/store/:storeId", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ store: req.params.storeId })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single ticket
router.get("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("store", "name");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user has access to this ticket
    if (
      req.user.role !== "admin" &&
      ticket.createdBy._id.toString() !== req.user.userId &&
      ticket.assignedTo?._id.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this ticket" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket
router.put("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      ticket.createdBy.toString() !== req.user.userId &&
      ticket.assignedTo?.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this ticket" });
    }

    // Only admin/manager can change assignment
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      delete req.body.assignedTo;
    }

    Object.assign(ticket, req.body);
    await ticket.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: ticket.store,
      action: "edit",
      entityType: "support_ticket",
      entityId: ticket._id,
      details: `Updated support ticket: ${ticket.subject}`,
    });
    await activity.save();

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add comment to ticket
router.post("/:id/comments", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const comment = {
      content: req.body.content,
      user: req.user.userId,
      createdAt: new Date(),
    };

    ticket.comments.push(comment);
    await ticket.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: ticket.store,
      action: "add",
      entityType: "ticket_comment",
      entityId: ticket._id,
      details: `Added comment to ticket: ${ticket.subject}`,
    });
    await activity.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Close ticket
router.patch("/:id/close", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      ticket.assignedTo?.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to close this ticket" });
    }

    ticket.status = "closed";
    ticket.closedAt = new Date();
    ticket.closedBy = req.user.userId;
    await ticket.save();

    // Log activity
    const activity = new ActivityLog({
      user: req.user.userId,
      store: ticket.store,
      action: "edit",
      entityType: "support_ticket",
      entityId: ticket._id,
      details: `Closed support ticket: ${ticket.subject}`,
    });
    await activity.save();

    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
