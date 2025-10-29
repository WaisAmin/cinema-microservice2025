import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import AuthForm from './AuthForm.jsx';
import Home from './Home.jsx';
import AddMovie from './AddMovie.jsx';
import EditMovie from './EditMovie.jsx';
import ManageShowtimes from './ManageShowtimes.jsx';
import { api } from './api.js';

export default function App() {
  const navigate = useNavigate();

  //Authentication and user state
  const [token, setToken] = useState(() => localStorage.getItem('cinema_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [clearRegisterForm, setClearRegisterForm] = useState(null);
  const [clearLoginForm, setClearLoginForm] = useState(null);
  const [formKey, setFormKey] = useState(0); // Force re-render of forms

  // Check if user is authenticated on app load
  useEffect(() => {
    if (token) {
      api.me(token)
        .then(setUser)
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('cinema_token');
          setToken(null);
        });
    }
  }, [token]);

  //Show a short toast message
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  //Handle user login
  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('cinema_token', response.token);
      setToken(response.token);
      setUser(response.user);
      showToast('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      
      // Handle common login errors
      if (errorMessage.toLowerCase().includes('invalid credentials') || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.toLowerCase().includes('user not found')) {
        errorMessage = 'No account found with this email. Please check your email or create a new account.';
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  //Handle user registration
  const handleRegister = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await api.register({ email, password });
      
      // Clear the form fields
      if (clearRegisterForm) {
        clearRegisterForm();
      }
      
      showToast('Account created successfully! Redirecting to login...');
      
      // Keep loading state for 1 second, then redirect
      setTimeout(() => {
        setLoading(false);
        // Force re-render of login form to ensure it's clean
        setFormKey(prev => prev + 1);
        navigate('/login');
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      
      // Handle common registration errors
      if (errorMessage.toLowerCase().includes('email already exists')) {
        errorMessage = 'Email already exists. Please use a different email or try logging in.';
      } else if (errorMessage.toLowerCase().includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (errorMessage.toLowerCase().includes('password')) {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  //Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('cinema_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully');
  };

  return (
    <>
      <Navbar authed={!!token} user={user} onLogout={handleLogout} />
      
      <Routes>
        <Route path="/" element={<Home token={token} user={user} />} />
        <Route 
          path="/login" 
          element={
            token ? <Navigate to="/" replace /> : 
            <AuthForm 
              key={`login-${formKey}`}
              mode="login" 
              onSubmit={handleLogin} 
              loading={loading}
              onClear={setClearLoginForm}
            />
          } 
        />
        <Route 
          path="/register" 
          element={
            token ? <Navigate to="/" replace /> : 
            <AuthForm 
              key={`register-${formKey}`}
              mode="register" 
              onSubmit={handleRegister} 
              loading={loading}
              onClear={setClearRegisterForm}
            />
          } 
        />
        <Route 
          path="/add-movie" 
          element={
            token ? <AddMovie token={token} user={user} /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/edit-movie/:movieId" 
          element={
            token ? <EditMovie /> : <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/manage-showtimes/:movieId" 
          element={
            token ? <ManageShowtimes token={token} user={user} /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>

      {/* Toast Messages */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
