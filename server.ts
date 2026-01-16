import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface SessionData {
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

interface DeviceSubmission {
  sessionId: string;
  timestamp: number;
  rollNumber: string;
}

// In-memory storage
const activeSessions = new Map<string, SessionData>();
const deviceSubmissions = new Map<string, DeviceSubmission>();

// REST API Endpoints

/**
 * Create a new attendance session
 */
app.post('/api/sessions', (req, res) => {
  const { sessionId, facultyId, classId, section, location } = req.body;

  if (!sessionId || !facultyId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sessionData: SessionData = {
    sessionId,
    facultyId,
    classId,
    section,
    isActive: true,
    startTime: Date.now(),
    location: location || null,
    usedTokens: [],
    attendedDevices: [],
  };

  activeSessions.set(sessionId, sessionData);
  console.log(`[API] Created session: ${sessionId}`);

  // Broadcast session created event to all connected clients
  io.emit('session:created', sessionData);

  res.json(sessionData);
});

/**
 * Get a session
 */
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});

/**
 * Get devices for a session
 */
app.get('/api/sessions/:sessionId/devices', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    sessionId,
    devices: session.attendedDevices,
    totalDevices: session.attendedDevices.length,
  });
});

/**
 * Record attendance submission
 */
app.post('/api/submissions', (req, res) => {
  const {
    deviceFingerprint,
    sessionId,
    rollNumber,
    ipAddress,
    location,
    nonce,
  } = req.body;

  if (!deviceFingerprint || !sessionId || !rollNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get the session
  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.isActive) {
    return res.status(400).json({ error: 'Session is not active' });
  }

  // Check if nonce was already used
  if (nonce && session.usedTokens.includes(nonce)) {
    return res.status(400).json({ error: 'QR code already used' });
  }

  // Check if device already submitted
  const alreadySubmitted = session.attendedDevices.find(
    (d) => d.fingerprint === deviceFingerprint
  );
  if (alreadySubmitted) {
    return res.status(400).json({ error: 'Device already marked present' });
  }

  // Mark nonce as used
  if (nonce) {
    session.usedTokens.push(nonce);
  }

  // Record the submission
  const submission: DeviceSubmission = {
    sessionId,
    timestamp: Date.now(),
    rollNumber,
  };
  deviceSubmissions.set(deviceFingerprint, submission);

  // Add device to session
  session.attendedDevices.push({
    fingerprint: deviceFingerprint,
    timestamp: Date.now(),
    rollNumber,
    ipAddress,
    location,
  });

  console.log(
    `[API] Submission recorded for session ${sessionId}, roll ${rollNumber}, total devices: ${session.attendedDevices.length}`
  );

  // Broadcast attendance update to all connected clients
  io.emit('attendance:updated', {
    sessionId,
    deviceCount: session.attendedDevices.length,
    newDevice: {
      rollNumber,
      fingerprint: deviceFingerprint,
      timestamp: Date.now(),
    },
  });

  res.json({
    success: true,
    message: 'Attendance recorded',
    deviceCount: session.attendedDevices.length,
  });
});

/**
 * Validate nonce
 */
app.post('/api/nonce/validate', (req, res) => {
  const { sessionId, nonce } = req.body;

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const isUsed = session.usedTokens.includes(nonce);
  res.json({ isUsed, valid: !isUsed });
});

/**
 * End a session
 */
app.post('/api/sessions/:sessionId/end', (req, res) => {
  const { sessionId } = req.params;
  const session = activeSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.isActive = false;
  console.log(`[API] Ended session: ${sessionId}`);

  io.emit('session:ended', { sessionId });

  res.json({ success: true, message: 'Session ended' });
});

// WebSocket Events

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  /**
   * Subscribe to session updates
   */
  socket.on('subscribe:session', (sessionId: string) => {
    socket.join(`session:${sessionId}`);
    const session = activeSessions.get(sessionId);
    if (session) {
      socket.emit('session:data', session);
    }
    console.log(`[WebSocket] ${socket.id} subscribed to session ${sessionId}`);
  });

  /**
   * Unsubscribe from session
   */
  socket.on('unsubscribe:session', (sessionId: string) => {
    socket.leave(`session:${sessionId}`);
    console.log(`[WebSocket] ${socket.id} unsubscribed from session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Override broadcast methods to only send to subscribers
const originalEmit = io.emit.bind(io);
io.emit = function (event: string, ...args: any[]) {
  if (event.startsWith('session:') || event === 'attendance:updated') {
    // For these events, broadcast to all for now
    // In production, you'd route to specific session rooms
    return originalEmit(event, ...args);
  }
  return originalEmit(event, ...args);
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: activeSessions.size,
    timestamp: Date.now(),
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n✅ Attendance Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server active`);
  console.log(`\nEndpoints:`);
  console.log(`  POST   /api/sessions                 - Create session`);
  console.log(`  GET    /api/sessions/:sessionId      - Get session`);
  console.log(`  POST   /api/submissions              - Record attendance`);
  console.log(`  POST   /api/nonce/validate           - Validate nonce`);
  console.log(`  POST   /api/sessions/:sessionId/end  - End session`);
  console.log(`  GET    /api/sessions/:sessionId/devices - Get devices\n`);
});
