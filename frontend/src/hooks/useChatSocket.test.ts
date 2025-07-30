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

  it('should connect, join room, and update connection state', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    
    // Initially connecting
    expect(result.current.connectionState).toBe('connecting');
    expect(result.current.isConnected).toBe(false);
    
    act(() => {
      listeners['connect']();
    });
    
    expect(result.current.connectionState).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.reconnectAttempts).toBe(0);
    expect(result.current.lastError).toBe(null);
    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', TEST_ROOM);
  });

  it('should handle disconnect and update connection state', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    
    act(() => {
      listeners['connect']();
      listeners['disconnect']('transport close');
    });
    
    expect(result.current.connectionState).toBe('reconnecting');
    expect(result.current.isConnected).toBe(false);
  });

  it('should handle server disconnect differently', () => {
    const onMsg = vi.fn();
    const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
    
    act(() => {
      listeners['connect']();
      listeners['disconnect']('io server disconnect');
    });
    
    expect(result.current.connectionState).toBe('disconnected');
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

  describe('reconnection scenarios', () => {
    it('should handle connection errors', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['connect_error']({ message: 'Connection failed' });
      });
      
      expect(result.current.connectionState).toBe('error');
      expect(result.current.lastError).toBe('Connection failed');
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle reconnection attempts', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['reconnect_attempt'](3);
      });
      
      expect(result.current.connectionState).toBe('reconnecting');
      expect(result.current.reconnectAttempts).toBe(3);
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle successful reconnection', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      // Simulate initial disconnect and reconnection attempts
      act(() => {
        listeners['disconnect']('transport close');
        listeners['reconnect_attempt'](2);
      });
      
      expect(result.current.reconnectAttempts).toBe(2);
      
      // Simulate successful reconnection
      act(() => {
        listeners['reconnect'](2);
      });
      
      expect(result.current.connectionState).toBe('connected');
      expect(result.current.reconnectAttempts).toBe(0);
      expect(result.current.lastError).toBe(null);
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle reconnection errors', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['reconnect_error']({ message: 'Reconnection failed' });
      });
      
      expect(result.current.lastError).toBe('Reconnection failed');
    });

    it('should handle reconnection failure after max attempts', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['reconnect_failed']();
      });
      
      expect(result.current.connectionState).toBe('error');
      expect(result.current.lastError).toBe('Unable to connect after multiple attempts');
      expect(result.current.isConnected).toBe(false);
    });

    it('should handle connection error without message', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['connect_error']({});
      });
      
      expect(result.current.connectionState).toBe('error');
      expect(result.current.lastError).toBe('Connection failed');
    });

    it('should handle reconnection error without message', () => {
      const onMsg = vi.fn();
      const { result } = renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      act(() => {
        listeners['reconnect_error']({});
      });
      
      expect(result.current.lastError).toBe('Reconnection failed');
    });
  });

  describe('socket configuration', () => {
    it('should initialize socket with correct options', () => {
      const onMsg = vi.fn();
      renderHook(() => useChatSocket(TEST_ROOM, onMsg));
      
      expect(mockIo).toHaveBeenCalledWith('http://localhost:3001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });
    });
  });
});
