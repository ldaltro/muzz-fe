import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatSocket } from './useChatSocket';
import { io as mockIo } from 'socket.io-client';

vi.mock('socket.io-client');

const TEST_ROOM = 'test-room';
const TEST_MESSAGE = {
  senderId: 1,
  recipientId: 2,
  content: 'Hello!'
};

describe('useChatSocket', () => {
  let mockSocket: any;
  let listeners: Record<string, (...args: any[]) => void>;

  beforeEach(() => {
    listeners = {};
    mockSocket = {
      on: vi.fn((event: string, cb: (...args: any[]) => void) => {
        listeners[event] = cb;
        return mockSocket;
      }),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connected: true,
    };
    (mockIo as any).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect, join room, and update isConnected', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    act(() => {
      listeners['connect']();
    });
    expect(result.current.isConnected).toBe(true);
    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', TEST_ROOM);
  });

  it('should handle disconnect and update isConnected', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    act(() => {
      listeners['connect']();
      listeners['disconnect']();
    });
    expect(result.current.isConnected).toBe(false);
  });

  it('should call onMessageReceived when message received', () => {
    const onMsg = vi.fn();
    renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    act(() => {
      listeners['receive_message'](TEST_MESSAGE);
    });
    expect(onMsg).toHaveBeenCalledWith(TEST_MESSAGE);
  });

  it('should send message if connected and room specified', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    act(() => {
      listeners['connect']();
      result.current.sendMessage(TEST_MESSAGE);
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('send_message', { room: TEST_ROOM, message: TEST_MESSAGE });
  });

  it('should not send message if not connected', () => {
    mockSocket.connected = false;
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      result.current.sendMessage(TEST_MESSAGE);
    });
    expect(mockSocket.emit).not.toHaveBeenCalledWith('send_message', expect.anything());
    expect(errorSpy).toHaveBeenCalledWith('Socket not connected or room not specified.');
    errorSpy.mockRestore();
  });

  it('should cleanup and disconnect socket on unmount', () => {
    const onMsg = vi.fn();
    const { unmount } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
