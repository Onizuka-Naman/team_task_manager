const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const tasks = await Task.find()
    .populate("assignedTo", "name")
    .populate("project", "name");

  res.json(tasks);
});

router.post("/", auth, async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

router.put("/:id", auth, async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updated);
});

module.exports = router;