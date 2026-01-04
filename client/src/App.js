import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from './hooks/useTranslation';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import QuizGenerator from './components/Quiz/QuizGenerator';
import QuizTaking from './components/Quiz/QuizTaking';
import Forum from './components/Forum/Forum';
import ForumPost from './components/Forum/ForumPost';
import ProgressTracker from './components/Progress/ProgressTracker';
import Portfolio from './components/Progress/Portfolio';
import GameDashboard from './components/Games/GameDashboard';
import BadgesPage from './components/Badges/BadgesPage';
import Navbar from './components/Layout/Navbar';
import StressIndicator from './components/Stress/StressIndicator';
import './App.css';

// Set axios default base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_URL;

// Set up axios interceptors for token management
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is authenticated
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    setToken(token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <AppContent user={user} onLogout={handleLogout} onLogin={handleLogin} />
      </Router>
    </ThemeProvider>
  );
}

function AppContent({ user, onLogout, onLogin }) {
  const location = useLocation();
  const isQuizTakingPage = location.pathname.startsWith('/quiz/take/');
  
  return (
    <div className="App min-h-screen bg-dominant-50 dark:bg-dominant-950 transition-colors duration-200">
      {user && !isQuizTakingPage && <Navbar user={user} onLogout={onLogout} />}
      
      <main className={isQuizTakingPage ? "" : "pb-8"}>
        {user && !isQuizTakingPage && <StressIndicator userId={user._id} />}
            
            <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={onLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={onLogin} /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/quiz/generate" 
            element={user ? <QuizGenerator user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/quiz/take/:quizId" 
            element={user ? <QuizTaking user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/forum" 
            element={user ? <Forum user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/forum/post/:postId" 
            element={user ? <ForumPost user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/progress" 
            element={user ? <ProgressTracker user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/portfolio" 
            element={user ? <Portfolio user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/games" 
            element={user ? <GameDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/badges" 
            element={user ? <BadgesPage user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
            </Routes>
          </main>
        </div>
  );
}

export default App;


