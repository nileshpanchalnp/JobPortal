
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import JobDetails from './pages/JobDetails';
import CandidateDashboard from './pages/Dashboard/CandidateDashboard';
import CompanyDashboard from './pages/Dashboard/CompanyDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import SavedJobs from './pages/SavedJobs';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
             <ToastContainer position="top-right" autoClose={3000} />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;