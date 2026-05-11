const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

router.post("/", auth, role("Admin"), async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.json(project);
});

module.exports = router;