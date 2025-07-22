// import { Server } from 'socket.io';
// import { Repository } from './api/repository';

// let io: Server;

// export const initSocket = (server: any) => {
//     io = new Server(server, {
//         cors: {
//             origin: '*',
//             methods: ['GET', 'POST'],
//         },
//     });

//     // ✅ THIS is the important missing part
//     io.on('connection', async (socket) => {
//         console.log('Client connected:', socket.id);

//         try {
//             const allMessages = await Repository.getAllSmsNumbers();
//             socket.emit('all-otps', allMessages); // ✅ Emit old data to the newly connected client
//         } catch (error) {
//             console.error('Error sending initial OTPs:', error);
//         }
//     });

//     return io;
// };

// export { io };
