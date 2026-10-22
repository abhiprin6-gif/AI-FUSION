const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    project: "VIRAT DIGITAL ECOSYSTEM",
    status: "running",
    version: "1.0.0"
  });
});

app.get("/api/modules", (req, res) => {
  res.json({
    modules: [
      "V Search",
      "VIRAT AI",
      "Government",
      "Career",
      "Education",
      "Drive",
      "Videos",
      "INSTANT PAY",
      "VIRAT CSC",
      "Business",
      "Agriculture",
      "Health",
      "V Maps",
      "V Mail",
      "V Docs",
      "V Sheets",
      "V Meet",
      "V Translate",
      "VIRAT Citizen Problem Hub"
    ]
  });
});

app.use('/api/modules', require('./routes/modules'));

app.listen(PORT, "127.0.0.1", () => {
  console.log(`VIRAT API running at http://127.0.0.1:${PORT}`);
});
