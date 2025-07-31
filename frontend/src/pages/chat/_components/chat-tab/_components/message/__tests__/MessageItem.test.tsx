import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MessageItem from '../MessageItem';

import type { Message } from '@/store/messages.store';
import { TEST_IDS } from '@/test-ids';

vi.mock('@/store/user.store');

import useUserStore from '@/store/user.store';

describe('MessageItem', () => {
  const myMessage: Message = {
    id: 1,
    senderId: 1,
    recipientId: 2,
    content: 'Hello',
    timestamp: new Date().toISOString(),
  };

  const otherMessage: Message = {
    id: 2,
    senderId: 2,
    recipientId: 1,
    content: 'Hi there',
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.mocked(useUserStore).mockImplementation((selector: any) =>
      selector({
        currentUser: { id: 1, name: 'Alice', profile: 'https://example.com/alice.jpg' },
      })
    );
  });

  it('should render my message with the correct styles', () => {
    render(<MessageItem message={myMessage} />);
    const messageElement = screen.getByTestId(TEST_IDS.MY_MESSAGE);
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent('Hello');
  });

  it('should render other message with the correct styles', () => {
    render(<MessageItem message={otherMessage} />);
    const messageElement = screen.getByTestId(TEST_IDS.OTHER_MESSAGE);
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent('Hi there');
  });
});
