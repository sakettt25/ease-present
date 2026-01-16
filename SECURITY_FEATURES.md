# QR-Based Attendance Management System - Security Features

## Overview
This is a comprehensive QR-based attendance management system with advanced anti-proxy and fraud prevention measures for educational institutions.

## 🔒 Security Features Implemented

### 1. **Location Verification** ✅
- **Functionality**: Students must be within a 50-meter radius of the faculty's location to mark attendance
- **Implementation**:
  - Faculty device captures GPS location when generating QR code
  - Student device location is captured during verification
  - Haversine formula calculates distance between two coordinates
  - Attendance rejected if student is outside 50m radius
- **Files Modified**: 
  - `src/lib/qr-utils.ts` - `calculateDistance()` function
  - `src/components/student/VerificationForm.tsx` - Location check logic

### 2. **Device-Based Restriction** ✅
- **Functionality**: Each device can submit attendance only once per session, with 50-minute lockout between sessions
- **Implementation**:
  - Comprehensive device fingerprinting using:
    - Screen resolution and color depth
    - Timezone and language settings
    - Platform and user agent
    - Hardware concurrency and device memory
    - Max touch points
    - Canvas fingerprint for uniqueness
  - Device tracking in session manager
  - 50-minute cooldown period after submission
- **Files Created/Modified**:
  - `src/lib/session-manager.ts` - Session and device tracking
  - `src/lib/qr-utils.ts` - Enhanced `generateDeviceFingerprint()` function
  - `src/components/student/VerificationForm.tsx` - Device validation

### 3. **IP Address Tracking** ✅
- **Functionality**: Student's IP address is captured and recorded with attendance
- **Implementation**:
  - Uses external API (ipify.org) to fetch public IP address
  - IP address stored with attendance record
  - Displayed in faculty dashboard (detailed view)
  - Exported in CSV reports
- **Files Modified**:
  - `src/lib/qr-utils.ts` - `getClientIPAddress()` function
  - `src/components/student/VerificationForm.tsx` - IP capture logic
  - `src/components/faculty/AttendanceTable.tsx` - IP display

### 4. **QR Code Expiry & One-Time Token (Nonce)** ✅
- **Functionality**: Each QR code contains a cryptographically secure nonce that can only be used once
- **Implementation**:
  - **One-Time Token**: Uses `crypto.getRandomValues()` to generate 16-byte secure random nonce
  - **30-Second Expiry**: QR codes auto-refresh every 30 seconds
  - **Token Tracking**: Session manager tracks used nonces to prevent reuse
  - **Live Session Validation**: QR codes only valid while faculty session is active
- **Files Created/Modified**:
  - `src/lib/qr-utils.ts` - `generateNonce()` and `validateNonce()` functions
  - `src/lib/session-manager.ts` - Nonce tracking in sessions
  - `src/components/faculty/QRCodeDisplay.tsx` - Auto-refresh with new nonce every 30 seconds

### 5. **Live Session Management** ✅
- **Functionality**: Faculty can start, pause, and end attendance sessions; QR codes only work during active sessions
- **Implementation**:
  - Session creation with unique session ID
  - Active/inactive status tracking
  - Session cleanup when component unmounts or paused
  - Validation checks ensure QR codes from inactive sessions are rejected
- **Files Created**:
  - `src/lib/session-manager.ts` - Complete session lifecycle management

### 6. **Comprehensive Attendance Reporting** ✅
- **Functionality**: CSV export includes all security-related data
- **CSV Fields**:
  - Roll Number
  - Name
  - Status (Present/Absent)
  - Timestamp
  - Device ID (fingerprint)
  - IP Address
  - Location (lat, lng)
- **Files Modified**:
  - `src/lib/qr-utils.ts` - Enhanced `generateCSV()` function
  - `src/components/faculty/AttendanceTable.tsx` - Display additional fields

## 🎯 System Workflow

