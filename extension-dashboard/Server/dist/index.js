"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes/routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// ✅ Middlewares
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://127.0.0.1:8080',
    credentials: true,
}));
app.use(express_1.default.json()); // For parsing JSON
app.use(express_1.default.urlencoded({ extended: true })); // ✅ For parsing form data
// ✅ Routes
app.use('/', routes_1.default);
exports.default = app;
