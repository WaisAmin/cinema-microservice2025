import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api.js';

export default function AddMovie({ token, user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    durationMinutes: '',
    description: ''
  });

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      showToast('Please log in to add movies');
      return;
    }


    setLoading(true);
    try {
      const movieData = {
        title: formData.title,
        genre: formData.genre,
        durationMinutes: parseInt(formData.durationMinutes),
        description: formData.description
      };

      await api.createMovie({ token, ...movieData });
      
      // Invalidate movies cache so Home component will refetch
      sessionStorage.removeItem('cachedMovies');
      sessionStorage.removeItem('moviesCacheTime');
      
      showToast('Movie added successfully! Redirecting...');
      
      // Redirect to home page after successful addition
      setTimeout(() => {
        navigate('/');
      }, 800);
      
    } catch (error) {
      showToast('Failed to add movie: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not authenticated or not admin
  if (!token) {
    navigate('/login');
    return null;
  }
  
  if (!user || user.role !== 'ADMIN') {
    navigate('/');
    return null;
  }

  return (
    <div className="container">
      <div className="panel" style={{ maxWidth: 600, margin: '40px auto' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>Add New Movie</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 32 }}>
          Fill in the details below to add a new movie to the catalog
        </p>

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
                disabled={loading}
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
                disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            required
            style={{ resize: 'vertical', minHeight: 100 }}
          />

          <div style={{ height: 24 }} />

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={() => navigate('/')}
              disabled={loading}
              style={{ marginRight: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Adding Movie...' : 'Add Movie'}
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
        
        .file-upload-label:hover {
          border-color: var(--primary);
          background-color: var(--primary-bg);
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