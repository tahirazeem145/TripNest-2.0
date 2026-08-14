import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyJourneys from './pages/MyJourneys';
import CreateJourney from './pages/CreateJourney';
import Home from './pages/Home';
import Following from './pages/Following';
import Travelers from './pages/Travelers';
import Notifications from './pages/Notifications';
import Create from './pages/Create';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Phase 4 Social Discovery & Feed Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/following" 
            element={
              <ProtectedRoute>
                <Following />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/travelers" 
            element={
              <ProtectedRoute>
                <Travelers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/saved" 
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Existing Journey & Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-journeys" 
            element={
              <ProtectedRoute>
                <MyJourneys />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-journey" 
            element={
              <ProtectedRoute>
                <CreateJourney />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect to /home or /login */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
