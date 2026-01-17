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
// Now returns a complete URL for direct scanning
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
  
  // Return complete URL for direct scanning
  const baseUrl = window.location.origin;
  const encodedData = btoa(JSON.stringify(data));
  return `${baseUrl}/scan?data=${encodeURIComponent(encodedData)}`;
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

// Generate comprehensive device fingerprint with enhanced security
export const generateDeviceFingerprint = (): string => {
  const fingerprintComponents = {
    // Screen & display info
    screen: getScreenFingerprint(),
    
    // Browser & OS info
    browser: getBrowserFingerprint(),
    
    // Hardware capabilities
    hardware: getHardwareFingerprint(),
    
    // WebGL & graphics
    graphics: getGraphicsFingerprint(),
    
    // Canvas fingerprint (rendering-based)
    canvas: getCanvasFingerprint(),
    
    // Fonts available
    fonts: getFontsFingerprint(),
    
    // Web Audio context
    audio: getAudioFingerprint(),
    
    // Storage capabilities
    storage: getStorageFingerprint(),
    
    // Plugin info (if available)
    plugins: getPluginsFingerprint(),
    
    // WebRTC leak detection
    webrtc: getWebRTCFingerprint(),
  };

  const fingerprintString = JSON.stringify(fingerprintComponents);
  const hash = hashString(fingerprintString);
  
  return `fp_${hash}_${Date.now().toString(36)}`;
};

// Get screen fingerprint
const getScreenFingerprint = (): string => {
  return JSON.stringify({
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    orientation: (window.screen as any).orientation?.type || 'unknown',
    devicePixelRatio: window.devicePixelRatio,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
  });
};

// Get browser fingerprint
const getBrowserFingerprint = (): string => {
  return JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages || [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    doNotTrack: (navigator as any).doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  });
};

// Get hardware fingerprint
const getHardwareFingerprint = (): string => {
  return JSON.stringify({
    cores: navigator.hardwareConcurrency || 'unknown',
    memory: (navigator as any).deviceMemory || 'unknown',
    platform: (navigator as any).userAgentData?.platform || navigator.platform,
    architecture: (navigator as any).userAgentData?.architecture || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints,
    pointerEnabled: (navigator as any).pointerEnabled,
    vibrate: navigator.vibrate ? 'supported' : 'unsupported',
  });
};

// Get graphics & WebGL fingerprint
const getGraphicsFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    
    if (!gl) return JSON.stringify({ webgl: 'unsupported' });
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return JSON.stringify({
      vendor: gl.getParameter(debugInfo ? (gl as any).UNMASKED_VENDOR_WEBGL : gl.VENDOR),
      renderer: gl.getParameter(debugInfo ? (gl as any).UNMASKED_RENDERER_WEBGL : gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
    });
  } catch {
    return JSON.stringify({ webgl: 'error' });
  }
};

// Get canvas fingerprint (rendering-based, hard to spoof)
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'canvas_error';
    
    // Draw with specific text and effects
    ctx.textBaseline = 'top';
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('EasePresent🎓', 10, 15);
    
    // Draw bezier curves
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(10, 40);
    ctx.bezierCurveTo(20, 20, 30, 50, 50, 40);
    ctx.stroke();
    
    // Get image data and hash it
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let canvasHash = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      canvasHash += imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
    }
    
    return canvasHash.toString(36);
  } catch {
    return 'canvas_error';
  }
};

// Detect available fonts
const getFontsFingerprint = (): string => {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Verdana', 'Courier New', 'Georgia', 'Palatino', 
    'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Impact', 'Lucida Console', 'Tahoma', 'Lucida Grande'
  ];
  
  const availableFonts: string[] = [];
  
  const testString = 'mmmmmmmmmmlli';
  const textSize = '72px';
  
  for (const font of testFonts) {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    if (!ctx) continue;
    
    ctx.font = `${textSize} ${font}, ${baseFonts[0]}`;
    const width1 = ctx.measureText(testString).width;
    
    ctx.font = `${textSize} ${baseFonts[0]}`;
    const width2 = ctx.measureText(testString).width;
    
    if (width1 !== width2) {
      availableFonts.push(font);
    }
  }
  
  return JSON.stringify(availableFonts);
};

// Get Web Audio fingerprint
const getAudioFingerprint = (): string => {
  try {
    const AudioContext = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
    if (!AudioContext) return JSON.stringify({ audio: 'unsupported' });
    
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const analyser = audioCtx.createAnalyser();
    
    oscillator.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    return JSON.stringify({
      sampleRate: audioCtx.sampleRate,
      maxChannels: audioCtx.destination.maxChannelCount,
      state: audioCtx.state,
    });
  } catch {
    return JSON.stringify({ audio: 'error' });
  }
};

// Get storage capabilities fingerprint
const getStorageFingerprint = (): string => {
  return JSON.stringify({
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    openDatabase: (globalThis as any).openDatabase !== undefined,
  });
};

