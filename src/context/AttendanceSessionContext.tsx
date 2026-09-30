import React, { createContext, useContext, useState, useEffect } from 'react';
import { AttendanceSession, AttendanceRecord, DynamicQrSession } from '../types';
import { firestoreService } from '../firebase/firestoreService';

interface AttendanceSessionContextType {
  activeSession: AttendanceSession | null;
  qrSession: DynamicQrSession | null;
  sessionRecords: AttendanceRecord[];
  qrSecondsRemaining: number;
  startSession: (params: {
    facultyId: string;
    facultyName: string;
    subjectId: string;
    classId: string;
    division: string;
    durationMinutes: number;
    method: 'FACE' | 'QR';
    roomNumber?: string;
  }) => Promise<AttendanceSession>;
  endSession: () => Promise<void>;
  setActiveSessionById: (sessionId: string) => void;
}

const AttendanceSessionContext = createContext<AttendanceSessionContextType | undefined>(undefined);

export const AttendanceSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [qrSession, setQrSession] = useState<DynamicQrSession | null>(null);
  const [sessionRecords, setSessionRecords] = useState<AttendanceRecord[]>([]);
  const [qrSecondsRemaining, setQrSecondsRemaining] = useState<number>(3);

  // Load existing active session if available
  useEffect(() => {
    const unsub = firestoreService.subscribeSessions((sessions) => {
      const active = sessions.find((s) => s.status === 'ACTIVE');
      if (active && (!activeSession || activeSession.id !== active.id)) {
        setActiveSession(active);
      }
    });
    return () => unsub();
  }, []);

  // Listen to records for the active session
  useEffect(() => {
    if (!activeSession) {
      setSessionRecords([]);
      return;
    }
    const unsub = firestoreService.subscribeSessionRecords(activeSession.id, (records) => {
      setSessionRecords(records);
    });
    return () => unsub();
  }, [activeSession?.id]);

  // ROTATING DYNAMIC QR ENGINE (Changes every 3 seconds strictly as requested)
  useEffect(() => {
    if (!activeSession || activeSession.method !== 'QR' || activeSession.status !== 'ACTIVE') {
      setQrSession(null);
      return;
    }

    // Generate initial QR code
    const initialQr = firestoreService.generateRotatingQrToken(activeSession.id, activeSession.subjectName);
    setQrSession(initialQr);
    setQrSecondsRemaining(3);

    // 1-second ticker for smooth countdown (00:03, 00:02, 00:01)
    const countdownTimer = setInterval(() => {
      setQrSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time to rotate QR code!
          const nextQr = firestoreService.generateRotatingQrToken(activeSession.id, activeSession.subjectName);
          setQrSession(nextQr);
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
    };
  }, [activeSession?.id, activeSession?.method, activeSession?.status]);

  const startSession = async (params: {
    facultyId: string;
    facultyName: string;
    subjectId: string;
    classId: string;
    division: string;
    durationMinutes: number;
    method: 'FACE' | 'QR';
    roomNumber?: string;
  }) => {
    const session = await firestoreService.createAttendanceSession(params);
    setActiveSession(session);
    return session;
  };

  const endSession = async () => {
    if (activeSession) {
      await firestoreService.endAttendanceSession(activeSession.id);
      setActiveSession(null);
      setQrSession(null);
    }
  };

  const setActiveSessionById = (sessionId: string) => {
    firestoreService.subscribeActiveSession(sessionId, (s) => {
      setActiveSession(s);
    });
  };

  return (
    <AttendanceSessionContext.Provider
      value={{
        activeSession,
        qrSession,
        sessionRecords,
        qrSecondsRemaining,
        startSession,
        endSession,
        setActiveSessionById,
      }}
    >
      {children}
    </AttendanceSessionContext.Provider>
  );
};

export const useAttendanceSession = () => {
  const context = useContext(AttendanceSessionContext);
  if (!context) {
    throw new Error('useAttendanceSession must be used within an AttendanceSessionProvider');
  }
  return context;
};
