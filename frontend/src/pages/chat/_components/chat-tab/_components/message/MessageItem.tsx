import type { Message } from "@/store/messages.store.ts";
import { colors } from "@/theme/colors.ts";
import { TEST_IDS } from "@/test-ids";

type MessageProps = {
  message: Message;
};

const MessageItem = ({ message }: MessageProps) => {
  const isMyMessage = message.senderId === 1;

  return (
    <div
      className={`px-[10px] py-[4px] text-sm m-[8px] max-w-[70%] ${isMyMessage ? 'self-end rounded-l-2xl rounded-tr-md' : 'self-start rounded-r-2xl rounded-tl-md'}`}
      data-testid={isMyMessage ? TEST_IDS.MY_MESSAGE : TEST_IDS.OTHER_MESSAGE}
      style={{
        backgroundColor: isMyMessage ? colors.myMessage : colors.otherMessage,
        color: isMyMessage ? colors.black : colors.white,
      }}
    >
      {message.content}
    </div>
  );
};

export default MessageItem;
