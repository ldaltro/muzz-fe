export interface ChatMessage {
  id: string;
  clientId?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: number;
}

export interface SocketMessage {
  room: string;
  message: ChatMessage;
}