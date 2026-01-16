import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, Clock, MapPin, Users, Copy, Check } from "lucide-react";
import { generateQRData, generateSessionId } from "@/lib/qr-utils";
import { createSession, endSession, isSessionActive } from "@/lib/session-manager";

interface QRCodeDisplayProps {
  classId: string;
  className: string;
  section: string;
  facultyLocation: { lat: number; lng: number } | null;
  onSessionUpdate?: (sessionId: string) => void;
  onSessionCreated?: (sessionId: string) => void;
  attendanceCount: number;
  totalStudents: number;
}

export const QRCodeDisplay = ({
  classId,
  className,
  section,
  facultyLocation,
  onSessionUpdate,
  onSessionCreated,
  attendanceCount,
  totalStudents,
}: QRCodeDisplayProps) => {
  const [sessionId] = useState(() => {
    const id = generateSessionId();
    // Create session in session manager (async but not awaited here)
    createSession(id, "faculty_001", classId, section, facultyLocation).catch(err => {
      console.error('Failed to create session:', err);
    });
    return id;
  });

  // Notify parent of sessionId after initial render
  useEffect(() => {
    onSessionCreated?.(sessionId);
  }, [sessionId, onSessionCreated]);

  const [qrData, setQRData] = useState<string>(() => {
    return generateQRData(sessionId, "faculty_001", classId);
  });
  const [timeLeft, setTimeLeft] = useState(120);
  const [isActive, setIsActive] = useState(true);
  const [nonceCount, setNonceCount] = useState(0); // Track number of nonces generated
  const [copied, setCopied] = useState(false); // Track copy status

  const refreshQRCode = useCallback(() => {
    try {
      // Only generate new QR if session is still active
      if (!isSessionActive(sessionId)) {
        console.warn('Session is no longer active');
        return;
      }

      // Generate complete URL with QR data
      const qrDataValue = generateQRData(sessionId, "faculty_001", classId);
      setQRData(qrDataValue);
      setTimeLeft(120);
      setNonceCount(prev => prev + 1); // Increment nonce counter
      onSessionUpdate?.(sessionId);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }, [sessionId, classId, onSessionUpdate]);

  useEffect(() => {
    refreshQRCode();
  }, [refreshQRCode]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          refreshQRCode();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, refreshQRCode]);

  const toggleActive = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    
    // End session when paused
    if (!newActiveState) {
      endSession(sessionId);
    }
  };

  // Copy QR data to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Code Container */}
      <div className="relative bg-card p-8 rounded-3xl shadow-xl border border-border">
        <div className={`relative ${!isActive && 'opacity-50'}`}>
          {qrData ? (
            <QRCodeSVG
              value={qrData}
              size={280}
              level="H"
              className="rounded-2xl"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          ) : (
            <div className="w-[280px] h-[280px] bg-gray-200 rounded-2xl flex items-center justify-center text-muted-foreground">
              Generating QR Code...
            </div>
          )}
          
          {/* Scan line animation */}
          {isActive && (
            <div className="absolute inset-4 overflow-hidden rounded-xl pointer-events-none">
              <div className="absolute left-0 right-0 h-1 bg-accent/40 animate-scan-line" />
            </div>
          )}
        </div>

        {/* Timer ring */}
        <div className="absolute -top-3 -right-3 w-14 h-14 bg-card rounded-full shadow-lg border border-border flex items-center justify-center">
          <div className="text-center">
            <span className={`font-display font-bold text-lg ${timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}>
              {timeLeft}
            </span>
            <span className="text-[8px] text-muted-foreground block -mt-1">sec</span>
          </div>
        </div>

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-3xl">
            <span className="text-muted-foreground font-medium">Session Paused</span>
          </div>
        )}
      </div>

      {/* Class Info */}
      <div className="mt-6 text-center">
        <h3 className="font-display text-xl font-semibold text-foreground">{className}</h3>
        <p className="text-muted-foreground text-sm">Section {section}</p>
      </div>

      {/* QR Data Display for Testing */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-lg max-w-2xl text-center">
        <p className="text-xs text-muted-foreground mb-2">🧪 QR Data (Testing):</p>
        <div className="flex gap-2 items-center">
          <code className="text-xs font-mono text-foreground break-all bg-secondary/50 p-2 rounded flex-1">
            {qrData?.substring(0, 100)}
            {qrData && qrData.length > 100 ? "..." : ""}
          </code>
          <button
            onClick={copyToClipboard}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              copied
                ? 'bg-accent/20 text-accent'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Class Info */}
      <div className="mt-6 text-center">
        <h3 className="font-display text-xl font-semibold text-foreground">{className}</h3>
        <p className="text-muted-foreground text-sm">Section {section}</p>
      </div>

      {/* QR Data Display for Testing */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-lg max-w-2xl text-center">
        <p className="text-xs text-muted-foreground mb-2">🧪 QR Data (Testing):</p>
        <code className="text-xs font-mono text-foreground break-all bg-secondary/50 p-2 rounded block">
          {qrData?.substring(0, 100)}
          {qrData && qrData.length > 100 ? "..." : ""}
        </code>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-6">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-accent" />
          <span className="text-foreground font-medium">{attendanceCount}/{totalStudents}</span>
          <span className="text-muted-foreground">Present</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-warning" />
          <span className="text-muted-foreground">Auto-refresh ({nonceCount} codes)</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={refreshQRCode}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Now
        </button>
        <button
          onClick={toggleActive}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
              : 'bg-accent text-accent-foreground hover:bg-accent/90'
          }`}
        >
          {isActive ? 'Pause Session' : 'Resume Session'}
        </button>
      </div>

      {/* Location indicator */}
      {facultyLocation && (
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 text-accent" />
            <span>Location: {facultyLocation.lat.toFixed(4)}, {facultyLocation.lng.toFixed(4)}</span>
          </div>
          <div className="text-xs text-muted-foreground pl-5">
            50m radius enforcement active
          </div>
        </div>
      )}

      {/* Session Info */}
      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Session ID:</span>
            <span className="font-mono text-foreground">{sessionId.substring(0, 20)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-medium ${isActive ? 'text-accent' : 'text-warning'}`}>
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Security:</span>
            <span className="text-accent font-medium">One-time tokens, 50m radius, device tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
