import path from "path";
import express from "express";
import app from "./index";
import http from "http";
// import { initSocket } from "./socket";

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);
// initSocket(server);

// Correct path resolution for inside Docker
const frontendPath = path.join(__dirname, "..", "public");


app.use(
  express.static(frontendPath, {
    maxAge: "30d",
    etag: false,
  })
);

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"), (err) => {
    if (err) {
      console.error("Error sending login.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/test", (req, res) => {
  res.status(200).json({ success: true, message: "Working Fine 😁" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
