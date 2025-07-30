import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatTab from "../ChatTab";
import useUserStore from "@/store/user.store";
import useMessagesStore from "@/store/messages.store";
import { useChatSocket } from "@/hooks/useChatSocket";

import type { User } from "@/store/user.store";
import type { Message } from "@/store/messages.store";
import { TEST_IDS } from "@/test-ids";

const mockWebSocketState = {
  isConnected: true,
  connectionState: 'connected' as const,
  reconnectAttempts: 0,
  lastError: null,
  sendMessage: vi.fn(),
};

vi.mock("@/hooks/useChatSocket", () => ({
  useChatSocket: vi.fn(() => mockWebSocketState),
}));

vi.mock("@/store/user.store");
vi.mock("@/store/messages.store");

const mockUseUserStore = vi.mocked(useUserStore);
const mockUseMessagesStore = vi.mocked(useMessagesStore);
const mockUseChatSocket = vi.mocked(useChatSocket);

const mockCurrentUser: User = {
  id: 1,
  name: "Alice",
  profile: "https://example.com/alice.jpg",
};

const mockRecipient: User = {
  id: 2,
  name: "Bob",
  profile: "https://example.com/bob.jpg",
};

const mockMessages: Message[] = [
  {
    id: 1,
    uuid: "uuid-1",
    senderId: 1,
    recipientId: 2,
    content: "Hello Bob!",
    timestamp: "2025-01-01T10:00:00.000Z",
  },
  {
    id: 2,
    uuid: "uuid-2",
    senderId: 2,
    recipientId: 1,
    content: "Hi Alice!",
    timestamp: "2025-01-01T10:01:00.000Z",
  },
];

const createDefaultUserStore = () => ({
  currentUser: mockCurrentUser,
  currentRecipient: mockRecipient,
  setCurrentUser: vi.fn(),
  setCurrentRecipient: vi.fn(),
});

const createDefaultMessageStore = () => ({
  messages: mockMessages,
  createMessage: vi.fn(),
  setMessages: vi.fn(),
});

let defaultUserStore = createDefaultUserStore();
let defaultMessageStore = createDefaultMessageStore();

let user: ReturnType<typeof userEvent.setup>;

const renderChat = (userOverrides = {}, msgOverrides = {}) => {
  if (Object.keys(userOverrides).length > 0) {
    mockUseUserStore.mockImplementation((selector) =>
      selector({ ...defaultUserStore, ...userOverrides })
    );
  }
  if (Object.keys(msgOverrides).length > 0) {
    mockUseMessagesStore.mockImplementation((selector) =>
      selector({ ...defaultMessageStore, ...msgOverrides })
    );
  }
  const result = render(<ChatTab />);
  return result;
};

