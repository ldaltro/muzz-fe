import { useState, useMemo, useCallback } from "react";

import useMessagesStore from "../../../../store/messages.store.ts";
import useUserStore from "../../../../store/user.store.ts";
import MessageItem from "./_components/message/MessageItem.tsx";
import { useChatSocket } from "../../../../hooks/useChatSocket.ts";

const ChatTab = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const currentUser = useUserStore((state) => state.currentUser);
  const currentRecipient = useUserStore((state) => state.currentRecipient);
  const messages = useMessagesStore((state) => state.messages);
  const createMessage = useMessagesStore((state) => state.createMessage);

  const roomId = useMemo(() => {
    if (!currentUser || !currentRecipient) return null;
    return [currentUser.id, currentRecipient.id].sort().join("-");
  }, [currentUser, currentRecipient]);

  const handleMessageReceived = useCallback(
    (message: { uuid?: string; senderId: number; recipientId: number; content: string }) => {
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

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col p-[5px] overflow-auto max-h-[490px]">
        <div className="mt-auto">
          {messages.map((message) => (
            <div key={message.id || message.timestamp}>
              <MessageItem message={message} />
            </div>
          ))}
        </div>
      </div>
      <div className="p-[20px] px-[10px]">
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
            disabled={!isConnected}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
