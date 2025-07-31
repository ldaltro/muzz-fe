import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import useMessagesStore from "@/store/messages.store";

import useUserStore from "@/store/user.store";
import MessageGroup from "@/pages/chat/_components/chat-tab/_components/message/MessageGroup";
import { useChatSocket } from "@/hooks/useChatSocket";
import { groupMessagesWithTimestamps } from "@/utils/messageGrouping";
import TestDataCheckbox from "./_components/TestDataCheckbox";
import { sampleMessages } from "./_utils/sample-data";
import { TEST_IDS } from "@/test-ids";
import { fetchMessages } from "@/api/chat";

const ChatTab = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [useTestData, setUseTestData] = useState(false);

  const queryClient = useQueryClient();
  // Ref used by intersection observer to detect when user scrolls to the bottom (to load older messages)
  const { ref: sentinelRef, inView } = useInView();
  // Ref used to imperatively scroll to bottom when a new message arrives
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Combine both refs so the same DOM element can be observed and scrolled into view
  const setBottomAndSentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef(node);
    bottomRef.current = node;
  }, [sentinelRef]);

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

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chat', roomId],
    queryFn: ({ pageParam }) =>
      fetchMessages({ room: roomId!, before: pageParam ?? Date.now(), limit: 20 }),
    initialPageParam: Date.now(),
    enabled: !!roomId && !useTestData,
    getNextPageParam: (lastPage: any[]) =>
      lastPage.length ? lastPage[lastPage.length - 1].createdAt : undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const handleMessageReceived = useCallback(
    (message: {
      uuid?: string;
      senderId: number;
      recipientId: number;
      content: string;
    }) => {
      createMessage(message);
      queryClient.setQueryData(['chat', roomId], (old: any) => {
        if (!old) return old;
        const newMessage = { ...message, createdAt: Date.now() };
        return {
          ...old,
          pages: [
            [newMessage, ...(old.pages[0] || [])],
            ...old.pages.slice(1),
          ],
        };
      });
    },
    [createMessage, queryClient, roomId]
  );



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
    if (useTestData) {
      return groupMessagesWithTimestamps(messages);
    }
    
    // When using real data, use messages from infiniteQuery
    const allMessages = (infiniteData?.pages.flat() || []) as any[];
    
    // Add any local messages that aren't already in the infinite query data
    const localMessagesNotInQuery = messages.filter(localMsg => 
      !allMessages.some(apiMsg => 
        (apiMsg.uuid && apiMsg.uuid === localMsg.uuid) || 
        (apiMsg.id && apiMsg.id === localMsg.id)
      )
    );
    
    return groupMessagesWithTimestamps([...allMessages, ...localMessagesNotInQuery]);
  }, [infiniteData, messages, useTestData]);

  // When the sentinel enters the viewport at the bottom AND there are more pages, fetch older messages
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  // Whenever the groupedMessages array changes (new message arrives), scroll to bottom smoothly
  useEffect(() => {
    // Delay executed to allow DOM to update with the newly rendered message before scrolling
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
    return () => clearTimeout(timeout);
  }, [groupedMessages]);


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
          {groupedMessages.map((group, index) => (
            <MessageGroup key={`${group.type}-${group.timestamp}-${index}`} group={group} />
          ))}
          {/* The same element acts as both the intersection observer target for infinite scroll and the scroll target for auto-scrolling */}
          <div ref={setBottomAndSentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="text-center text-sm text-gray-500">Loading older messages...</div>
          )}
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
