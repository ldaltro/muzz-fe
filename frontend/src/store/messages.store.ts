import { create } from "zustand";

export type Message = {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: number;
};

export type MessageInput = {
  id?: string;
  senderId: number;
  recipientId: number;
  content: string;
};

type MessagesState = {
  messages: Message[];
  createMessage: (message: MessageInput) => void;
  setMessages: (messages: Message[]) => void;
};

const useMessagesStore = create<MessagesState>((set) => ({
    messages: [],
  setMessages: (messages: Message[]) => set({ messages }),
  createMessage: (message: MessageInput) =>
    set((state) => {
      if (message.id && state.messages.some(msg => msg.id === message.id)) {
        return state;
      }
      
      const newMessage: Message = {
        id: message.id || crypto.randomUUID(),
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        createdAt: Date.now(),
      };
      return { messages: [...state.messages, newMessage] };
    }),
}));

export default useMessagesStore;
