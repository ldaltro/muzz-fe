import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp?: string;
}

export const useChatSocket = (
  room: string | null,
  onMessageReceived: (message: ChatMessage) => void
) => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!room) return;

    const newSocket = io("http://localhost:3001");
    socket.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("join_room", room);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
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

  return { isConnected, sendMessage };
};
