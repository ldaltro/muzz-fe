import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp?: string;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export const useChatSocket = (
  room: string | null,
  onMessageReceived: (message: ChatMessage) => void
) => {
  const socket = useRef<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Legacy support
  const isConnected = connectionState === 'connected';

  useEffect(() => {
    if (!room) return;

    setConnectionState('connecting');
    setLastError(null);

    const newSocket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      timeout: 20000,
    });
    socket.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnectionState('connected');
      setReconnectAttempts(0);
      setLastError(null);
      newSocket.emit("join_room", room);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('reconnecting');
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionState('error');
      setLastError(error.message || 'Connection failed');
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setConnectionState('reconnecting');
      setReconnectAttempts(attemptNumber);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setConnectionState('connected');
      setReconnectAttempts(0);
      setLastError(null);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
      setLastError(error.message || 'Reconnection failed');
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Reconnection failed after maximum attempts");
      setConnectionState('error');
      setLastError('Unable to connect after multiple attempts');
    });

    newSocket.on("receive_message", (message: ChatMessage) => {
      console.log("Message received:", message);
      onMessageReceived(message);
    });

    return () => {
      console.log("Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [room, onMessageReceived]);

  const sendMessage = (message: ChatMessage) => {
    if (socket.current && socket.current.connected && room) {
      socket.current.emit("send_message", { room, message });
    } else {
      console.error("Socket not connected or room not specified.");
    }
  };

  return { 
    isConnected, 
    connectionState, 
    reconnectAttempts, 
    lastError, 
    sendMessage 
  };
};
