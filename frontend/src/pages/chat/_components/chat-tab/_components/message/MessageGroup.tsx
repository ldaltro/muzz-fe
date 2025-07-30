import type { MessageGroup as MessageGroupType } from '@/utils/messageGrouping';
import MessageItem from './MessageItem';

interface MessageGroupProps {
  group: MessageGroupType;
}

const MessageGroup = ({ group }: MessageGroupProps) => {
  if (group.type === 'timestamp') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 px-3 py-1 rounded-full">
          {group.day && (
            <>
              <span className="font-bold">{group.day}</span>
              {group.time && (
                <>
                  {' '}
                  <span className="font-normal">{group.time}</span>
                </>
              )}
            </>
          )}
        </span>
      </div>
    );
  }

  if (group.type === 'message' && group.message) {
    return <MessageItem message={group.message} />;
  }

  return null;
};

export default MessageGroup;
