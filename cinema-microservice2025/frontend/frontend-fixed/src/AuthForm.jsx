import React from 'react';
import { useState } from 'react';

export default function AuthForm({ mode='login', onSubmit, loading=false, onClear }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Function to clear form fields
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };
  
  // Expose clear function to parent if provided
  React.useEffect(() => {
    if (onClear) {
      onClear(clearForm);
    }
  }, [onClear]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      onSubmit({ email, password });
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="panel" style={{ maxWidth: 420, margin:'40px auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome to Cinema Booking App' : 'Register Account'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 24 }}>
          {mode === 'login' ? 'Log in to book tickets' : 'Join us for the best movie experience'}
        </p>
        
        <label className="label">Email Address</label>
        <input 
          className="input" 
          type="email" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)} 
          placeholder="Enter your email"
          disabled={loading}
          required 
        />
        <div style={{ height: 12 }} />
        
        <label className="label">Password</label>
        <div style={{ position: 'relative' }}>
          <input 
            className="input" 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            placeholder="Enter your password"
            disabled={loading}
            required 
            style={{ paddingRight: '45px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '18px',
              color: 'var(--muted)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s ease',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.color = 'var(--text)';
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.color = 'var(--muted)';
                e.target.style.backgroundColor = 'transparent';
              }
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              // Eye with slash (hide password)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            ) : (
              // Regular eye (show password)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <div style={{ height: 16 }} />
        
        <button 
          className="btn primary" 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Register')}
        </button>
        
        {mode === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: 'var(--primary)' }}>
              Register here
            </a>
          </p>
        )}
        
        {mode === 'register' && (
          <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary)' }}>
              Log in here
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
