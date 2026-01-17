import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeDisplay } from "@/components/faculty/QRCodeDisplay";
import { AttendanceTable } from "@/components/faculty/AttendanceTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, MapPin, Loader2, Lock } from "lucide-react";
import { mockClasses, getStudentsBySection } from "@/lib/mock-data";
import { getSessionDevices } from "@/lib/session-manager";

interface AttendanceRecord {
  rollNumber: string;
  name: string;
  status: "Present" | "Absent";
  timestamp?: number;
  deviceId?: string;
  ipAddress?: string;
  location?: { lat: number; lng: number };
}

const FACULTY_PIN = "257";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [selectedClass, setSelectedClass] = useState<typeof mockClasses[0] | null>(null);
  const [facultyLocation, setFacultyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get faculty location
  const getFacultyLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      setFacultyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (err) {
      console.error("Failed to get location:", err);
      alert("Location access is required. Please enable location services.");
    }
    setLocationLoading(false);
  };

  // Initialize attendance records when class is selected
  useEffect(() => {
    if (selectedClass) {
      const students = getStudentsBySection(selectedClass.section);
      const records: AttendanceRecord[] = students.map((s) => ({
        rollNumber: s.rollNumber,
        name: s.name,
        status: "Absent" as const,
      }));
      setAttendanceRecords(records);
    }
  }, [selectedClass]);

  // Handle real attendance updates from student submissions
  const addAttendanceRecord = (rollNumber: string, name: string, deviceId: string, ipAddress: string, location?: { lat: number; lng: number }) => {
    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.rollNumber === rollNumber && r.status === "Absent"
          ? {
              ...r,
              status: "Present" as const,
              timestamp: Date.now(),
              deviceId,
              ipAddress,
              location,
            }
          : r
      )
    );
  };

  // Poll for attendance updates from session manager
  const pollAttendanceUpdates = async () => {
    if (!sessionId) {
      console.log('No sessionId yet');
      return;
    }

    const devices = await getSessionDevices(sessionId);
    console.log('Polling session:', sessionId, 'Devices found:', devices.length, devices);
    
    if (devices.length === 0) return;

    setAttendanceRecords((prev) => {
      const updated = [...prev];
      devices.forEach((device) => {
        const index = updated.findIndex((r) => r.rollNumber === device.rollNumber && r.status === "Absent");
        console.log(`Looking for ${device.rollNumber}, found at index ${index}`);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            status: "Present" as const,
            timestamp: device.timestamp,
            deviceId: device.deviceFingerprint,
            ipAddress: device.ipAddress,
            location: device.location,
          };
          console.log(`Updated ${device.rollNumber} to Present`);
        }
      });
      return updated;
    });
  };

  // Set up polling when session ID changes
  useEffect(() => {
    if (!sessionId) return;

    // Poll immediately
    pollAttendanceUpdates();

    // Set up interval polling every 2 seconds
    pollIntervalRef.current = setInterval(() => {
      pollAttendanceUpdates();
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId]);

  // Handle PIN submission
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === FACULTY_PIN) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  // Show PIN entry screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Faculty Access
            </h1>
            <p className="text-muted-foreground">
              Enter your PIN to continue
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError("");
                  }}
                  placeholder="Enter PIN"
                  className="h-14 text-center text-2xl tracking-widest"
                  maxLength={3}
                  autoFocus
                />
                {pinError && (
                  <p className="text-sm text-destructive mt-2 text-center">
                    {pinError}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                Access Dashboard
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">Faculty Dashboard</h1>
              <p className="text-sm text-muted-foreground">Select a class to start attendance</p>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  getFacultyLocation();
                }}
                className="p-6 bg-card rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{cls.name}</h3>
                <p className="text-sm text-muted-foreground">Section {cls.section}</p>
                <p className="text-xs text-muted-foreground mt-2">{cls.time}</p>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedClass(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">{selectedClass.name}</h1>
              <p className="text-sm text-muted-foreground">Section {selectedClass.section} • {selectedClass.time}</p>
            </div>
          </div>
          {locationLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Getting location...
            </div>
          ) : facultyLocation ? (
            <div className="flex items-center gap-2 text-sm text-accent">
              <MapPin className="w-4 h-4" />
              Location Active
            </div>
          ) : null}
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="flex justify-center lg:sticky lg:top-24 lg:self-start">
            <QRCodeDisplay
              classId={selectedClass.id}
              className={selectedClass.name}
              section={selectedClass.section}
              facultyLocation={facultyLocation}
              attendanceCount={presentCount}
              totalStudents={attendanceRecords.length}
              onSessionCreated={setSessionId}
            />
          </div>

          {/* Attendance Table */}
          <div>
            <AttendanceTable
              records={attendanceRecords}
              className={selectedClass.name}
              section={selectedClass.section}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