### Faculty Side:
1. Faculty selects a class and starts session
2. System captures faculty's GPS location
3. QR code is generated with:
   - Unique session ID
   - One-time nonce (cryptographically secure)
   - Expiration timestamp (30 seconds)
   - Location data
4. QR code auto-refreshes every 30 seconds with new nonce
5. Faculty can pause/resume session
6. Download attendance CSV with full security details

### Student Side:
1. Student scans QR code with mobile device
2. System performs multi-step verification:
   - **Step 1**: Generate device fingerprint
   - **Step 2**: Check device restrictions (not used in this session, 50-min cooldown)
   - **Step 3**: Fetch IP address
   - **Step 4**: Validate one-time nonce (not already used)
   - **Step 5**: Request location access
   - **Step 6**: Verify location within 50m radius
   - **Step 7**: Verify student details against official records
   - **Step 8**: Validate with session manager
3. Student enters roll number and name
4. Attendance is marked with all security data recorded

## 📂 File Structure

### New Files:
- `src/lib/session-manager.ts` - Session and device management

### Modified Files:
- `src/lib/qr-utils.ts` - Enhanced security utilities
- `src/components/faculty/QRCodeDisplay.tsx` - Live session integration
- `src/components/faculty/AttendanceTable.tsx` - Enhanced reporting
- `src/components/student/VerificationForm.tsx` - Multi-factor verification
- `src/pages/FacultyDashboard.tsx` - Session management integration

## 🛡️ Anti-Proxy Measures Summary

| Feature | Description | Status |
|---------|-------------|--------|
| Location Verification | 50m radius check | ✅ Implemented |
| Device Fingerprinting | Unique device identifier | ✅ Implemented |
| Device Lockout | 50-minute cooldown period | ✅ Implemented |
| IP Address Tracking | Record student IP | ✅ Implemented |
| One-Time Nonce | Cryptographically secure token | ✅ Implemented |
| QR Expiry | 30-second validity | ✅ Implemented |
| Live Session | Active session validation | ✅ Implemented |

## 🔧 Technical Details

### Device Fingerprinting Components:
- Screen dimensions (width × height × color depth)
- Timezone
- Language and language list
- Platform
- User agent
- Hardware concurrency (CPU cores)
- Device memory
- Max touch points
- Canvas fingerprint (renders text and extracts image signature)

### Session Management:
- In-memory session store (can be replaced with backend storage)
- Session cleanup mechanism for old sessions
- Device submission tracking per session
- Nonce validation and tracking

### Location Tracking:
- Uses Haversine formula for accurate distance calculation
- High accuracy GPS requests
- Location stored with attendance for audit trail

## 🚀 Running the Application

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun build
```

## 📊 CSV Export Format

```csv
"Roll Number","Name","Status","Timestamp","Device ID","IP Address","Location"
"2305501","Aanya Sharma","Present","Jan 16, 2026, 02:30:15 PM","fp_abc123_xyz","192.168.1.100","12.971600, 77.594600"
```

## 🔐 Security Notes

1. **Cryptographic Nonce**: Uses `crypto.getRandomValues()` for secure random generation
2. **Device Fingerprint**: Multi-factor combination creates unique identifier
3. **Location Accuracy**: Uses high-accuracy GPS with 10-second timeout
4. **Session Isolation**: Each class session is completely isolated
5. **Audit Trail**: All security data recorded for forensic analysis

## 🎓 Educational Institution Benefits

- Prevents proxy attendance
- Ensures physical presence verification
- Provides comprehensive audit trail
- Detects duplicate device usage
- Enforces location-based restrictions
- Automatic reporting with security details

## 📝 Future Enhancements

- Backend API integration for persistent storage
- Face recognition for additional verification
- Real-time attendance monitoring dashboard
- SMS/Email notifications
- Advanced analytics and reporting
- Multi-factor authentication options

---

**Built with React, TypeScript, Tailwind CSS, and shadcn/ui components**
