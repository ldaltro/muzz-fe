import {
  format,
  isToday,
  isYesterday,
  differenceInSeconds,
  differenceInHours,
} from "date-fns";

export interface Message {
  id: number;
  uuid?: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
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

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const grouped: MessageGroup[] = [];
  let lastDay: string | null = null;
  let lastMessage: Message | null = null;
  let lastMessageDate: Date | null = null;

  sortedMessages.forEach((message, index) => {
    const messageDate = new Date(message.timestamp);
    const currentDay = format(messageDate, "yyyy-MM-dd");

    // Add timestamp heading if it's a new day OR more than 1 hour since last message
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

    // Check if this message should be grouped with the previous one
    const isGrouped = lastMessage && 
                      lastMessageDate &&
                      lastMessage.senderId === message.senderId &&
                      isWithinGroupingThreshold(lastMessageDate, messageDate);

    // Check if this is the start of a new group
    const nextMessage = sortedMessages[index + 1];
    const isGroupStart = !isGrouped && nextMessage && 
                         nextMessage.senderId === message.senderId &&
                         isWithinGroupingThreshold(messageDate, new Date(nextMessage.timestamp));

    // Check if this is the end of a group
    const isGroupEnd = isGrouped && (!nextMessage || 
                       nextMessage.senderId !== message.senderId ||
                       !isWithinGroupingThreshold(messageDate, new Date(nextMessage.timestamp)));

    grouped.push({
      type: "message",
      content: message.content,
      timestamp: message.timestamp,
      message,
      isGroupStart: isGroupStart && !isGrouped,
      isGroupEnd: isGroupEnd || (!isGrouped && !isGroupStart),
    });

    lastMessage = message;
    lastMessageDate = messageDate;
  });

  return grouped;
};
