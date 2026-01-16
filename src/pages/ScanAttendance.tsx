import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VerificationForm } from "@/components/student/VerificationForm";
import { ArrowLeft, ScanLine, Camera, AlertTriangle, CheckCircle } from "lucide-react";
import { parseQRData } from "@/lib/qr-utils";
import { getSession } from "@/lib/session-manager";

const ScanAttendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [qrData, setQRData] = useState<any>(null);
  const [scanStep, setScanStep] = useState<"scan" | "verify" | "complete">("scan");
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("");

  // Check for QR data in URL (simulating QR scan)
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      handleQRData(data);
    }
  }, [searchParams]);

  const handleQRData = async (data: string) => {
    try {
      // Parse QR data from actual scan or URL parameter
      let qrDetails: any;
      let location: any = null;
      let section: string = "";
      
      console.log('Raw QR data received:', data);
      
      // First try to decode as base64 (from URL parameter)
      try {
        const decoded = atob(data);
        const parsed = JSON.parse(decoded);
        console.log('Parsed from base64:', parsed);
        qrDetails = {
          ...parsed,
          nonce: parsed.nonce || parsed.token,
        };

        // Fetch session from backend to get location
        if (qrDetails.sessionId) {
          const session = await getSession(qrDetails.sessionId);
          if (session) {
            location = session.location;
            section = session.section || "";
            console.log('Fetched session location:', location);
          }
        }
      } catch {
        // Fallback to old format with pipe-separated values
        console.log('Base64 parse failed, trying pipe-separated format');
        const parts = data.split('|');
        console.log('Split parts:', parts);
        if (parts.length >= 3) {
          qrDetails = parseQRData(parts[0]);
          section = parts[1];
          const coords = parts[2].split(',');
          if (coords[0] !== 'NO_LOCATION' && coords[1]) {
            location = { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) };
          }
        } else {
          qrDetails = parseQRData(data);
        }
      }
      
      console.log('Parsed QR details:', qrDetails);
      
      if (!qrDetails) {
        setError("Invalid QR code. Please try again.");
        return;
      }

      // Check if QR has expired
      if (Date.now() > qrDetails.expiresAt) {
        setError("This QR code has expired. Please scan the latest code.");
        return;
      }

      setQRData({
        ...qrDetails,
        location,
        section,
      });
      
      console.log('Final QR data set to state:', {
        ...qrDetails,
        location,
        section,
      });
      
      setScanStep("verify");
      setError("");
    } catch (err) {
      console.error('QR parsing error:', err);
      setError("Failed to read QR code. Please try again.");
    }
  };

  const handleManualSubmit = () => {
    if (manualCode) {
      handleQRData(manualCode);
    }
  };

  const handleSuccess = (studentData: { rollNumber: string; name: string }) => {
    setScanStep("complete");
  };



  if (scanStep === "complete") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto bg-accent/10 rounded-full flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">All Done!</h2>
          <p className="text-muted-foreground mb-8">Your attendance has been recorded successfully.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-semibold text-foreground">
              {scanStep === "scan" ? "Scan Attendance" : "Verify Details"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {scanStep === "scan" ? "Point your camera at the QR code" : "Enter your details to confirm"}
            </p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {scanStep === "scan" ? (
          <div className="max-w-md mx-auto">
            {/* Camera/Scanner UI */}
            <div className="relative bg-primary/5 rounded-3xl aspect-square flex items-center justify-center overflow-hidden mb-8">
              <div className="absolute inset-8 border-2 border-dashed border-primary/30 rounded-2xl" />
              <div className="absolute inset-8 overflow-hidden rounded-2xl">
                <div className="absolute left-0 right-0 h-0.5 bg-accent/50 animate-scan-line" />
              </div>
              <div className="text-center z-10">
                <Camera className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Camera preview area</p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-destructive/10 rounded-xl flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Camera ready message */}
            <div className="p-4 bg-primary/5 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                Position the QR code within the frame to scan
              </p>
            </div>

            {/* Manual input option */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Having trouble scanning? Enter code manually:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code data"
                  className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm"
                />
                <Button onClick={handleManualSubmit} variant="outline">
                  Submit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <VerificationForm qrData={qrData} onSuccess={handleSuccess} />
        )}
      </main>
    </div>
  );
};

export default ScanAttendance;
