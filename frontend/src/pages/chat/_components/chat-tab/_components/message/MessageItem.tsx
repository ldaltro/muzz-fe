import type { Message } from "@/store/messages.store.ts";
import useUserStore from "@/store/user.store.ts";
import { TEST_IDS } from "@/test-ids";

type MessageProps = {
  message: Message;
  isGrouped?: boolean;
};

const MessageItem = ({ message, isGrouped = false }: MessageProps) => {
  const currentUserId = useUserStore((state) => state.currentUser.id);
  const isMyMessage = message.senderId === currentUserId;
  const marginTop = isGrouped ? 'mt-0.5' : 'mt-4';

  return (
    <div
      className={`px-2.5 py-1 text-sm mx-2 mb-1 ${marginTop} max-w-[70%] ${isMyMessage ? 'self-end rounded-l-2xl rounded-tr-md bg-[#E5E5EA] text-black' : 'self-start rounded-r-2xl rounded-tl-md bg-[#FF3B30] text-white'}`}
      data-testid={isMyMessage ? TEST_IDS.MY_MESSAGE : TEST_IDS.OTHER_MESSAGE}
    >
      {message.content}
    </div>
  );
};

export default MessageItem;
