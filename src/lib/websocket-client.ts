// WebSocket client for real-time attendance updates
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_SERVER = import.meta.env.VITE_API_BASE?.replace('/api', '') || 'https://ease-present.onrender.com';

export interface AttendanceUpdate {
  sessionId: string;
  deviceCount: number;
  newDevice: {
    rollNumber: string;
    fingerprint: string;
    timestamp: number;
  };
}

export interface SessionData {
  sessionId: string;
  facultyId: string;
  classId: string;
  section: string;
  isActive: boolean;
  startTime: number;
  location: { lat: number; lng: number } | null;
  usedTokens: string[];
  attendedDevices: Array<{
    fingerprint: string;
    timestamp: number;
    rollNumber: string;
    ipAddress?: string;
    location?: { lat: number; lng: number };
  }>;
}

// Connect to WebSocket server
export const connectWebSocket = (): Promise<Socket> => {
  return new Promise((resolve) => {
    if (socket && socket.connected) {
      resolve(socket);
      return;
    }

    socket = io(SOCKET_SERVER, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server');
      resolve(socket!);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });
  });
};

// Subscribe to session updates
export const subscribeToSession = (
  sessionId: string,
  onUpdate: (data: SessionData) => void
): void => {
  if (!socket || !socket.connected) {
    console.error('[WebSocket] Socket not connected');
    return;
  }

  socket.emit('subscribe:session', sessionId);

  // Listen for session data updates
  socket.on('session:data', (data: SessionData) => {
    if (data.sessionId === sessionId) {
      console.log('[WebSocket] Received session data update');
      onUpdate(data);
    }
  });

  // Listen for attendance updates
  socket.on('attendance:updated', (update: AttendanceUpdate) => {
    if (update.sessionId === sessionId) {
      console.log('[WebSocket] Attendance updated:', update);
      // Fetch fresh session data
      // The component should refetch when it sees this event
    }
  });
};

// Unsubscribe from session
export const unsubscribeFromSession = (sessionId: string): void => {
  if (!socket) return;

  socket.emit('unsubscribe:session', sessionId);
  socket.off('session:data');
  socket.off('attendance:updated');
};

// Listen for session creation
export const onSessionCreated = (callback: (session: SessionData) => void): void => {
  if (!socket) return;

  socket.on('session:created', callback);
};

// Listen for session ended
export const onSessionEnded = (callback: (data: { sessionId: string }) => void): void => {
  if (!socket) return;

  socket.on('session:ended', callback);
};

// Disconnect WebSocket
export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get socket instance
export const getSocket = (): Socket | null => socket;
