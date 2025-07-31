export interface ChatMessage {
  id?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt?: number;
}