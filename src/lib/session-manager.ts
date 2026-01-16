// Session management utilities - now using backend API instead of localStorage
import * as apiClient from './api-client';
import * as wsClient from './websocket-client';

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

export interface AttendanceSubmission {
  sessionId: string;
  rollNumber: string;
  name: string;
  deviceFingerprint: string;
  ipAddress: string;
  timestamp: number;
  location: { lat: number; lng: number };
}

// Initialize WebSocket connection
let wsConnected = false;
wsClient.connectWebSocket().then(() => {
  wsConnected = true;
  console.log('[Session Manager] WebSocket connected');
});

/**
 * Create a new attendance session
 */
export const createSession = async (
  sessionId: string,
  facultyId: string,
  classId: string,
  section: string,
  location: { lat: number; lng: number } | null
): Promise<SessionData> => {
  try {
    const session = await apiClient.createSession({
      sessionId,
      facultyId,
      classId,
      section,
      location,
    });

    console.log('Created session:', sessionId);
    return session;
  } catch (error) {
    console.error('Failed to create session:', error);
    throw error;
  }
};

/**
 * Get an active session
 */
export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  try {
    const session = await apiClient.getSession(sessionId);
    console.log('getSession called for:', sessionId, 'Found:', !!session);
    return session;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

/**
 * Check if a session is active and valid
 */
export const isSessionActive = async (sessionId: string): Promise<boolean> => {
  const session = await getSession(sessionId);
  return session ? session.isActive : false;
};

/**
 * End an attendance session
 */
export const endSession = async (sessionId: string): Promise<void> => {
  try {
    await apiClient.endSession(sessionId);
    console.log('Ended session:', sessionId);
  } catch (error) {
    console.error('Failed to end session:', error);
    throw error;
  }
};

/**
 * Mark a token as used (validation happens on backend)
 */
export const markTokenAsUsed = async (sessionId: string, token: string): Promise<boolean> => {
  try {
    const result = await apiClient.validateNonce(sessionId, token);
    return result.valid;
  } catch (error) {
    console.error('Failed to validate nonce:', error);
    return false;
  }
};

/**
 * Check if a device can submit attendance
 */
export const canDeviceSubmit = async (
  deviceFingerprint: string,
  sessionId: string
): Promise<{ allowed: boolean; reason?: string; remainingTime?: number }> => {
  // For now, always allow - backend will validate
  return { allowed: true };
};

/**
 * Record a device submission
 */
export const recordDeviceSubmission = async (
  deviceFingerprint: string,
  sessionId: string,
  rollNumber: string,
  ipAddress?: string,
  location?: { lat: number; lng: number },
  nonce?: string
): Promise<void> => {
  try {
    console.log('recordDeviceSubmission called for session:', sessionId, 'roll:', rollNumber);

    await apiClient.submitAttendance({
      deviceFingerprint,
      sessionId,
      rollNumber,
      ipAddress,
      location,
      nonce,
    });

    console.log('Device submission recorded for roll:', rollNumber);
  } catch (error) {
    console.error('Failed to record device submission:', error);
    throw error;
  }
};

/**
 * Validate attendance submission
 */
export const validateAttendanceSubmission = async (
  submission: AttendanceSubmission
): Promise<{ valid: boolean; error?: string }> => {
  const session = await getSession(submission.sessionId);
  if (!session) {
    return { valid: false, error: 'Invalid session. Session does not exist.' };
  }

  if (!session.isActive) {
    return { valid: false, error: 'Session has ended. Attendance is no longer being accepted.' };
  }

  return { valid: true };
};

/**
 * Get session statistics
 */
export const getSessionStats = async (
  sessionId: string
): Promise<{
  totalSubmissions: number;
  uniqueDevices: number;
  duration: number;
} | null> => {
  const session = await getSession(sessionId);
  if (!session) return null;

  return {
    totalSubmissions: session.attendedDevices.length,
    uniqueDevices: session.attendedDevices.length,
    duration: Date.now() - session.startTime,
  };
};

/**
 * Get all device submissions for a session
 */
export const getSessionDevices = async (
  sessionId: string
): Promise<
  Array<{
    deviceFingerprint: string;
    timestamp: number;
    rollNumber: string;
    ipAddress?: string;
    location?: { lat: number; lng: number };
  }>
> => {
  try {
    const response = await apiClient.getSessionDevices(sessionId);
    console.log(
      'getSessionDevices called for:',
      sessionId,
      'Devices found:',
      response.totalDevices
    );
    return response.devices.map((device) => ({
      deviceFingerprint: device.fingerprint,
      timestamp: device.timestamp,
      rollNumber: device.rollNumber,
      ipAddress: device.ipAddress,
      location: device.location,
    }));
  } catch (error) {
    console.error('Failed to get session devices:', error);
    return [];
  }
};

/**
 * Subscribe to real-time session updates
 */
export const subscribeToSessionUpdates = (
  sessionId: string,
  onUpdate: (session: SessionData) => void
): (() => void) => {
  if (!wsConnected) {
    console.warn('[Session Manager] WebSocket not connected, will retry');
    wsClient.connectWebSocket().then(() => {
      wsClient.subscribeToSession(sessionId, onUpdate);
    });
  } else {
    wsClient.subscribeToSession(sessionId, onUpdate);
  }

  // Return unsubscribe function
  return () => {
    wsClient.unsubscribeFromSession(sessionId);
  };
};

/**
 * Clean up resources
 */
export const cleanup = (): void => {
  wsClient.disconnectWebSocket();
};
