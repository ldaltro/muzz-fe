import { describe, it, expect } from 'vitest';
import { groupMessagesWithTimestamps } from './messageGrouping';

const createMessage = (content: string, timestamp: string, id: number) => ({
  id,
  content,
  timestamp,
  senderId: 1,
  recipientId: 2,
});

describe('groupMessagesWithTimestamps', () => {

  it('should group messages with timestamps', () => {
    const messages = [
      createMessage('Hello', '2025-07-30T10:00:00Z', 1),
      createMessage('Hi there', '2025-07-30T10:30:00Z', 2),
      createMessage('How are you?', '2025-07-30T12:00:00Z', 3), // 2 hours later
    ];

    const grouped = groupMessagesWithTimestamps(messages);

    // Should have two timestamp headings: one at start and one for hour gap
    expect(grouped).toHaveLength(5);
    expect(grouped[0].type).toBe('timestamp'); // Today 10:00 AM
    expect(grouped[1].type).toBe('message');   // Hello
    expect(grouped[2].type).toBe('message');   // Hi there
    expect(grouped[3].type).toBe('timestamp'); // Today 12:00 PM (hour gap)
    expect(grouped[4].type).toBe('message');   // How are you?
  });

  it('should handle empty messages', () => {
    const grouped = groupMessagesWithTimestamps([]);
    expect(grouped).toHaveLength(0);
  });

  it('should handle single message', () => {
    const messages = [createMessage('Hello', '2025-07-30T10:00:00Z', 1)];
    const grouped = groupMessagesWithTimestamps(messages);

    // Only one day heading with time for single message
    expect(grouped).toHaveLength(2);
    expect(grouped[0].type).toBe('timestamp'); // Today 10:00 AM
    expect(grouped[1].type).toBe('message');   // Hello
  });
});
