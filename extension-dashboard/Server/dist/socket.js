"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const repository_1 = require("./api/repository");
let io;
const initSocket = (server) => {
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    // ✅ THIS is the important missing part
    io.on('connection', async (socket) => {
        console.log('Client connected:', socket.id);
        try {
            const allMessages = await repository_1.Repository.getAllSmsNumbers();
            socket.emit('all-otps', allMessages); // ✅ Emit old data to the newly connected client
        }
        catch (error) {
            console.error('Error sending initial OTPs:', error);
        }
    });
    return io;
};
exports.initSocket = initSocket;
