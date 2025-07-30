import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  senderId: number;
  recipientId: number;
  content: string;
  [key: string]: any;
}

export const useChatSocket = (
  room: string | null,
  onMessageReceived: (message: ChatMessage) => void
) => {
  const socket = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleMessageReceived = useCallback(onMessageReceived, [
    onMessageReceived,
  ]);

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

    newSocket.on(
      "receive_message",
      (data: { room: string; message: ChatMessage }) => {
        console.log("Message received in room:", data.room);
        handleMessageReceived(data.message);
      }
    );

    return () => {
      console.log("Disconnecting socket...");
      newSocket.disconnect();
    };
  }, [room, handleMessageReceived]);

  const sendMessage = (message: ChatMessage) => {
    if (socket.current && socket.current.connected && room) {
      socket.current.emit("send_message", { room, message });
    } else {
      console.error("Socket not connected or room not specified.");
    }
  };

  return { isConnected, sendMessage };
};
