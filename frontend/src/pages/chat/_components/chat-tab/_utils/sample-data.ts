import type { Message } from '@/store/messages.store';

const now = new Date();

export const sampleMessages: Message[] = [
  // Messages from last month
  {
    id: '1',
    senderId: 1,
    recipientId: 2,
    content: 'Hey! Did you see the game last night?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 30, // 30 days ago
  },
  {
    id: '2',
    senderId: 2,
    recipientId: 1,
    content: 'Yeah, it was amazing! That last minute goal was incredible.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 30 + 1000 * 60 * 5, // 30 days ago + 5 min
  },
  {
    id: '3',
    senderId: 1,
    recipientId: 2,
    content: 'I know right? I couldn\'t believe it.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 30 + 1000 * 60 * 6, // 30 days ago + 6 min
  },
  {
    id: '4',
    senderId: 1,
    recipientId: 2,
    content: 'We should watch the next one together.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 30 + 1000 * 60 * 6 + 1000 * 15, // 15 seconds later
  },
  {
    id: '5',
    senderId: 2,
    recipientId: 1,
    content: 'Definitely! Count me in.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 30 + 1000 * 60 * 8, // 30 days ago + 8 min
  },
  // Messages from 2 weeks ago
  {
    id: '6',
    senderId: 2,
    recipientId: 1,
    content: 'Hey, are you coming to Sarah\'s party?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
  },
  {
    id: '7',
    senderId: 1,
    recipientId: 2,
    content: 'Yes! What time does it start?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 2, // 14 days ago + 2 min
  },
  {
    id: '8',
    senderId: 2,
    recipientId: 1,
    content: '7 PM. Do you need a ride?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 3, // 14 days ago + 3 min
  },
  {
    id: '9',
    senderId: 1,
    recipientId: 2,
    content: 'That would be great, thanks!',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 4, // 14 days ago + 4 min
  },
  // Messages from last week
  {
    id: '10',
    senderId: 1,
    recipientId: 2,
    content: 'Did you finish the report?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
  },
  {
    id: '11',
    senderId: 2,
    recipientId: 1,
    content: 'Almost done. Just need to review the numbers.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 10, // 7 days ago + 10 min
  },
  {
    id: '12',
    senderId: 1,
    recipientId: 2,
    content: 'Cool, let me know when you\'re ready.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 11, // 7 days ago + 11 min
  },
  // Messages from 3 days ago
  {
    id: '13',
    senderId: 2,
    recipientId: 1,
    content: 'Lunch today?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: '14',
    senderId: 1,
    recipientId: 2,
    content: 'Sure! The usual place?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 2, // 3 days ago + 2 min
  },
  {
    id: '15',
    senderId: 2,
    recipientId: 1,
    content: 'Actually, let\'s try that new sushi place.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 3, // 3 days ago + 3 min
  },
  {
    id: '16',
    senderId: 1,
    recipientId: 2,
    content: 'Sounds good! See you at noon.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 4, // 3 days ago + 4 min
  },
  // Today's messages
  {
    id: '17',
    senderId: 1,
    recipientId: 2,
    content: 'Hey, how is it going?',
    createdAt: now.getTime() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: '18',
    senderId: 2,
    recipientId: 1,
    content: 'Hey! I am good, thanks for asking.',
    createdAt: now.getTime() - 1000 * 60 * 60 * 1.5, // 1.5 hours ago
  },
  {
    id: '19',
    senderId: 1,
    recipientId: 2,
    content: 'I wanted to ask you about the project.',
    createdAt: now.getTime() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: '20',
    senderId: 1,
    recipientId: 2,
    content: 'Are you free to chat?',
    createdAt: now.getTime() - 1000 * 60 * 30 + 10000, // 10 seconds later
  },
  {
    id: '21',
    senderId: 2,
    recipientId: 1,
    content: 'Sure, I have some time now.',
    createdAt: now.getTime() - 1000 * 60 * 28, // 28 minutes ago
  },
  {
    id: '22',
    senderId: 2,
    recipientId: 1,
    content: 'What do you want to discuss?',
    createdAt: now.getTime() - 1000 * 60 * 28 + 15000, // 15 seconds later
  },
  {
    id: '23',
    senderId: 1,
    recipientId: 2,
    content: 'Just a few things about the new feature.',
    createdAt: now.getTime() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    id: '24',
    senderId: 1,
    recipientId: 2,
    content: 'It should not take long.',
    createdAt: now.getTime() - 1000 * 60 * 5 + 25000, // 25 seconds later, so not grouped by proximity
  },
];
