export interface ChatMessage {
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp?: string;
}