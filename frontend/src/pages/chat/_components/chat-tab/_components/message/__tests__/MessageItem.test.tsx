import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import MessageItem from '../MessageItem';

import type { Message } from '@/store/messages.store';
import { TEST_IDS } from '@/test-ids';

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

  it('should render my message with the correct styles', () => {
    render(<MessageItem message={myMessage} />);
    const messageElement = screen.getByTestId(TEST_IDS.MY_MESSAGE);
    expect(messageElement).toBeInTheDocument();
  });

  it('should render other message with the correct styles', () => {
    render(<MessageItem message={otherMessage} />);
    const messageElement = screen.getByTestId(TEST_IDS.OTHER_MESSAGE);
    expect(messageElement).toBeInTheDocument();
  });
});
