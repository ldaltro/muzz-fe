import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatTab from "../ChatTab";
import useUserStore from "../../../../../store/user.store";
import useMessagesStore from "../../../../../store/messages.store";
import type { User } from "../../../../../store/user.store";
import type { Message } from "../../../../../store/messages.store";

vi.mock("../../../../../store/user.store");
vi.mock("../../../../../store/messages.store");

const mockUseUserStore = vi.mocked(useUserStore);
const mockUseMessagesStore = vi.mocked(useMessagesStore);

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
    senderId: 1,
    recipientId: 2,
    content: "Hello Bob!",
    timestamp: "2025-01-01T10:00:00.000Z",
  },
  {
    id: 2,
    senderId: 2,
    recipientId: 1,
    content: "Hi Alice!",
    timestamp: "2025-01-01T10:01:00.000Z",
  },
];

const defaultUserStore = {
  currentUser: mockCurrentUser,
  currentRecipient: mockRecipient,
  setCurrentUser: vi.fn(),
  setCurrentRecipient: vi.fn(),
};

const defaultMessageStore = {
  messages: mockMessages,
  createMessage: vi.fn(),
};

let user: ReturnType<typeof userEvent.setup>;

const renderChat = (userOverrides = {}, msgOverrides = {}) => {
  mockUseUserStore.mockImplementation((selector) =>
    selector({ ...defaultUserStore, ...userOverrides })
  );
  mockUseMessagesStore.mockImplementation((selector) =>
    selector({ ...defaultMessageStore, ...msgOverrides })
  );
  return render(<ChatTab />);
};

describe("ChatTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
    });
  });

  describe("Message Input Functionality", () => {
    it("updates input value when user types", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      await user.type(input, "Test message");
      expect(input).toHaveValue("Test message");
    });

    it("clears input after sending message", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
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
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "New test message",
      });
    });

    it("sends message when form is submitted programmatically", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      const form = input.closest("form")!;
      await user.type(input, "Form submit test");
      fireEvent.submit(form);
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "Form submit test",
      });
    });

    it("trims whitespace from message content", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      await user.type(input, "  Message with spaces  ");
      await user.keyboard("{Enter}");
      expect(defaultMessageStore.createMessage).toHaveBeenCalledWith({
        senderId: 1,
        recipientId: 2,
        content: "Message with spaces",
      });
    });
  });

  describe("Message Validation", () => {
    it("does not send empty message", async () => {
      renderChat();
      await user.keyboard("{Enter}");
      expect(defaultMessageStore.createMessage).not.toHaveBeenCalled();
    });

    it("does not send whitespace-only message", async () => {
      renderChat();
      const input = screen.getByRole("textbox");
      await user.type(input, "   ");
      await user.keyboard("{Enter}");
      expect(defaultMessageStore.createMessage).not.toHaveBeenCalled();
    });

    it("does not send message when no recipient is selected", async () => {
      renderChat({ currentRecipient: null });
      const input = screen.getByRole("textbox");
      await user.type(input, "Test message");
      await user.keyboard("{Enter}");
      expect(defaultMessageStore.createMessage).not.toHaveBeenCalled();
    });
  });

  describe("Message Display", () => {
    it("renders messages in chronological order", () => {
      renderChat();
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