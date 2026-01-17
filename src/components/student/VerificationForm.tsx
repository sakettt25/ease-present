import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, MapPin, Smartphone, AlertTriangle, Shield } from "lucide-react";
import { verifyStudent } from "@/lib/mock-data";
import { 
  calculateDistance, 
  generateDeviceFingerprint, 
  getClientIPAddress, 
  validateNonce,
  storeDeviceFingerprint,
  getStoredFingerprint,
  detectFingerprintAnomaly,
  calculateFingerprintEntropy,
} from "@/lib/qr-utils";
import { recordDeviceSubmission, canDeviceSubmit } from "@/lib/session-manager";

interface VerificationFormProps {
  qrData: {
    sessionId?: string;
    nonce?: string;
    location?: { lat: number; lng: number };
    section?: string;
  };
  onSuccess: (studentData: { rollNumber: string; name: string }) => void;
}

type VerificationStep = "form" | "checking" | "verifying" | "success" | "error";

// Helper function to get entropy color
const getEntropyColor = (entropy: number): string => {
  if (entropy > 75) return 'bg-green-400';
  if (entropy > 50) return 'bg-blue-400';
  return 'bg-yellow-400';
};

export const VerificationForm = ({ qrData, onSuccess }: VerificationFormProps) => {
  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<VerificationStep>("form");
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied" | "checking">("pending");
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [fingerprintEntropy, setFingerprintEntropy] = useState(0);
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<{
    device: boolean;
    ip: boolean;
    location: boolean;
    nonce: boolean;
    student: boolean;
  }>({
    device: false,
    ip: false,
    location: false,
    nonce: false,
    student: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAnomalyDetected(false);

    console.log('QR Data received:', qrData);

    if (!rollNumber.trim() || !name.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setStep("checking");

    try {
      // Step 1: Generate enhanced device fingerprint
      const fingerprint = generateDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
      
      // Calculate entropy score for this device
      const entropy = calculateFingerprintEntropy();
      setFingerprintEntropy(entropy);
      
      // Check for anomalies (potential spoofing)
      const storedFP = getStoredFingerprint();
      if (storedFP) {
        const timeDiff = (Date.now() - storedFP.timestamp) / (1000 * 60); // minutes
        const anomaly = detectFingerprintAnomaly(fingerprint, storedFP.fingerprint, timeDiff);
        
        if (anomaly.isAnomaly && anomaly.severity === 'high') {
          setAnomalyDetected(true);
          setError("Device fingerprint anomaly detected. Please try again.");
          setStep("error");
          return;
        }
      }
      
      // Store the new fingerprint metadata
      storeDeviceFingerprint(fingerprint);
      setVerificationProgress(prev => ({ ...prev, device: true }));

      // Check device restrictions first
      if (qrData.sessionId) {
        const deviceCheck = await canDeviceSubmit(fingerprint, qrData.sessionId);
        if (!deviceCheck.allowed) {
          setError(deviceCheck.reason || "Device is not allowed to submit.");
          setStep("error");
          return;
        }
      }

      // Step 2: Get IP address
      const ip = await getClientIPAddress();
      setIpAddress(ip);
      setVerificationProgress(prev => ({ ...prev, ip: true }));

      // Step 4: Check location
      setLocationStatus("checking");
      
      let studentLocation: { latitude: number; longitude: number } | null = null;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        studentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        setLocationStatus("granted");
        setVerificationProgress(prev => ({ ...prev, location: true }));

        // Validate location distance (50m radius) - only if faculty location is available
        if (qrData.location && studentLocation) {
          const distance = calculateDistance(
            studentLocation.latitude,
            studentLocation.longitude,
            qrData.location.lat,
            qrData.location.lng
          );

          console.log(`Distance from class: ${distance}m (Faculty: ${qrData.location.lat}, ${qrData.location.lng})`);

          if (distance > 50) {
            setError(`You are ${Math.round(distance)}m away from the class. Must be within 50m to mark attendance.`);
            setStep("error");
            return;
          }
        }
      } catch (locationError: any) {
        console.warn('Location error:', locationError);
        // Allow submission even without location, but warn user
        if (locationError.code === 1) {
          // User denied permission
          setError("Location permission is required to mark attendance.");
          setStep("error");
          return;
        }
        // For other errors (timeout, etc), continue with null location
        setLocationStatus("granted");
        setVerificationProgress(prev => ({ ...prev, location: true }));
      }

      setStep("verifying");

      // Step 5: Verify student details
      const { valid, student } = verifyStudent(rollNumber, name, qrData.section);

      if (!valid) {
        setError("Student details do not match the official records. Please check your roll number and name.");
        setStep("error");
        return;
      }

      setVerificationProgress(prev => ({ ...prev, student: true }));

      // Mark nonce as used (only after all checks pass, right before success)
      console.log('Before nonce check, qrData:', qrData);
      if (qrData.sessionId && qrData.nonce) {
        await validateNonce(qrData.sessionId, qrData.nonce);
        setVerificationProgress(prev => ({ ...prev, nonce: true }));
      }

      // Record the device submission with all details
      console.log('Before recording submission, qrData.sessionId:', qrData.sessionId);
      if (qrData.sessionId) {
        console.log('Recording device submission for session:', qrData.sessionId, 'roll:', student!.rollNumber);
        await recordDeviceSubmission(
          fingerprint,
          qrData.sessionId,
          student!.rollNumber,
          ip,
          studentLocation ? {
            lat: studentLocation.latitude,
            lng: studentLocation.longitude,
          } : undefined,
          qrData.nonce // Pass the nonce to backend
        );
      }

      // Success!
      setStep("success");
      setTimeout(() => {
        onSuccess({ rollNumber: student!.rollNumber, name: student!.name });
      }, 2000);

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || "An error occurred during verification. Please try again.");
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6 animate-scale-in">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Attendance Marked!</h3>
        <p className="text-muted-foreground">You have been successfully marked as present.</p>
        <div className="mt-6 p-4 bg-secondary/50 rounded-xl inline-block">
          <p className="text-sm text-muted-foreground">Roll Number</p>
          <p className="font-mono font-medium text-foreground">{rollNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="rollNumber">Roll Number</Label>
          <Input
            id="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="e.g., CS2024001"
            className="h-12"
            disabled={step !== "form" && step !== "error"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="h-12"
            disabled={step !== "form" && step !== "error"}
          />
        </div>

        {/* Verification Status */}
        {(step === "checking" || step === "verifying") && (
          <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
            {/* Device Fingerprint */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationProgress.device ? "bg-accent/10" : "bg-secondary"}`}>
                {verificationProgress.device ? (
                  <Smartphone className="w-4 h-4 text-accent" />
                ) : (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Device Fingerprint</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {deviceFingerprint || "Generating..."}
                </p>
                {fingerprintEntropy > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getEntropyColor(fingerprintEntropy)}`}
                        style={{ width: `${fingerprintEntropy}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Entropy: {fingerprintEntropy}%</span>
                  </div>
                )}
                {anomalyDetected && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    Anomaly detected
                  </div>
                )}
              </div>
            </div>

            {/* IP Address */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationProgress.ip ? "bg-accent/10" : "bg-secondary"}`}>
                {verificationProgress.ip ? (
                  <Shield className="w-4 h-4 text-accent" />
                ) : (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">IP Address</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {ipAddress || "Fetching..."}
                </p>
              </div>
            </div>

            {/* Nonce Validation */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationProgress.nonce ? "bg-accent/10" : "bg-secondary"}`}>
                {verificationProgress.nonce ? (
                  <CheckCircle className="w-4 h-4 text-accent" />
                ) : (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">One-Time Token</p>
                <p className="text-xs text-muted-foreground">
                  {verificationProgress.nonce ? "Valid & unused" : "Validating..."}
                </p>
              </div>
            </div>

            {/* Location Verification */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationProgress.location ? "bg-accent/10" : "bg-secondary"}`}>
                {locationStatus === "checking" ? (
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                ) : verificationProgress.location ? (
                  <MapPin className="w-4 h-4 text-accent" />
                ) : (
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Location Verification</p>
                <p className="text-xs text-muted-foreground">
                  {locationStatus === "checking" ? "Checking your location..." : 
                   verificationProgress.location ? "Within 50m radius" : "Waiting..."}
                </p>
              </div>
            </div>

            {/* Student Verification */}
            {step === "verifying" && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${verificationProgress.student ? "bg-accent/10" : "bg-secondary"}`}>
                  {verificationProgress.student ? (
                    <CheckCircle className="w-4 h-4 text-accent" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Student Details</p>
                  <p className="text-xs text-muted-foreground">
                    {verificationProgress.student ? "Verified" : "Verifying..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-destructive/10 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Verification Failed</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          disabled={step === "checking" || step === "verifying"}
        >
          {step === "checking" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking Security...
            </>
          ) : step === "verifying" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying Details...
            </>
          ) : step === "error" ? (
            "Try Again"
          ) : (
            "Submit Attendance"
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>By submitting, you confirm you are physically present in class.</p>
          <p className="text-accent">
            🔒 Your location, device, and IP address will be recorded for security.
          </p>
        </div>
      </form>
    </div>
  );
};
