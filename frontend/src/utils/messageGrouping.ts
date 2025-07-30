import { format } from "date-fns";

export interface Message {
  id: number;
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
}

export interface MessageGroup {
  type: "timestamp" | "message";
  content: string;
  timestamp?: string;
  message?: Message;
  day?: string;
  time?: string;
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};





const formatDayHeading = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, now)) {
    return "Today";
  } else if (isSameDay(date, yesterday)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
};

export const groupMessagesWithTimestamps = (
  messages: Message[]
): MessageGroup[] => {
  if (!messages || messages.length === 0) {
    return [];
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const grouped: MessageGroup[] = [];
  let lastDay: string | null = null;

  sortedMessages.forEach((message) => {
    const messageDate = new Date(message.timestamp);
    const currentDay = format(messageDate, "yyyy-MM-dd");

    // Add day heading if it's a new day
    if (currentDay !== lastDay) {
      const dayHeading = formatDayHeading(messageDate);
      grouped.push({
        type: "timestamp",
        content: `${dayHeading} ${format(messageDate, "h:mm a")}`,
        day: dayHeading,
        time: format(messageDate, "h:mm a"),
      });
      lastDay = currentDay;
    }



    grouped.push({
      type: "message",
      content: message.content,
      timestamp: message.timestamp,
      message,
    });
  });

  return grouped;
};
