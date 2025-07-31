import { describe, it, expect } from 'vitest';
import { groupMessagesWithTimestamps } from './messageGrouping';

const createMessage = (content: string, createdAt: number, id: string) => ({
  id,
  content,
  createdAt,
  senderId: 1,
  recipientId: 2,
});

describe('groupMessagesWithTimestamps', () => {

  it('should group messages with timestamps', () => {
    const messages = [
      createMessage('Hello', new Date('2025-07-30T10:00:00Z').getTime(), '1'),
      createMessage('Hi there', new Date('2025-07-30T10:30:00Z').getTime(), '2'),
      createMessage('How are you?', new Date('2025-07-30T12:00:00Z').getTime(), '3'), // 2 hours later
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
    const messages = [createMessage('Hello', new Date('2025-07-30T10:00:00Z').getTime(), '1')];
    const grouped = groupMessagesWithTimestamps(messages);

    // Only one day heading with time for single message
    expect(grouped).toHaveLength(2);
    expect(grouped[0].type).toBe('timestamp'); // Today 10:00 AM
    expect(grouped[1].type).toBe('message');   // Hello
  });

  it('should handle >1 hour same-day gap boundary correctly', () => {
    const messages = [
      createMessage('First message', new Date('2025-07-30T10:00:00Z').getTime(), '1'),
      createMessage('Second message', new Date('2025-07-30T11:01:00Z').getTime(), '2'), // 1 hour 1 minute later
      createMessage('Third message', new Date('2025-07-30T12:30:00Z').getTime(), '3'),  // 1.5 hours later
    ];

    const grouped = groupMessagesWithTimestamps(messages);

    // We should have:
    // - Timestamp for 10:00 AM
    // - First message
    // - Timestamp for 11:01 AM (1+ hour gap)
    // - Second message  
    // - Timestamp for 12:30 PM (1+ hour gap)
    // - Third message
    expect(grouped).toHaveLength(6);
    expect(grouped[0].type).toBe('timestamp'); // Today 10:00 AM
    expect(grouped[1].type).toBe('message');   // First message
    expect(grouped[2].type).toBe('timestamp'); // Today 11:01 AM
    expect(grouped[3].type).toBe('message');   // Second message
    expect(grouped[4].type).toBe('timestamp'); // Today 12:30 PM
    expect(grouped[5].type).toBe('message');   // Third message
  });
});
