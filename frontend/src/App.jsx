import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Notification System

// --- AUTH & PUBLIC PAGES ---
import Login from './pages/Login';
import HomePage from './pages/HomePage';

// --- USER PAGES ---
import Profile from './pages/profile';
import Aimentor from './pages/AiMentor';
import ProblemList from './pages/problemList.jsx';
import ProblemPage from './pages/problemPage.jsx';
import Leaderboard from './pages/Leaderboard/LeaderboardPage.jsx';

// --- ADMIN PAGES ---
import ManageProblems from './pages/admin/Manageproblems.jsx';
import CreateProblems from './pages/admin/createProblems.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx'; // The new dashboard we just made

// --- COMPONENTS & LAYOUTS ---
import ProtectedRoute from './component/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout'; // The sidebar layout

function App() {
  return (
    <>
      {/* 1. Global Notification Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#333', color: '#fff' },
          success: { theme: { primary: '#4ade80', secondary: 'black' } },
        }}
      />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />

        {/* --- PROTECTED USER ROUTES --- */}
        {/* Users must be logged in to see these */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aimentor" 
          element={
            <ProtectedRoute>
              <Aimentor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problems" 
          element={
            <ProtectedRoute>
              <ProblemList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/problem/:slug" 
          element={
            <ProtectedRoute>
              <ProblemPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } 
        />

        {/* --- ADMIN ROUTES (Nested Layout) --- */}
        {/* All these routes live inside the Admin Sidebar Layout */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default: Redirect /admin -> /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="manage-problems" element={<ManageProblems />} />
          <Route path="add-problem" element={<CreateProblems />} />
          
          {/* Placeholders for future features */}
          <Route path="users" element={<div className="p-10 text-white">User Management (Coming Soon)</div>} />
          <Route path="analytics" element={<div className="p-10 text-white">Analytics (Coming Soon)</div>} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<div className="text-white text-center mt-20">404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;