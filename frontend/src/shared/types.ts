export interface ChatMessage {
  id?: string;
  clientId?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt?: number;
}