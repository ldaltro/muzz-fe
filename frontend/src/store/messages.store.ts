import { create } from "zustand";

export type Message = {
  id: number;
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
};

export type MessageInput = {
  uuid?: string;
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
      if (message.uuid && state.messages.some(msg => msg.uuid === message.uuid)) {
        return state;
      }
      
      const newMessage: Message = {
        id: state.messages.length + 1,
        uuid: message.uuid,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        timestamp: new Date().toISOString(),
      };
      return { messages: [...state.messages, newMessage] };
    }),
}));

export default useMessagesStore;
