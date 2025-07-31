import type { ChatMessage } from "@/shared/types";

const API_BASE = "http://localhost:3001";

export interface FetchMessagesParams {
  room: string;
  before?: number;
  limit?: number;
}

export const fetchMessages = async ({
  room,
  before = Date.now(),
  limit = 20,
}: FetchMessagesParams): Promise<ChatMessage[]> => {
  const params = new URLSearchParams({
    before: before.toString(),
    limit: limit.toString(),
  });
  const res = await fetch(`${API_BASE}/rooms/${room}/messages?${params}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
};
