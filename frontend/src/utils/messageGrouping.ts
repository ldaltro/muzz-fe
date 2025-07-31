import {
  format,
  isToday,
  isYesterday,
  differenceInSeconds,
  differenceInHours,
} from "date-fns";

export interface Message {
  id: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: number;
}

export interface MessageGroup {
  type: "timestamp" | "message" | "message-group";
  content: string;
  timestamp?: string;
  message?: Message;
  messages?: Message[];
  day?: string;
  time?: string;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
}



const isWithinGroupingThreshold = (
  date1: Date,
  date2: Date,
  thresholdSeconds = 20
): boolean =>
  Math.abs(differenceInSeconds(date1, date2)) <= thresholdSeconds;


const formatDayHeading = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

export const groupMessagesWithTimestamps = (
  messages: Message[]
): MessageGroup[] => {
  if (!messages || messages.length === 0) {
    return [];
  }

  const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  const grouped: MessageGroup[] = [];
  let lastDay: string | null = null;
  let lastMessage: Message | null = null;
  let lastMessageDate: Date | null = null;

  sortedMessages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt);
    const currentDay = format(messageDate, "yyyy-MM-dd");

    const shouldAddTimestamp = currentDay !== lastDay || 
                              (lastMessageDate && differenceInHours(messageDate, lastMessageDate) >= 1);

    if (shouldAddTimestamp) {
      const dayHeading = formatDayHeading(messageDate);
      grouped.push({
        type: "timestamp",
        content: `${dayHeading} ${format(messageDate, "h:mm a")}`,
        day: dayHeading,
        time: format(messageDate, "h:mm a"),
        timestamp: messageDate.toISOString(),
      });
      lastDay = currentDay;
    }

    const isGrouped = lastMessage && 
                      lastMessageDate &&
                      lastMessage.senderId === message.senderId &&
                      isWithinGroupingThreshold(lastMessageDate, messageDate);
    const nextMessage = sortedMessages[index + 1];
    const isGroupStart = !isGrouped && nextMessage && 
                         nextMessage.senderId === message.senderId &&
                         isWithinGroupingThreshold(messageDate, new Date(nextMessage.createdAt));
    const isGroupEnd = isGrouped && (!nextMessage || 
                       nextMessage.senderId !== message.senderId ||
                       !isWithinGroupingThreshold(messageDate, new Date(nextMessage.createdAt)));

    grouped.push({
      type: "message",
      content: message.content,
      timestamp: messageDate.toISOString(),
      message,
      isGroupStart: isGroupStart && !isGrouped,
      isGroupEnd: isGroupEnd || (!isGrouped && !isGroupStart),
    });

    lastMessage = message;
    lastMessageDate = messageDate;
  });

  return grouped;
};
