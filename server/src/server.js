const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');

const socketHandler = require('./socket/socketHandler');

const startServer = async () => {
    try {
        await connectDB();

        const server = http.createServer(app);

        const io = new Server(server, {
            cors: {
                origin: ["http://localhost:5173", "https://saveetha-food-app-remaster.vercel.app", process.env.CLIENT_URL].filter(Boolean),
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        socketHandler(io);

        // Make io accessible in routes via app
        app.set('socketio', io);

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
