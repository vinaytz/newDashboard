import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Overview from './pages/Dashboard/Overview';
import MyTasks from './pages/Dashboard/MyTasks';
import MyGoals from './pages/Dashboard/MyGoals';
import Analytics from './pages/Dashboard/Analytics';
import Notes from './pages/Dashboard/Notes';
import Timer from './pages/Dashboard/Timer';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="mytasks" element={<MyTasks />} />
              <Route path="mygoals" element={<MyGoals />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="timetable" element={<div className="text-white">Timetable (Coming Soon)</div>} />
              <Route path="timer" element={<Timer />} />
              <Route path="notes" element={<Notes />} />
              <Route path="reminders" element={<div className="text-white">Reminders (Coming Soon)</div>} />
              <Route path="profile" element={<div className="text-white">Profile (Coming Soon)</div>} />
              <Route path="settings" element={<div className="text-white">Settings (Coming Soon)</div>} />
            </Route>
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;