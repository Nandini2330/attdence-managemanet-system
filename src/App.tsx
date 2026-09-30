import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AttendanceSessionProvider } from './context/AttendanceSessionContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AttendanceSessionProvider>
          <AppRoutes />
        </AttendanceSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
