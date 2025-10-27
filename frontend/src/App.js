import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import ExamManagement from './pages/ExamManagement';
import RoomManagement from './pages/RoomManagement';
import SeatingGeneration from './pages/SeatingGeneration';
import SeatingPreview from './pages/SeatingPreview';
import InvigilatorDashboard from './pages/InvigilatorDashboard';
import DepartmentManagement from './pages/DepartmentManagement';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userStr);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentManagement />
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentManagement />
            </ProtectedRoute>
          } />
          <Route path="/exams" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ExamManagement />
            </ProtectedRoute>
          } />
          <Route path="/rooms" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RoomManagement />
            </ProtectedRoute>
          } />
          <Route path="/seating/generate" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SeatingGeneration />
            </ProtectedRoute>
          } />
          <Route path="/seating/preview/:examId" element={
            <ProtectedRoute allowedRoles={['admin', 'invigilator']}>
              <SeatingPreview />
            </ProtectedRoute>
          } />
          <Route path="/invigilator" element={
            <ProtectedRoute allowedRoles={['invigilator']}>
              <InvigilatorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