describe("ChatTab", () => {
  beforeEach(() => {
    user = userEvent.setup();
    
    defaultUserStore = createDefaultUserStore();
    defaultMessageStore = createDefaultMessageStore();
    
    mockUseUserStore.mockImplementation((selector) =>
      selector(defaultUserStore)
    );
    mockUseMessagesStore.mockImplementation((selector) =>
      selector(defaultMessageStore)
    );
    
    mockWebSocketState.isConnected = true;
    mockWebSocketState.connectionState = 'connected';
    mockWebSocketState.reconnectAttempts = 0;
    mockWebSocketState.lastError = null;
    mockWebSocketState.sendMessage.mockReset();
    
    mockUseChatSocket.mockReturnValue(mockWebSocketState);
    defaultMessageStore.setMessages.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Rendering", () => {
    it("renders the chat interface correctly", () => {
      renderChat();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Message Bob")).toBeInTheDocument();
    });

    it("displays existing messages", () => {
      renderChat();
      expect(screen.getByText("Hello Bob!")).toBeInTheDocument();
      expect(screen.getByText("Hi Alice!")).toBeInTheDocument();
    });

    it("shows empty placeholder when no recipient is selected", () => {
      renderChat({ currentRecipient: null }, { messages: [] });
      expect(screen.getByPlaceholderText(/Message\s*$/)).toBeInTheDocument();
    });
  });

  describe("WebSocket Message Handling", () => {
    it("shows connected state with proper placeholder", () => {
      renderChat();
      
      expect(screen.getByPlaceholderText("Message Bob")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).not.toBeDisabled();
    });

    it("shows disconnected state with connecting placeholder", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'connecting',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByPlaceholderText("Connecting...")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("receives messages via WebSocket callback", () => {
      renderChat();
      
      const mockCalls = mockUseChatSocket.mock.calls;
      
      expect(mockCalls).toHaveLength(1);
      expect(mockCalls[0]).toHaveLength(2);
      expect(typeof mockCalls[0][1]).toBe('function');
    });

    it("handles incoming WebSocket messages correctly", () => {
      renderChat();
      
      const mockCalls = mockUseChatSocket.mock.calls;
      const [, onMessageReceived] = mockCalls[0];
      
      const incomingMessage = {
        uuid: "uuid-3",
        senderId: 2,
        recipientId: 1,
        content: "Hello from WebSocket!",
        timestamp: "2025-01-01T10:02:00.000Z",
      };
      
      onMessageReceived(incomingMessage);
      
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith(incomingMessage);
    });

    it("handles multiple incoming WebSocket messages", () => {
      renderChat();
      
      const mockCalls = mockUseChatSocket.mock.calls;
      const [, onMessageReceived] = mockCalls[0];
      
      const messages = [
        {
          uuid: "uuid-3",
          senderId: 2,
          recipientId: 1,
          content: "First WebSocket message",
          timestamp: "2025-01-01T10:02:00.000Z",
        },
        {
          uuid: "uuid-4",
          senderId: 1,
          recipientId: 2,
          content: "Second WebSocket message",
          timestamp: "2025-01-01T10:03:00.000Z",
        },
      ];
      
      messages.forEach(message => onMessageReceived(message));
      
      expect(defaultMessageStore.createMessage).toHaveBeenCalledTimes(2);
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith(messages[0]);
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith(messages[1]);
    });
  });

  describe("Connection State UI", () => {
    it("shows connection indicator for connected state", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: true,
        connectionState: 'connected',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByPlaceholderText("Message Bob")).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CONNECTION_INDICATOR)).toBeInTheDocument();
      expect(screen.getByTestId(TEST_IDS.CONNECTION_INDICATOR)).toHaveClass('bg-green-500');
    });

    it("shows reconnecting state with attempt count", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'reconnecting',
        reconnectAttempts: 3,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByText("Reconnecting... (attempt 3)")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Reconnecting... (attempt 3)")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
      const statusContainer = screen.getByText("Reconnecting... (attempt 3)").closest("div");
      expect(statusContainer?.querySelector(`[data-testid="${TEST_IDS.CONNECTION_INDICATOR}"]`)).toHaveClass("bg-yellow-500");
    });

    it("shows error state with error message", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'error',
        reconnectAttempts: 0,
        lastError: 'Connection timeout',
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByText("Connection timeout")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Connection timeout")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
      const statusContainer2 = screen.getByText("Connection timeout").closest("div");
      expect(statusContainer2?.querySelector(`[data-testid="${TEST_IDS.CONNECTION_INDICATOR}"]`)).toHaveClass("bg-red-500");
    });

    it("shows disconnected state", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'disconnected',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByPlaceholderText("Disconnected")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByTestId(TEST_IDS.CONNECTION_INDICATOR)).toHaveClass('bg-red-500');
    });

    it("shows error banner only for error and reconnecting states", () => {
      // First test reconnecting state shows banner
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'reconnecting',
        reconnectAttempts: 2,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      const { rerender } = renderChat();
      expect(screen.getByText("Reconnecting... (attempt 2)")).toBeInTheDocument();

      // Test error state shows banner
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'error',
        reconnectAttempts: 0,
        lastError: 'Network error',
        sendMessage: mockWebSocketState.sendMessage,
      });

      rerender(<ChatTab />);
      expect(screen.getByText("Network error")).toBeInTheDocument();

      // Test connected state doesn't show banner
      mockUseChatSocket.mockReturnValue({
        isConnected: true,
        connectionState: 'connected',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      rerender(<ChatTab />);
      expect(screen.queryByText("Network error")).not.toBeInTheDocument();
      expect(screen.queryByText("Reconnecting...")).not.toBeInTheDocument();
    });

    it("shows connecting state without attempt count", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'connecting',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByPlaceholderText("Connecting...")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
      expect(screen.getByTestId(TEST_IDS.CONNECTION_INDICATOR)).toHaveClass('bg-yellow-500');
    });

    it("shows reconnecting state without attempt count when attempts is 0", () => {
      mockUseChatSocket.mockReturnValue({
        isConnected: false,
        connectionState: 'reconnecting',
        reconnectAttempts: 0,
        lastError: null,
        sendMessage: mockWebSocketState.sendMessage,
      });

      renderChat();

      expect(screen.getByText("Reconnecting...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Reconnecting...")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("Message Input Functionality", () => {
    it("updates input value when user types", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
      
      await user.type(input, "Test message");
      expect(input).toHaveValue("Test message");
    });

    it("clears input after sending message", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
      
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");
      expect(input).toHaveValue("");
    });
  });

  describe("Message Sending", () => {
    it("sends message when form is submitted with Enter key", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      
      await user.type(input, "New test message");
      await user.keyboard("{Enter}");
      
      expect(mockWebSocketState.sendMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "New test message",
        timestamp: expect.any(String),
      });
    });

    it("sends message when form is submitted programmatically", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      const form = input.closest("form")!;
      
      await user.type(input, "Form submit test");
      fireEvent.submit(form);
      
      expect(mockWebSocketState.sendMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "Form submit test",
        timestamp: expect.any(String),
      });
    });

    it("trims whitespace from message content", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      
      await user.type(input, "  Message with spaces  ");
      await user.keyboard("{Enter}");
      
      expect(mockWebSocketState.sendMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "Message with spaces",
        timestamp: expect.any(String),
      });
    });
  });

  describe("Message Validation", () => {
    it("does not send empty message", async () => {
      renderChat();
      
      await user.keyboard("{Enter}");
      
      expect(mockWebSocketState.sendMessage).not.toHaveBeenCalled();
    });

    it("does not send whitespace-only message", async () => {
      renderChat();
      
      const input = screen.getByRole("textbox");
      await user.type(input, "   ");
      await user.keyboard("{Enter}");
      
      expect(mockWebSocketState.sendMessage).not.toHaveBeenCalled();
    });

    it("does not send message when no recipient is selected", async () => {
      renderChat({ currentRecipient: null });
      
      const input = screen.getByRole("textbox");
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");
      
      expect(mockWebSocketState.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("Message Display", () => {
    it("renders messages in chronological order", () => {
      renderChat();
      expect(screen.getByText("Hello Bob!")).toBeInTheDocument();
      expect(screen.getByText("Hi Alice!")).toBeInTheDocument();
      const messages = screen.getAllByText(/Hello Bob!|Hi Alice!/);
      expect(messages[0]).toHaveTextContent("Hello Bob!");
      expect(messages[1]).toHaveTextContent("Hi Alice!");
    });

    it("handles empty message list", () => {
      renderChat({}, { messages: [] });
      expect(screen.queryByText("Hello Bob!")).not.toBeInTheDocument();
      expect(screen.queryByText("Hi Alice!")).not.toBeInTheDocument();
    });
  });
});