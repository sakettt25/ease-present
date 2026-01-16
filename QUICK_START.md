# QR Attendance System - Quick Start Guide

## 🚀 Getting Started

### Installation
```bash
cd class-check-in-main
bun install
bun dev
```

### Access Points
- **Home**: http://localhost:5173/
- **Faculty Dashboard**: http://localhost:5173/faculty
- **Student Scan**: http://localhost:5173/scan

## 👨‍🏫 Faculty Guide

### Starting an Attendance Session

1. Navigate to Faculty Dashboard (`/faculty`)
2. Select your class (e.g., CSE-31 Class)
3. Grant location access when prompted
4. System automatically generates QR code

### QR Code Features
- **Auto-refresh**: New QR code every 30 seconds
- **Security Token**: Each QR has a unique one-time nonce
- **Session Status**: Shows active/paused state
- **Attendance Count**: Real-time present/absent count
- **Location Display**: Shows your GPS coordinates

### Session Controls
- **Refresh Now**: Manually generate new QR code
- **Pause Session**: Temporarily stop accepting attendance
- **Resume Session**: Reactivate attendance collection

### Viewing Attendance
- Basic view: Roll number, name, status, timestamp
- Detailed view: Click "Show Details" to see device ID and IP address
- Export: Click "Export CSV" for complete report

### CSV Report Contents
- Roll Number
- Full Name
- Status (Present/Absent)
- Timestamp
- Device ID (fingerprint)
- IP Address
- GPS Location (latitude, longitude)

## 👨‍🎓 Student Guide

### Marking Attendance

1. Open the QR scanner (`/scan` or scan faculty's QR)
2. Scan the displayed QR code
3. Grant location access when prompted
4. Enter your roll number (e.g., 2305501)
5. Enter your full name exactly as registered
6. Click "Submit Attendance"

### Verification Process
You'll see these security checks in real-time:
1. ✓ Device Fingerprint generated
2. ✓ IP Address captured
3. ✓ One-time token validated
4. ✓ Location verified (must be within 50m)
5. ✓ Student details verified

### Common Issues & Solutions

#### "You are Xm away. Must be within 50m"
- You're too far from the classroom
- Move closer to the faculty
- Ensure GPS is enabled with high accuracy

#### "This QR code has already been used"
- QR code has been scanned once already
- Wait for the QR to refresh (30 seconds)
- Scan the new QR code

#### "Device is locked. Please wait X minutes"
- Your device was used recently in another session
- Wait for the cooldown period (50 minutes)
- Cannot bypass this security measure

#### "Location access is required"
- Enable location services on your device
- Grant location permission to the browser
- Refresh and try again

#### "Student details do not match"
- Check your roll number spelling
- Check your name spelling (must match exactly)
- Names are case-insensitive but spelling must be exact

## 🔒 Security Features Explained

### 1. Location Verification
- Faculty's location is embedded in QR code
- Student must be within 50 meters
- Uses GPS with high accuracy mode
- Prevents remote attendance marking

### 2. Device Restrictions
- Each device gets unique fingerprint
- One attendance per session per device
- 50-minute cooldown between sessions
- Prevents sharing devices

### 3. IP Address Tracking
- Student's public IP is recorded
- Helps identify suspicious patterns
- Included in audit reports
- Cannot be spoofed easily

### 4. One-Time QR Codes
- Each QR contains cryptographically secure nonce
- Token expires after 30 seconds
- Can only be used once
- Prevents QR code sharing/reuse

### 5. Live Session Management
- QR codes only work during active sessions
- Faculty can pause/resume anytime
- Session ends when faculty leaves
- Invalid sessions are rejected

## 📊 Faculty Dashboard Features

### Real-Time Updates
- Live attendance counter
- Automatic table updates
- Present/Absent ratio
- Timestamp for each submission

### Session Information Panel
- Session ID (unique identifier)
- Active/Paused status
- Security measures enabled
- Number of QR codes generated

### Location Panel
- Current GPS coordinates
- 50m radius indicator
- Active location tracking status

## 🎯 Use Cases

### Regular Class Attendance
1. Faculty arrives and selects class
2. Displays QR on screen/projector
3. Students scan as they enter
4. QR refreshes automatically
5. Export CSV at end of class

### Lab Sessions
1. Start session at lab location
2. Students scan from lab devices
3. Device tracking prevents proxy
4. Location ensures physical presence
5. Download detailed report with device IDs

### Exam/Test Attendance
1. Pause session between test sections
2. Resume when ready
3. Track exact timestamps
4. Verify no duplicate devices
5. Export for official records

## 🛠️ Troubleshooting

### QR Code Not Displaying
- Check location permission granted
- Refresh the page
- Ensure JavaScript is enabled
- Check browser console for errors

### Students Can't Scan
- Verify session is Active (not Paused)
- Check QR code is not expired
- Ensure proper lighting for camera
- Use "Simulate Scan" for demo/testing

### Location Not Working
- Enable location services in device settings
- Grant browser location permission
- Use HTTPS (required for geolocation)
- Check GPS signal strength

### CSV Export Issues
- Ensure pop-ups are not blocked
- Check download folder permissions
- Try different browser
- File saves as: `attendance_ClassName_Section_Date.csv`

## 📱 Browser Compatibility

### Recommended Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS/macOS)
- ✅ Samsung Internet

### Required Browser Features
- Geolocation API support
- Local Storage
- JavaScript enabled
- Camera access (for QR scanning)

## 🔐 Privacy & Data Protection

### Data Collected
- Roll number and name (student provided)
- GPS coordinates (both faculty and student)
- Device fingerprint (hardware info)
- IP address (public IP only)
- Timestamp (when attendance marked)

### Data Usage
- Attendance tracking and reporting
- Fraud detection and prevention
- Audit trail for disputes
- Statistical analysis

### Data Security
- In-memory storage (demo)
- No sensitive data transmitted
- Session-based isolation
- Automatic cleanup of old sessions

## 📞 Support

For technical issues or questions:
- Check this guide first
- Review SECURITY_FEATURES.md for technical details
- Contact IT support
- Report bugs to system administrator

---

**Version**: 2.0
**Last Updated**: January 16, 2026
**System Status**: ✅ All security features active
