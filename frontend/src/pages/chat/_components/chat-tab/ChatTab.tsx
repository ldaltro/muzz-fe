import { useState, useMemo, useCallback, useEffect } from "react";

import useMessagesStore from "@/store/messages.store";

import useUserStore from "@/store/user.store";
import MessageGroup from "@/pages/chat/_components/chat-tab/_components/message/MessageGroup";
import { useChatSocket } from "@/hooks/useChatSocket";
import { groupMessagesWithTimestamps } from "@/utils/messageGrouping";
import TestDataCheckbox from "./_components/TestDataCheckbox";
import { sampleMessages } from "./_utils/sample-data";
import { TEST_IDS } from "@/test-ids";

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

  const handleMessageReceived = useCallback((message: {
    uuid?: string;
    senderId: number;
    recipientId: number;
    content: string;
  }) => {
    createMessage(message);
  }, [createMessage]);

  const { isConnected, connectionState, reconnectAttempts, lastError, sendMessage } = useChatSocket(
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

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return `Message ${currentRecipient?.name || ''}`;
      case 'reconnecting':
        return reconnectAttempts > 0 
          ? `Reconnecting... (attempt ${reconnectAttempts})`
          : 'Reconnecting...';
      case 'error':
        return lastError || 'Connection error';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const getConnectionIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return <div data-testid={TEST_IDS.CONNECTION_INDICATOR} className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'connecting':
      case 'reconnecting':
        return <div data-testid={TEST_IDS.CONNECTION_INDICATOR} className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
      case 'error':
      case 'disconnected':
        return <div data-testid={TEST_IDS.CONNECTION_INDICATOR} className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div data-testid={TEST_IDS.CONNECTION_INDICATOR} className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-[5px]">
        <div className="flex flex-col">
          {groupedMessages.map((group) => {
            const key = group.type === 'timestamp' 
              ? `timestamp-${group.timestamp}` 
              : `message-${group.message?.uuid || group.message?.id}`;
            return (
              <MessageGroup key={key} group={group} />
            );
          })}
        </div>
      </div>
      <div className="p-[20px] px-[10px] space-y-2 border-t border-gray-200">
        <TestDataCheckbox isChecked={useTestData} onChange={setUseTestData} />
        {(connectionState === 'error' || connectionState === 'reconnecting') && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            {getConnectionIndicator()}
            <span>{getConnectionStatus()}</span>
          </div>
        )}
        <form onSubmit={handleMessageSend} className="flex gap-[10px]">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={getConnectionStatus()}
              className="w-full rounded-full border-[8px] border-[#cfcfcf] px-[12px] py-[8px] pr-[40px]"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={!isConnected || useTestData}
            />
            <div className="absolute right-[20px] top-1/2 transform -translate-y-1/2">
              {getConnectionIndicator()}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
