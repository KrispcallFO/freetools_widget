"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./index"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const PORT = Number(process.env.PORT) || 3000;
const server = http_1.default.createServer(index_1.default);
(0, socket_1.initSocket)(server);
// Correct path resolution for inside Docker
const frontendPath = path_1.default.join(__dirname, "..", "..", "Client", "public");
index_1.default.use(express_1.default.static(frontendPath, {
    maxAge: "30d",
    etag: false,
}));
index_1.default.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(frontendPath, "login.html"), (err) => {
        if (err) {
            console.error("Error sending login.html:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});
index_1.default.get("/test", (req, res) => {
    res.status(200).json({ success: true, message: "Working Fine 😁" });
});
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
