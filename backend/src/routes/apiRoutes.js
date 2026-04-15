const express = require("express");
const router = express.Router();
const hashingService = require("../services/hashingService");

router.get("/nodes", (req, res) => {
  try {
    const nodes = hashingService.getNodes();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/request", (req, res) => {
  try {
    const { username } = req.body;
    const result = hashingService.assignUser(username);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/add-node", (req, res) => {
  try {
    const { nodeName } = req.body;
    const newNode = hashingService.addNode(nodeName);
    res.json({
      message: `${newNode.name} added successfully!`,
      totalNodes: hashingService.nodes.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/remove-node", (req, res) => {
  try {
    const removed = hashingService.removeNode();
    res.json({
      message: `${removed.name} removed! (had ${removed.users.length} user(s))`,
      totalNodes: hashingService.nodes.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/reset", (req, res) => {
  try {
    hashingService.reset();
    res.json({ message: "All Nodes have been Reset!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
