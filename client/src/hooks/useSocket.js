import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
    const { user } = useAuth();
    const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user) return;

        socket.current = io(SOCKET_URL);

        socket.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);

            // Join rooms based on role
            if (user.role === 'student') {
                socket.current.emit('join:student', { studentId: user._id });
            } else if (user.role === 'shopkeeper' && user.shopId) {
                socket.current.emit('join:shop', { shopId: user.shopId });
            }
        });

        socket.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        return () => {
            if (socket.current) socket.current.disconnect();
        };
    }, [user]);

    return { socket: socket.current, isConnected };
};
