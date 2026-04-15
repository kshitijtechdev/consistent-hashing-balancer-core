const express = require("express");
const cors = require("cors");
const hashingService = require("./hashingService");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Consistent Hashing Load Balancer is running");
});

app.post("/add-server", (req, res) => {
  try {
    const { serverName } = req.body;

    if (!serverName) {
      return res.status(400).json({ error: "Server name is required" });
    }

    hashingService.addServer(serverName);

    res.json({
      message: `✅ Server ${serverName} added successfully`,
      ring: hashingService.getRing(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/remove-server", (req, res) => {
  try {
    const { serverName } = req.body;

    if (!serverName) {
      return res.status(400).json({ error: "Server name is required" });
    }

    hashingService.removeServer(serverName);

    res.json({
      message: `❌ Server ${serverName} removed`,
      ring: hashingService.getRing(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/get-server", (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: "Key is required" });
    }

    const server = hashingService.getServer(key);

    res.json({
      key,
      assignedServer: server,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/ring", (req, res) => {
  try {
    res.json({
      ring: hashingService.getRing(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});