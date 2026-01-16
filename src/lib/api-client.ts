// API client for communicating with the backend server

// Use environment variable for API base, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE || 'https://ease-present.onrender.com/api';

export interface CreateSessionRequest {
  sessionId: string;
  facultyId: string;
  classId: string;
  section: string;
  location?: { lat: number; lng: number } | null;
}

export interface SubmitAttendanceRequest {
  deviceFingerprint: string;
  sessionId: string;
  rollNumber: string;
  ipAddress?: string;
  location?: { lat: number; lng: number };
  nonce?: string;
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

export interface SessionDevicesResponse {
  sessionId: string;
  devices: SessionData['attendedDevices'];
  totalDevices: number;
}

// Create a new session
export const createSession = async (
  request: CreateSessionRequest
): Promise<SessionData> => {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  return response.json();
};

// Get a session
export const getSession = async (sessionId: string): Promise<SessionData> => {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Failed to get session: ${response.statusText}`);
  }

  return response.json();
};

// Get devices for a session
export const getSessionDevices = async (
  sessionId: string
): Promise<SessionDevicesResponse> => {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/devices`);

  if (!response.ok) {
    throw new Error(`Failed to get session devices: ${response.statusText}`);
  }

  return response.json();
};

// Submit attendance
export const submitAttendance = async (
  request: SubmitAttendanceRequest
): Promise<{ success: boolean; message: string; deviceCount: number }> => {
  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to submit attendance: ${response.statusText}`);
  }

  return response.json();
};

// Validate nonce
export const validateNonce = async (
  sessionId: string,
  nonce: string
): Promise<{ isUsed: boolean; valid: boolean }> => {
  const response = await fetch(`${API_BASE}/nonce/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, nonce }),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate nonce: ${response.statusText}`);
  }

  return response.json();
};

// End a session
export const endSession = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to end session: ${response.statusText}`);
  }

  return response.json();
};
