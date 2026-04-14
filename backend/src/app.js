const express = require("express");
const path = require("path");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

app.use(express.json());

// Serve static files from the frontend cluster
app.use(express.static(path.join(__dirname, "../../frontend")));

// Register API routes
app.use("/", apiRoutes);

// Error boundary (Simple catch-all)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
