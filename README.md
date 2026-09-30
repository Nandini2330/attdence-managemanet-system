# SMARTATTEND
### AI-Powered Face Recognition & Dynamic QR Attendance Platform

SMARTATTEND is an institutional-grade, full-stack biometric and anti-proxy attendance management platform designed for modern universities and enterprise campuses. It features **3-second rotating Dynamic QR tokens**, **OpenCV biometric face recognition**, **Firestore real-time listeners**, and **role-based access control** across Student, Faculty, and Admin dashboards.

---

## 🚀 Key Architectural Innovations

### 1. 3-Second Rotating Dynamic QR (Anti-Proxy Engine)
- The faculty dashboard broadcasts a presentation-mode QR code that **cryptographically rotates every 3 seconds** (`00:03` → `00:02` → `00:01`).
- Contains a short-lived HMAC token referencing `sessionId`, `timestamp`, and `expiresAt`.
- Student QR scanner validates token freshness, active session status, student class enrollment, and prevents duplicate submissions.
- Eliminates attendance proxying via screenshot sharing.

### 2. Biometric AI Face Recognition
- **Live Facial Attendance**: Real-time camera detection and 128-dimensional facial spatial-frequency embedding comparison against enrolled candidate profiles.
- **5-Step Guided Student Enrollment**: Camera permission → Face guide positioning → Multi-angle sample capture (3/3) → Feature vector generation → Biometric enrollment complete.
- **Privacy-First Design**: Raw face photos are never persistently stored; only mathematical feature vectors are securely retained.
- **Server-Side Python Service**: Includes an OpenCV backend service (`python/face_service.py`) supporting Euclidean/cosine vector similarity matching.

### 3. Role-Based Access Control (RBAC)
- **Student Dashboard (Mobile-First)**: Overall attendance percentage with 75% mandatory threshold alert, subject breakdown, today's schedule, one-tap prominent QR scanner, and biometric profile management.
- **Faculty Console**: Overview of today's classes, Start Attendance wizard, live Dynamic QR presentation mode, AI face attendance camera view, live real-time presence roll feed, and manual authorized corrections.
- **Admin Command Center**: Executive KPI cards, Recharts visualizations (weekly trend, department stats, present vs absent ratio), student and faculty directories, course curriculum management, master timetable matrix, PDF/Excel/CSV report generation, and immutable audit logs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion |
| **Analytics & UI** | Recharts, jsPDF, jspdf-autotable, XLSX, QRCode |
| **Database & Auth** | Cloud Firestore, Firebase Authentication, Firebase Storage, Firebase Hosting |
| **Serverless Backend** | Firebase Cloud Functions (`functions/index.js`) |
| **AI / Biometrics** | Python, OpenCV Haar Cascades, NumPy, SciPy, Canvas Feature Extractor |

---

## 📂 Project Structure

```
├── .env.example                # Environment variables template
├── firestore.rules             # Production Firestore Security Rules
├── storage.rules               # Firebase Storage rules
├── firebase.json               # Firebase deployment configuration
├── package.json                # Frontend dependencies
├── vite.config.ts              # Vite config
├── tailwind.config.js          # Tailwind design tokens
├── functions/
│   ├── package.json            # Cloud Functions dependencies
│   └── index.js                # Cloud Functions (validateQrToken, verifyFaceAttendance)
├── python/
│   ├── requirements.txt        # Python OpenCV & Flask dependencies
│   └── face_service.py         # AI Face Recognition backend service
└── src/
    ├── types/                  # TypeScript domain models
    ├── firebase/
    │   ├── config.ts           # Firebase SDK initialization
    │   ├── firestoreService.ts # Real-time Firestore sync & local reactive engine
    │   └── mockData.ts         # Institutional seed datasets
    ├── context/
    │   ├── AuthContext.tsx     # RBAC auth state & instant demo role switcher
    │   └── AttendanceSessionContext.tsx # 3-sec QR rotation & live presence feed
    ├── services/
    │   └── faceAiClient.ts     # Biometric vector extractor & OpenCV bridge
    ├── components/
    │   ├── common/             # Navbar, Sidebar, MobileNav, StatusBadge
    │   ├── qr/                 # RotatingQrCode (3s timer), QrScannerModal
    │   ├── face/               # FaceCameraView, FaceEnrollmentModal
    │   ├── analytics/          # StatCard, AttendanceCharts (Recharts)
    │   └── reports/            # ReportGeneratorModal (PDF, Excel, CSV)
    ├── layouts/                # DashboardLayout, StudentLayout
    ├── pages/
    │   ├── auth/               # LoginPage, UnauthorizedPage
    │   ├── admin/              # AdminDashboard, StudentMgmt, FacultyMgmt, etc.
    │   ├── faculty/            # FacultyDashboard, LiveQrSession, LiveFaceAttendance
    │   └── student/            # StudentDashboard, StudentQrScanner, Timetable, Profile
    ├── routes/                 # AppRoutes, ProtectedRoute
    └── index.css               # Design system & animations
```

---

## ⚡ Quick Start

### 1. Run the Frontend App
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 2. Fast Demo Role Switcher
On the login screen or via the top navigation bar, use 1-click test role logins:
- **Admin**: `admin@smartattend.edu` (Dr. Sarah Jenkins)
- **Faculty**: `faculty@smartattend.edu` (Prof. Vikram Sharma)
- **Student**: `student@smartattend.edu` (Rahul Patil)

### 3. (Optional) Run the Python OpenCV Biometric Service
```bash
cd python
pip install -r requirements.txt
python face_service.py
```
The service will listen on `http://localhost:5000` to process camera frames with OpenCV. Note that the frontend automatically falls back to browser-side spatial feature extraction if the Python service is offline.

### 4. (Optional) Connect Live Firebase Project
Update `.env` with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

## 🔒 Security & Anti-Proxy Guarantees

1. **Short-Lived 3-Second QR Tokens**: Dynamic QR codes expire after 3.5 seconds, rejecting stale screenshots.
2. **Duplicate Prevention**: Firestore queries block multiple attendance marks for the same student within an active session.
3. **Class Enrollment Enforcement**: QR validation checks that the student belongs to the specific class division.
4. **Biometric Confidence Verification**: Face AI checks similarity scores against enrolled vectors, rejecting un-enrolled or below-threshold faces.
5. **Immutable Audit Trails**: All login, session initialization, mark, and manual correction events are recorded to `/auditLogs`.
