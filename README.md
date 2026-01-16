# QR-Based Attendance Management System

## 🎓 Overview

A comprehensive QR-based attendance management system for educational institutions with advanced anti-proxy and fraud prevention measures.

## ✨ Key Features

### 🔒 Security Features
- **Location Verification**: 50-meter radius enforcement using GPS
- **Device Fingerprinting**: Multi-factor device identification with 10+ data points
- **Device Restrictions**: 50-minute cooldown period between submissions
- **IP Address Tracking**: Public IP capture for audit trail
- **One-Time QR Codes**: Cryptographically secure nonce (cannot reuse)
- **QR Expiry**: Auto-refresh every 30 seconds
- **Live Session Validation**: Active session checking

### 👨‍🏫 Faculty Features
- Real-time QR code generation with auto-refresh
- Live attendance tracking dashboard
- Pause/resume session controls
- Detailed attendance reports (Device ID, IP, Location)
- CSV export with comprehensive security data
- Session statistics and monitoring

### 👨‍🎓 Student Features
- Simple QR code scanning
- Multi-step verification process with progress indicators
- Roll number and name verification
- Location-based attendance validation
- Real-time feedback on verification status

## 🚀 Quick Start

### Prerequisites
- Node.js & npm (or Bun) installed
- Modern web browser with:
  - Geolocation API support
  - JavaScript enabled
  - Camera access (for QR scanning)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd class-check-in-main

# Install dependencies (using Bun)
bun install

# Or using npm
npm install

# Start development server
bun dev
# Or: npm run dev
```

### Access Points
- **Home**: http://localhost:5173/
- **Faculty Dashboard**: http://localhost:5173/faculty
- **Student Scan**: http://localhost:5173/scan

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - User guides for faculty and students
- **[SECURITY_FEATURES.md](./SECURITY_FEATURES.md)** - Technical implementation details
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **qrcode.react** for QR generation
- **React Router** for navigation

## 📊 System Workflow

### Faculty Workflow
1. Select class and start session
2. System captures GPS location
3. QR code generated with security token
4. Display QR (auto-refreshes every 30s)
5. Monitor real-time attendance
6. Export CSV report with security data

### Student Workflow
1. Scan displayed QR code
2. Grant location access
3. Enter roll number and full name
4. System verifies:
   - Device fingerprint (not used before)
   - IP address (recorded)
   - One-time token (valid & unused)
   - Location (within 50m radius)
   - Student details (match records)
5. Attendance marked successfully

## 🔐 Security Layers

```
QR Expiry (30s) → Nonce Validation → Session Active → 
Device Check → Location (50m) → IP Tracking → Student Verify → ✅ Success
```

## 📝 CSV Export Fields

The system exports comprehensive attendance reports including:
- Roll Number
- Full Name  
- Status (Present/Absent)
- Timestamp
- Device ID (fingerprint)
- IP Address
- GPS Location (latitude, longitude)

## 🌐 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (iOS/macOS)
- ✅ Samsung Internet

## Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
