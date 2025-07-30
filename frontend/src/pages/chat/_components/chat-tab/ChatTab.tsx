import { useState, useMemo, useCallback, useEffect } from "react";

import useMessagesStore from "@/store/messages.store";

import useUserStore from "@/store/user.store";
import MessageGroup from "@/pages/chat/_components/chat-tab/_components/message/MessageGroup";
import { useChatSocket } from "@/hooks/useChatSocket";
import { groupMessagesWithTimestamps } from "@/utils/messageGrouping";
import TestDataCheckbox from "./_components/TestDataCheckbox";
import { sampleMessages } from "./_utils/sample-data";

const ChatTab = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [useTestData, setUseTestData] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);
  const currentRecipient = useUserStore((state) => state.currentRecipient);
  const messages = useMessagesStore((state) => state.messages);
  const createMessage = useMessagesStore((state) => state.createMessage);
  const setMessages = useMessagesStore((state) => state.setMessages);

  useEffect(() => {
    if (useTestData) {
      setMessages(sampleMessages);
    } else {
      setMessages([]);
    }
  }, [useTestData, setMessages]);

  const roomId = useMemo(() => {
    if (!currentUser || !currentRecipient) return null;
    return [currentUser.id, currentRecipient.id].sort().join("-");
  }, [currentUser, currentRecipient]);

  const handleMessageReceived = useCallback(
    (message: {
      uuid?: string;
      senderId: number;
      recipientId: number;
      content: string;
    }) => {
      createMessage(message);
    },
    [createMessage]
  );

  const { isConnected, sendMessage } = useChatSocket(
    roomId,
    handleMessageReceived
  );

  const handleMessageSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentRecipient || !currentMessage.trim() || !isConnected) return;

    const newMessage = {
      senderId: currentUser.id,
      recipientId: currentRecipient.id,
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    sendMessage(newMessage);
    setCurrentMessage("");
  };

  const groupedMessages = useMemo(() => {
    const currentMessages = useTestData
      ? sampleMessages
      : messages.filter(
          (msg) =>
            (msg.senderId === currentUser?.id &&
              msg.recipientId === currentRecipient?.id) ||
            (msg.senderId === currentRecipient?.id &&
              msg.recipientId === currentUser?.id)
        );
    return groupMessagesWithTimestamps(currentMessages);
  }, [messages, currentUser, currentRecipient, useTestData]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-[5px]">
        <div className="flex flex-col">
          {groupedMessages.map((group, index) => (
            <MessageGroup key={index} group={group} />
          ))}
        </div>
      </div>
      <div className="p-[20px] px-[10px] space-y-2 border-t border-gray-200">
        <TestDataCheckbox isChecked={useTestData} onChange={setUseTestData} />
        <form onSubmit={handleMessageSend} className="flex gap-[10px]">
          <input
            type="text"
            placeholder={
              isConnected
                ? `Message ${currentRecipient?.name || ""}`
                : "Connecting..."
            }
            className="flex-1 rounded-full border-[8px] border-[#cfcfcf] px-[12px] py-[8px]"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={!isConnected || useTestData}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
