import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id?: string;
  clientId?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt?: number;
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

    const newSocket = io(import.meta.env.VITE_API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });
    socket.current = newSocket;

    const handleConnect = () => {
      setConnectionState('connected');
      setReconnectAttempts(0);
      setLastError(null);
      newSocket.emit("join_room", room);
    };

    const handleDisconnect = (reason: string) => {
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setConnectionState('disconnected');
      } else {
        setConnectionState('reconnecting');
      }
    };

    const handleConnectError = (error: Error) => {
      console.error("Connection error:", error);
      setConnectionState('error');
      setLastError(error.message || 'Connection failed');
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      setConnectionState('reconnecting');
      setReconnectAttempts(attemptNumber);
    };

    const handleReconnect = () => {
      setConnectionState('connected');
      setReconnectAttempts(0);
      setLastError(null);
    };

    const handleReconnectError = (error: Error) => {
      console.error("Reconnection error:", error);
      setLastError(error.message || 'Reconnection failed');
    };

    const handleReconnectFailed = () => {
      console.error("Reconnection failed after maximum attempts");
      setConnectionState('error');
      setLastError('Unable to connect after multiple attempts');
    };

    const handleReceiveMessage = (message: ChatMessage) => {
      onMessageReceived(message);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("reconnect_attempt", handleReconnectAttempt);
    newSocket.on("reconnect", handleReconnect);
    newSocket.on("reconnect_error", handleReconnectError);
    newSocket.on("reconnect_failed", handleReconnectFailed);
    newSocket.on("receive_message", handleReceiveMessage);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.off("reconnect_attempt", handleReconnectAttempt);
      newSocket.off("reconnect", handleReconnect);
      newSocket.off("reconnect_error", handleReconnectError);
      newSocket.off("reconnect_failed", handleReconnectFailed);
      newSocket.off("receive_message", handleReceiveMessage);
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
