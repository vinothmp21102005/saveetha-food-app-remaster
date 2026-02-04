// Stores active socket connections maping orderId to socketId or room logic
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Join student to their specific order room or user room
        socket.on('join:student', ({ studentId }) => {
            socket.join(`student:${studentId}`);
            console.log(`Student ${studentId} joined room student:${studentId}`);
        });

        // Join shopkeeper to their shop room
        socket.on('join:shop', ({ shopId }) => {
            socket.join(`shop:${shopId}`);
            console.log(`Shop ${shopId} joined room shop:${shopId}`);
        });

        // Listen for status updates from shopkeeper (redundant if using REST + emit, but good for direct)
        // socket.on('shopkeeper:update_status', ({ orderId, status, studentId }) => {
        //     io.to(`student:${studentId}`).emit('order:status_update', { orderId, status });
        // });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    });
};

module.exports = socketHandler;
