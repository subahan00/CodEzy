import './App.css';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Profile from './pages/profile';
import { Routes, Route } from 'react-router-dom';
import Aimentor from './pages/AiMentor';
import ProblemPage from './pages/problemPage.jsx';
import ProblemList from './pages/problemList.jsx';
import ManageProblems from './pages/admin/Manageproblems.jsx';
import ProtectedRoute from './component/ProtectedRoute';
import Leaderboard from './pages/Leaderboard/LeaderboardPage.jsx';
import CreateProblems from './pages/admin/createProblems.jsx';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/aimentor" element={<Aimentor />} />
      <Route path="/problem/:slug" element={<ProblemPage />} />
      <Route path="/problems" element={<ProblemList />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      {/* ADMIN ONLY */}
      <Route
        path="/manage-problems"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManageProblems />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-problem"
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateProblems/>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