// Get plugin information
const getPluginsFingerprint = (): string => {
  try {
    const plugins = navigator.plugins;
    const pluginList: string[] = [];
    
    if (plugins && plugins.length) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < plugins.length; i++) {
        const pluginName = plugins[i].name;
        if (pluginName) {
          pluginList.push(pluginName);
        }
      }
    }
    
    return JSON.stringify(pluginList);
  } catch {
    return JSON.stringify([]);
  }
};

// Get WebRTC fingerprint (IP leak detection)
const getWebRTCFingerprint = (): string => {
  try {
    const RTCPeerConnection = (globalThis as any).RTCPeerConnection || (globalThis as any).webkitRTCPeerConnection;
    if (!RTCPeerConnection) return JSON.stringify({ webrtc: 'unsupported' });
    
    return JSON.stringify({ webrtc: 'supported' });
  } catch {
    return JSON.stringify({ webrtc: 'error' });
  }
};

// Improved hash function
const hashString = (str: string): string => {
  let hash = 0;
  
  if (str.length === 0) return '0';
  
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < str.length; i++) {
    const codePoint = str.codePointAt(i) ?? 0;
    hash = ((hash << 5) - hash) + codePoint;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to readable hex string
  return Math.abs(hash).toString(16).substring(0, 16);
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
  return !session.usedTokens.includes(nonce);
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

// Store device fingerprint metadata for anti-tampering detection
export const storeDeviceFingerprint = (fingerprint: string): void => {
  try {
    const metadata = {
      fingerprint,
      timestamp: Date.now(),
      url: globalThis.location?.href,
      userAgent: navigator.userAgent,
      version: 2, // Version 2 of fingerprinting algorithm
    };
    
    localStorage.setItem('_fp_meta', JSON.stringify(metadata));
  } catch (e) {
    console.warn('Failed to store fingerprint metadata:', e);
  }
};

// Retrieve stored fingerprint for comparison
export const getStoredFingerprint = (): { fingerprint: string; timestamp: number; version: number } | null => {
  try {
    const data = localStorage.getItem('_fp_meta');
    if (!data) return null;
    
    const metadata = JSON.parse(data);
    return {
      fingerprint: metadata.fingerprint,
      timestamp: metadata.timestamp,
      version: metadata.version || 1,
    };
  } catch (e) {
    console.warn('Failed to retrieve fingerprint metadata:', e);
    return null;
  }
};

// Detect anomalies in device fingerprint (potential spoofing)
export const detectFingerprintAnomaly = (
  newFingerprint: string,
  previousFingerprint: string,
  timeDiffMinutes: number
): { isAnomaly: boolean; severity: 'low' | 'medium' | 'high' } => {
  // If fingerprint completely changed in short time, it's suspicious
  if (newFingerprint !== previousFingerprint && timeDiffMinutes < 5) {
    return { isAnomaly: true, severity: 'high' };
  }
  
  // If fingerprint changed but within reasonable time
  if (newFingerprint !== previousFingerprint && timeDiffMinutes < 30) {
    return { isAnomaly: true, severity: 'medium' };
  }
  
  // Same fingerprint is normal
  return { isAnomaly: false, severity: 'low' };
};

// Calculate fingerprint entropy (randomness score)
export const calculateFingerprintEntropy = (): number => {
  const components = {
    screen: getScreenFingerprint(),
    browser: getBrowserFingerprint(),
    hardware: getHardwareFingerprint(),
    graphics: getGraphicsFingerprint(),
    canvas: getCanvasFingerprint(),
    fonts: getFontsFingerprint(),
    audio: getAudioFingerprint(),
    storage: getStorageFingerprint(),
    plugins: getPluginsFingerprint(),
    webrtc: getWebRTCFingerprint(),
  };
  
  let entropy = 0;
  let componentCount = 0;
  
  for (const component of Object.values(components)) {
    if (typeof component === 'string' && component.length > 0) {
      // Calculate entropy based on character diversity
      const charSet = new Set(component);
      const componentEntropy = (charSet.size / component.length) * 100;
      entropy += componentEntropy;
      componentCount++;
    }
  }
  
  return componentCount > 0 ? Math.round(entropy / componentCount) : 0;
};

// Get fingerprint version (useful for algorithm upgrades)
export const getFingerprintVersion = (): number => {
  return 2; // Current version with enhanced multi-component fingerprinting
};

// Generate fingerprint report (for debugging/admin)
export const generateFingerprintReport = (): Record<string, any> => {
  return {
    version: getFingerprintVersion(),
    entropy: calculateFingerprintEntropy(),
    timestamp: new Date().toISOString(),
    components: {
      screen: getScreenFingerprint(),
      browser: getBrowserFingerprint(),
      hardware: getHardwareFingerprint(),
      graphics: getGraphicsFingerprint(),
      canvas: getCanvasFingerprint(),
      fonts: getFontsFingerprint(),
      audio: getAudioFingerprint(),
      storage: getStorageFingerprint(),
      plugins: getPluginsFingerprint(),
      webrtc: getWebRTCFingerprint(),
    },
  };
};
