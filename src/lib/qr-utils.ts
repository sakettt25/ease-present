// QR Code utility functions for attendance system
import { markTokenAsUsed, getSession } from './session-manager';

// Generate a unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Generate a cryptographically random nonce (one-time token)
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Generate QR code data with embedded one-time token (nonce)
export const generateQRData = (sessionId: string, facultyId: string, classId: string): string => {
  const nonce = generateNonce(); // One-time use token
  const timestamp = Date.now();
  const expiresAt = timestamp + 120000; // 120 seconds validity
  
  const data = {
    sessionId,
    facultyId,
    classId,
    nonce, // Changed from token to nonce for clarity
    timestamp,
    expiresAt,
  };
  
  return btoa(JSON.stringify(data));
};

// Parse QR code data
export const parseQRData = (qrString: string): {
  sessionId: string;
  facultyId: string;
  classId: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
} | null => {
  try {
    const decoded = atob(qrString);
    const data = JSON.parse(decoded);
    // Support both old 'token' and new 'nonce' format
    return {
      ...data,
      nonce: data.nonce || data.token,
    };
  } catch {
    return null;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Generate comprehensive device fingerprint
export const generateDeviceFingerprint = (): string => {
  const screenData = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const languages = navigator.languages?.join(',') || navigator.language;
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'unknown';
  const userAgent = navigator.userAgent;
  const hardwareConcurrency = navigator.hardwareConcurrency || 0;
  const deviceMemory = (navigator as any).deviceMemory || 0;
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  
  // Get canvas fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasHash = '';
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Attendance System 🎓', 2, 2);
    canvasHash = canvas.toDataURL().substring(0, 50);
  }
  
  const fingerprintString = [
    screenData,
    timezone,
    language,
    languages,
    platform,
    userAgent,
    hardwareConcurrency,
    deviceMemory,
    maxTouchPoints,
    canvasHash
  ].join('|');
  
  // Enhanced hash function
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.codePointAt(i) || 0;
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
};

// Get client IP address (using external API as fallback)
export const getClientIPAddress = async (): Promise<string> => {
  try {
    // In production, this should come from your backend
    // Here we use a public API for demonstration
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
};

// Check if nonce exists without marking it as used
export const checkNonce = (sessionId: string, nonce: string): boolean => {
  const session = getSession(sessionId);
  if (!session) return false;
  return !session.usedTokens.has(nonce);
};

// Validate nonce usage (one-time token validation) - only call after all checks pass
export const validateNonce = (sessionId: string, nonce: string): boolean => {
  return markTokenAsUsed(sessionId, nonce);
};

// Format timestamp for display
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Convert attendance data to CSV with enhanced fields
export const generateCSV = (
  attendanceData: Array<{
    rollNumber: string;
    name: string;
    status: 'Present' | 'Absent';
    timestamp?: number;
    deviceId?: string;
    ipAddress?: string;
    location?: { lat: number; lng: number };
  }>
): string => {
  const headers = ['Roll Number', 'Name', 'Status', 'Timestamp', 'Device ID', 'IP Address', 'Location'];
  const rows = attendanceData.map((record) => [
    record.rollNumber,
    record.name,
    record.status,
    record.timestamp ? formatTimestamp(record.timestamp) : 'N/A',
    record.deviceId || 'N/A',
    record.ipAddress || 'N/A',
    record.location ? `${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)}` : 'N/A',
  ]);
  
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
};

// Download CSV file
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  link.remove();
};
