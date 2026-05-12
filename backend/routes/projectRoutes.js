const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "name");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", auth, role("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", auth, role("Admin"), async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;