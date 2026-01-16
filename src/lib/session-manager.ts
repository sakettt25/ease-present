// Session management utilities for attendance system
// Handles session tracking, device restrictions, and fraud prevention

export interface SessionData {
  sessionId: string;
  facultyId: string;
  classId: string;
  section: string;
  isActive: boolean;
  startTime: number;
  location: { lat: number; lng: number } | null;
  usedTokens: Set<string>; // Track used one-time tokens
  attendedDevices: Map<string, { timestamp: number; rollNumber: string; ipAddress?: string; location?: { lat: number; lng: number } }>; // Track device submissions with details
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

// In-memory session store (in production, use proper backend storage)
const activeSessions = new Map<string, SessionData>();
const deviceSubmissions = new Map<string, { sessionId: string; timestamp: number; rollNumber: string }>();

/**
 * Create a new attendance session
 */
export const createSession = (
  sessionId: string,
  facultyId: string,
  classId: string,
  section: string,
  location: { lat: number; lng: number } | null
): SessionData => {
  const sessionData: SessionData = {
    sessionId,
    facultyId,
    classId,
    section,
    isActive: true,
    startTime: Date.now(),
    location,
    usedTokens: new Set(),
    attendedDevices: new Map(),
  };

  activeSessions.set(sessionId, sessionData);
  return sessionData;
};

/**
 * Get an active session
 */
export const getSession = (sessionId: string): SessionData | null => {
  return activeSessions.get(sessionId) || null;
};

/**
 * Check if a session is active and valid
 */
export const isSessionActive = (sessionId: string): boolean => {
  const session = activeSessions.get(sessionId);
  return session ? session.isActive : false;
};

/**
 * End an attendance session
 */
export const endSession = (sessionId: string): void => {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.isActive = false;
  }
};

/**
 * Mark a token as used (one-time use enforcement)
 */
export const markTokenAsUsed = (sessionId: string, token: string): boolean => {
  const session = activeSessions.get(sessionId);
  if (!session) return false;

  if (session.usedTokens.has(token)) {
    return false; // Token already used
  }

  session.usedTokens.add(token);
  return true;
};

/**
 * Check if a device can submit attendance
 * Returns: { allowed: boolean, reason?: string, remainingTime?: number }
 */
export const canDeviceSubmit = (
  deviceFingerprint: string,
  sessionId: string
): { allowed: boolean; reason?: string; remainingTime?: number } => {
  const submission = deviceSubmissions.get(deviceFingerprint);

  if (!submission) {
    return { allowed: true };
  }

  // Check if it's the same session
  if (submission.sessionId === sessionId) {
    return {
      allowed: false,
      reason: "You have already submitted attendance for this session.",
    };
  }

  // Check if 50 minutes have passed since last submission
  const timeSinceLastSubmission = Date.now() - submission.timestamp;
  const lockoutPeriod = 50 * 60 * 1000; // 50 minutes in milliseconds

  if (timeSinceLastSubmission < lockoutPeriod) {
    const remainingTime = Math.ceil((lockoutPeriod - timeSinceLastSubmission) / 60000);
    return {
      allowed: false,
      reason: `Device is locked. Please wait ${remainingTime} minute(s) before submitting again.`,
      remainingTime,
    };
  }

  return { allowed: true };
};

/**
 * Record a device submission
 */
export const recordDeviceSubmission = (
  deviceFingerprint: string,
  sessionId: string,
  rollNumber: string,
  ipAddress?: string,
  location?: { lat: number; lng: number }
): void => {
  deviceSubmissions.set(deviceFingerprint, {
    sessionId,
    timestamp: Date.now(),
    rollNumber,
  });

  // Also track within the session
  const session = activeSessions.get(sessionId);
  if (session) {
    session.attendedDevices.set(deviceFingerprint, {
      timestamp: Date.now(),
      rollNumber,
      ipAddress,
      location,
    });
  }
};

/**
 * Validate attendance submission (comprehensive check)
 */
export const validateAttendanceSubmission = (
  submission: AttendanceSubmission
): { valid: boolean; error?: string } => {
  // Check if session exists and is active
  const session = getSession(submission.sessionId);
  if (!session) {
    return { valid: false, error: "Invalid session. Session does not exist." };
  }

  if (!session.isActive) {
    return { valid: false, error: "Session has ended. Attendance is no longer being accepted." };
  }

  // Check device restrictions
  const deviceCheck = canDeviceSubmit(submission.deviceFingerprint, submission.sessionId);
  if (!deviceCheck.allowed) {
    return { valid: false, error: deviceCheck.reason };
  }

  return { valid: true };
};

/**
 * Get session statistics
 */
export const getSessionStats = (sessionId: string): {
  totalSubmissions: number;
  uniqueDevices: number;
  duration: number;
} | null => {
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  return {
    totalSubmissions: session.attendedDevices.size,
    uniqueDevices: session.attendedDevices.size,
    duration: Date.now() - session.startTime,
  };
};

/**
 * Clean up old sessions (call periodically)
 */
export const cleanupOldSessions = (maxAge: number = 24 * 60 * 60 * 1000): void => {
  const now = Date.now();
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.startTime > maxAge) {
      activeSessions.delete(sessionId);
    }
  }
};

/**
 * Get all device submissions for a session
 */
export const getSessionDevices = (sessionId: string): Array<{
  deviceFingerprint: string;
  timestamp: number;
  rollNumber: string;
  ipAddress?: string;
  location?: { lat: number; lng: number };
}> => {
  const session = activeSessions.get(sessionId);
  if (!session) return [];

  return Array.from(session.attendedDevices.entries()).map(([fingerprint, data]) => ({
    deviceFingerprint: fingerprint,
    ...data,
  }));
};
