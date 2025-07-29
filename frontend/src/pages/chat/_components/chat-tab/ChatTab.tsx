import { useState } from "react";
import useMessagesStore from "../../../../store/messages.store.ts";
import useUserStore from "../../../../store/user.store.ts";
import MessageItem from "./_components/message/MessageItem.tsx";

const ChatTab = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const currentUser = useUserStore((state) => state.currentUser);
  const currentRecipient = useUserStore((state) => state.currentRecipient);
  const messages = useMessagesStore((state) => state.messages);
  const createMessage = useMessagesStore((state) => state.createMessage);

  const handleMessageSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentRecipient || !currentMessage.trim()) return;

    const newMessage = {
      senderId: currentUser.id,
      recipientId: currentRecipient.id,
      content: currentMessage.trim(),
    };

    createMessage(newMessage);
    setCurrentMessage("");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col p-[5px] overflow-auto max-h-[490px]">
        <div className="mt-auto">
          {messages.map((message) => (
            <div key={message.timestamp}>
              <MessageItem
                message={message}
                key={message.id}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="p-[20px] px-[10px]">
        <form onSubmit={(e) => handleMessageSend(e)} className="flex gap-[10px]">
          <input
            type="text"
            placeholder={`Message ${currentRecipient?.name || ""}`}
            className="flex-1 rounded-full border-[8px] border-[#cfcfcf] px-[12px] py-[8px]"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
