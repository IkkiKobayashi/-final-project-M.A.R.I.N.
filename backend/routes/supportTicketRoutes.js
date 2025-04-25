const express = require("express");
const router = express.Router();
const SupportTicket = require("../models/SupportTicket");

// Create support ticket
router.post("/", async (req, res) => {
  try {
    const ticket = new SupportTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all support tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate("user")
      .populate("store")
      .populate("assignedTo");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("user")
      .populate("store")
      .populate("assignedTo");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update ticket
router.put("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete ticket
router.delete("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets by status
router.get("/status/:status", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ status: req.params.status })
      .populate("user")
      .populate("store");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets by user
router.get("/user/:userId", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.params.userId })
      .populate("store")
      .populate("assignedTo");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tickets by store
router.get("/store/:storeId", async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ store: req.params.storeId })
      .populate("user")
      .populate("assignedTo");
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment to ticket
router.post("/:id/comments", async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    ticket.comments.push(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ticket status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
