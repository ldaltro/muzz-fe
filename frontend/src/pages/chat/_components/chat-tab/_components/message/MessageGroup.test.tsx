import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageGroup from './MessageGroup';
import type { MessageGroup as MessageGroupType } from '@/utils/messageGrouping';

vi.mock('@/store/user.store');

import useUserStore from '@/store/user.store';

describe('MessageGroup', () => {
  const mockMessage = {
    id: '1',
    senderId: 1,
    recipientId: 2,
    content: 'Hello World',
    createdAt: new Date('2025-07-30T10:00:00Z').getTime(),
  };

  beforeEach(() => {
    vi.mocked(useUserStore).mockImplementation((selector: any) =>
      selector({
        currentUser: { id: 1, name: 'Alice', profile: 'https://example.com/alice.jpg' },
      })
    );
  });

  it('should render timestamp heading with day and time', () => {
    const timestampGroup: MessageGroupType = {
      type: 'timestamp',
      content: 'January 7, 2020 8:18 PM',
      day: 'January 7, 2020',
      time: '8:18 PM',
    };

    render(<MessageGroup group={timestampGroup} />);
    expect(screen.getByText('January 7, 2020')).toBeInTheDocument();
    expect(screen.getByText('8:18 PM')).toBeInTheDocument();
  });

  it('should render message content', () => {
    const messageGroup: MessageGroupType = {
      type: 'message',
      content: 'Hello World',
      message: mockMessage,
    };

    render(<MessageGroup group={messageGroup} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should render nothing for missing message', () => {
    const messageGroup: MessageGroupType = {
      type: 'message',
      content: 'Test message',
    };

    const { container } = render(<MessageGroup group={messageGroup} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render timestamp with only day', () => {
    const timestampGroup: MessageGroupType = {
      type: 'timestamp',
      content: 'Today',
      day: 'Today',
      time: '',
    };

    render(<MessageGroup group={timestampGroup} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.queryByText(' ')).not.toBeInTheDocument();
  });

  describe('styling verification', () => {
    it('should apply bold styling to day text', () => {
      const timestampGroup: MessageGroupType = {
        type: 'timestamp',
        content: 'January 7, 2020 8:18 PM',
        day: 'January 7, 2020',
        time: '8:18 PM',
      };

      render(<MessageGroup group={timestampGroup} />);
      expect(screen.getByText('January 7, 2020')).toHaveClass('font-bold');
    });

    it('should apply normal styling to time text', () => {
      const timestampGroup: MessageGroupType = {
        type: 'timestamp',
        content: 'January 7, 2020 8:18 PM',
        day: 'January 7, 2020',
        time: '8:18 PM',
      };

      render(<MessageGroup group={timestampGroup} />);
      expect(screen.getByText('8:18 PM')).toHaveClass('font-normal');
    });
  });
});
