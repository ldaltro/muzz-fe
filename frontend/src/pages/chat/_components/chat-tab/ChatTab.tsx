import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import useUserStore from "@/store/user.store";
import MessageGroup from "@/pages/chat/_components/chat-tab/_components/message/MessageGroup";
import { useChatSocket } from "@/hooks/useChatSocket";
import { groupMessagesWithTimestamps } from "@/utils/messageGrouping";
import TestDataCheckbox from "./_components/TestDataCheckbox";
import { sampleMessages } from "./_utils/sample-data";
import { TEST_IDS } from "@/test-ids";
import { fetchMessages } from "@/api/chat";
import type { ChatMessage } from "@/shared/types";

const ChatTab = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [useTestData, setUseTestData] = useState(false);

  const queryClient = useQueryClient();
  // Ref used by intersection observer to detect when user scrolls to the top (to load older messages)
  const { ref: topSentinelRef, inView: topSentinelInView } = useInView({
    threshold: 0.1,
  });
  // Ref used to imperatively scroll to bottom when a new message arrives
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Ref to the scrollable container for scroll position management
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const currentUser = useUserStore((state) => state.currentUser);
  const currentRecipient = useUserStore((state) => state.currentRecipient);

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
    queryKey: ['chat', roomId, useTestData],
    queryFn: ({ pageParam }) => {
      if (useTestData) {
        return Promise.resolve(sampleMessages);
      }
      return fetchMessages({ room: roomId!, before: pageParam ?? Date.now(), limit: 20 });
    },
    initialPageParam: Date.now(),
    enabled: !!roomId,
    getNextPageParam: (lastPage: ChatMessage[]) => {
      if (useTestData) return undefined;
      const lastMessage = lastPage[lastPage.length - 1];
      return lastPage.length ? (lastMessage.createdAt || Date.now()) : undefined;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const handleMessageReceived = useCallback(
    (message: ChatMessage) => {
      if (useTestData) return;
      
      queryClient.setQueryData(['chat', roomId, useTestData], (old: { pages: ChatMessage[][] }) => {
        if (!old) return { pages: [[message]], pageParams: [Date.now()] };

        // Clone the pages array and the first page
        const newPages = [...old.pages];
        const first = [...(newPages[0] || [])];

        // Find the existing message index by clientId (for optimistic updates)
        const idx = first.findIndex((m: ChatMessage & { isOptimistic?: boolean }) =>
          m.clientId && message.clientId && m.clientId === message.clientId
        );

        if (idx >= 0) {
          // Replace existing optimistic message
          first[idx] = message;
        } else {
          // Prepend new message
          first.unshift(message);
        }

        // Update the first page in pages array
        newPages[0] = first;

        return {
          ...old,
          pages: newPages,
        };
      });
    },
    [queryClient, roomId, useTestData]
  );



  const { isConnected, connectionState, reconnectAttempts, lastError, sendMessage } = useChatSocket(
    roomId,
    handleMessageReceived
  );

  const handleMessageSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentRecipient || !currentMessage.trim() || !isConnected || useTestData) return;

    const clientId = crypto.randomUUID();
    const newMessage: ChatMessage = {
      clientId: clientId,
      senderId: currentUser.id,
      recipientId: currentRecipient.id,
      content: currentMessage.trim(),
      createdAt: Date.now(),
    };

    const optimisticMessage: ChatMessage & { isOptimistic?: boolean } = { 
      ...newMessage, 
      isOptimistic: true 
    };
    queryClient.setQueryData(['chat', roomId, useTestData], (old: { pages: ChatMessage[][] }) => {
      if (!old) return { pages: [[optimisticMessage]], pageParams: [Date.now()] };
      return {
        ...old,
        pages: [
          [optimisticMessage, ...(old.pages[0] || [])],
          ...old.pages.slice(1),
        ],
      };
    });

    sendMessage(newMessage);
    setCurrentMessage("");
  };

  const groupedMessages = useMemo(() => {
    const allMessages = (infiniteData?.pages.flat() || []) as ChatMessage[];
    // Convert ChatMessage to Message format expected by groupMessagesWithTimestamps
    const formattedMessages = allMessages.map((msg) => ({
      ...msg,
      id: msg.id || crypto.randomUUID(),
      createdAt: msg.createdAt || Date.now(),
    }));
    return groupMessagesWithTimestamps(formattedMessages);
  }, [infiniteData]);

  // When the top sentinel enters the viewport AND there are more pages, fetch older messages
  useEffect(() => {
    if (topSentinelInView && hasNextPage && !isFetchingNextPage) {
      // Store scroll position before fetching
      const container = scrollContainerRef.current;
      if (container) {
        const scrollHeightBefore = container.scrollHeight;
        const scrollTopBefore = container.scrollTop;
        
        fetchNextPage().then(() => {
          // Restore scroll position after new messages are added
          requestAnimationFrame(() => {
            const scrollHeightAfter = container.scrollHeight;
            const scrollHeightDelta = scrollHeightAfter - scrollHeightBefore;
            container.scrollTop = scrollTopBefore + scrollHeightDelta;
          });
        });
      }
    }
  }, [topSentinelInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-[5px]">
        <div className="flex flex-col">
          {/* Top sentinel for infinite scroll - watches first message */}
          {groupedMessages.length > 0 && (
            <>
              <div ref={topSentinelRef} className="h-1" />
              {isFetchingNextPage && (
                <div className="text-center text-sm text-gray-500 py-2">Loading older messages...</div>
              )}
            </>
          )}
          {groupedMessages.map((group, index) => (
            <MessageGroup key={`${group.type}-${group.timestamp}-${index}`} group={group} />
          ))}
          {/* Bottom ref for auto-scrolling to new messages */}
          <div ref={bottomRef} className="h-1" />
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
