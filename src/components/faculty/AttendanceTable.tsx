import { CheckCircle, XCircle, Download, Clock, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCSV, downloadCSV, formatTimestamp } from "@/lib/qr-utils";
import { useState } from "react";

interface AttendanceRecord {
  rollNumber: string;
  name: string;
  status: "Present" | "Absent";
  timestamp?: number;
  deviceId?: string;
  ipAddress?: string;
  location?: { lat: number; lng: number };
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  className: string;
  section: string;
}

export const AttendanceTable = ({ records, className, section }: AttendanceTableProps) => {
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const [showDetails, setShowDetails] = useState(false);

  const handleExportCSV = () => {
    const csvContent = generateCSV(records);
    const filename = `attendance_${className.replace(/\s+/g, '_')}_${section}_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Attendance Records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {className} - Section {section}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">{presentCount}</span>
                <span className="text-muted-foreground">Present</span>
              </span>
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="font-medium text-foreground">{absentCount}</span>
                <span className="text-muted-foreground">Absent</span>
              </span>
            </div>
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="outline" 
              size="sm"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button onClick={handleExportCSV} variant="accent" size="sm">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Roll Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              {showDetails && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    IP Address
                  </th>
                </>
              )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.rollNumber} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm text-foreground">{record.rollNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{record.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      record.status === "Present"
                        ? "bg-accent/10 text-accent"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {record.status === "Present" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.timestamp ? (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(record.timestamp)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                {showDetails && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.deviceId ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Smartphone className="w-3 h-3" />
                          {record.deviceId}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.ipAddress ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Globe className="w-3 h-3" />
                          {record.ipAddress}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No attendance records yet</p>
        </div>
      )}
    </div>
  );
};
