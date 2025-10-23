import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ authed, user, onLogout }) {
  return (
    <nav className="nav">
      <div className="brand">
        <div className="logo" />
        <Link to="/">Cinema Booking System</Link>
      </div>
      <div className="actions">
        {authed ? (
          <>
            <span 
              className="pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                height: '36px',
                minWidth: 'auto',
                borderRadius: '6px',
                backgroundColor: 'var(--primary-bg, rgba(124, 58, 237, 0.1))',
                color: 'var(--primary, #7c3aed)',
                border: '1px solid var(--primary-border, rgba(124, 58, 237, 0.2))',
                marginRight: '12px'
              }}
            >
              {user && user.role === 'ADMIN' ? '🔑 Admin' : '🍿 User'}
            </span>
            <button 
              className="btn" 
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                height: '36px',
                minWidth: 'auto',
                borderRadius: '6px'
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link className="btn" to="/login">Log in</Link>
            <Link className="btn primary" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
