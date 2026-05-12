const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, role("Admin"), async (req, res) => {
  try {
    const { title, status, dueDate, project, assignedTo } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }
    const task = await Task.create({ title, status, dueDate, project, assignedTo });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, role("Admin"), async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;