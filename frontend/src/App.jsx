import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Following from './pages/Following';
import Travelers from './pages/Travelers';
import Notifications from './pages/Notifications';
import Create from './pages/Create';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import TravelerProfile from './pages/TravelerProfile';
import Destination from './pages/Destination';
import PostDetail from './pages/PostDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Social Platform Routes */}
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
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <TravelerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore/destination/:destination" 
            element={
              <ProtectedRoute>
                <Destination />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post/:postId" 
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            } 
          />

          {/* Dashboard redirect to /home */}
          <Route 
            path="/dashboard" 
            element={<Navigate to="/home" replace />} 
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
