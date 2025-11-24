// /frontend/server.js
import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 4173;

const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/health", (_, res) => res.send("ok"));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
} else {
  console.warn("⚠️ dist not found — make sure to run build. Serving health only.");
  app.get("/health", (_, res) => res.send("ok"));
}

app.listen(PORT, () => console.log(`Static server listening on ${PORT}`));
