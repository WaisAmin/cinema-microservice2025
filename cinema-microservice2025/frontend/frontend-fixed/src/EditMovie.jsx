import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api.js';

export default function EditMovie() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    durationMinutes: '',
    description: ''
  });

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  
  useEffect(() => {
    async function loadUserData() {
      try {
        const storedToken = localStorage.getItem('cinema_token');
        if (storedToken) {
          setToken(storedToken);
          
          // Fetch user data from API using token
          try {
            const userData = await api.me(storedToken);
            setUser(userData);
            setUserLoading(false); // User data loaded successfully
          } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Token might be invalid, clear it
            localStorage.removeItem('cinema_token');
            setToken(null);
            setUser(null);
            setUserLoading(false);
            showToast('Please log in again');
            navigate('/login');
          }
        } else {
          setToken(null);
          setUser(null);
          setUserLoading(false);
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        showToast('Error accessing user data');
        navigate('/login');
      }
    }
    
    loadUserData();
  }, [navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  // Check authentication in useEffect
  useEffect(() => {
    // Only run auth check after user data loading is complete
    if (!userLoading) {
      if (!token) {
        console.log('No token, redirecting to login');
        showToast('Please log in to continue');
        navigate('/login');
        return;
      }
      
      if (!user || user.role !== 'ADMIN') {
        console.log('User not admin, redirecting to home', { user, role: user?.role });
        showToast('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }

    }
  }, [userLoading, token, user, navigate]);

  // Fetch movie data
  useEffect(() => {
    async function fetchMovie() {
      if (!token || !user || user.role !== 'ADMIN' || userLoading) {
        return;
      }
      
      try {
        setLoading(true);
        const currentMovie = await api.getMovieById({ movieId: parseInt(movieId) });
        
        if (!currentMovie) {
          showToast('Movie not found');
          navigate('/');
          return;
        }
        setFormData({
          title: currentMovie.title || '',
          genre: currentMovie.genre || '',
          durationMinutes: currentMovie.durationMinutes?.toString() || '',
          description: currentMovie.description || ''
        });
        
      } catch (error) {
        console.error('Failed to fetch movie:', error);
        showToast('Failed to load movie: ' + error.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    
    if (movieId && token && user && user.role === 'ADMIN' && !userLoading) {
      fetchMovie();
    }
  }, [movieId, token, user, userLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token || !user || user.role !== 'ADMIN') {
      showToast('Permission denied');
      return;
    }

    console.log('=== Edit Movie Submission ===');
    console.log('Form data:', formData);
    
    setSaving(true);
    try {
      await api.updateMovie({ 
        token, 
        movieId: parseInt(movieId), 
        title: formData.title,
        genre: formData.genre,
        durationMinutes: parseInt(formData.durationMinutes),
        description: formData.description
      });
      
      // Invalidate movies cache so Home component will show updated data
      sessionStorage.removeItem('cachedMovies');
      sessionStorage.removeItem('moviesCacheTime');
      
      showToast('Movie updated successfully! Redirecting...');
      
      // Redirect to home page after successful update
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to update movie:', error);
      showToast('Failed to update movie: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: 16 }}>{userLoading ? 'Loading user data...' : 'Loading movie...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel" style={{ maxWidth: 600, margin: '40px auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button 
            className="btn" 
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            ← Back to Movies
          </button>
          
          <h2 style={{ margin: 0, marginBottom: 8 }}>Edit Movie</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9em' }}>
            Update the movie details below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div>
              <label className="label">Movie Title</label>
              <input
                className="input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter movie title"
                disabled={saving}
                required
              />
            </div>
            <div>
              <label className="label">Genre</label>
              <input
                className="input"
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                placeholder="e.g., Action, Comedy, Drama"
                disabled={saving}
                required
              />
            </div>
          </div>

          <div style={{ height: 16 }} />

          <label className="label">Duration (minutes)</label>
          <input
            className="input"
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleInputChange}
            placeholder="e.g., 120"
            min="1"
            max="400"
            disabled={saving}
            required
          />

          <div style={{ height: 16 }} />

          <label className="label">Description</label>
          <textarea
            className="input"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter movie description..."
            rows="4"
            disabled={saving}
            required
            style={{ resize: 'vertical', minHeight: 100 }}
          />

          <div style={{ height: 24 }} />

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/')}
              disabled={saving}
              style={{ marginRight: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Updating Movie...' : 'Update Movie'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast Messages */}
      {toast && <div className="toast">{toast}</div>}

      <style jsx>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column-reverse;
            gap: 12px;
          }
          
          .form-actions button {
            width: 100%;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}