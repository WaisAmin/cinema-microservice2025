import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api.js';

export default function ManageShowtimes({ token, user }) {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShowtime, setNewShowtime] = useState({
    showDate: '',
    showTime: '',
    availableSeats: 50
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showtimeToDelete, setShowtimeToDelete] = useState(null);

  // Check authentication in useEffect instead of early returns
  useEffect(() => {
    if (!token) {
      console.log('No token, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!user || user.role !== 'ADMIN') {
      console.log('User not admin, redirecting to home');
      navigate('/');
      return;
    }
  }, [token, user, navigate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  };

  // Fetch movie and showtimes
  useEffect(() => {
    async function fetchData() {
      // Only fetch if we have token and user is admin
      if (!token || !user || user.role !== 'ADMIN') {
        return;
      }
      
      try {
        setLoading(true);
        // Get all movies to find the current one
        const movies = await api.movies();
        const currentMovie = movies.find(m => m.id.toString() === movieId);
        if (!currentMovie) {
          showToast('Movie not found');
          navigate('/');
          return;
        }
        setMovie(currentMovie);

        const showtimeData = await api.showtimes(movieId);
        setShowtimes(showtimeData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showToast('Failed to load data: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (movieId && token && user) {
      fetchData();
    }
  }, [movieId, token, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShowtime(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddShowtime = async (e) => {
    e.preventDefault();
    if (!newShowtime.showDate || !newShowtime.showTime) {
      showToast('Please fill in all fields');
      return;
    }

    try {
      // Combine date and time
      const showDateTime = `${newShowtime.showDate}T${newShowtime.showTime}:00`;
      const showtimeData = {
        movieId: parseInt(movieId),
        showTime: showDateTime,
        availableSeats: parseInt(newShowtime.availableSeats)
      };

      const result = await api.addShowtime({ token, ...showtimeData });
      const updatedShowtimes = await api.showtimes(movieId);
      setShowtimes(updatedShowtimes);
      
      // Reset form
      setNewShowtime({
        showDate: '',
        showTime: '',
        availableSeats: 50
      });
      setShowAddForm(false);
      showToast('Showtime added successfully!');
      
    } catch (error) {
      console.error('Error adding showtime:', error);
      console.error('Error details:', error.message, error.stack);
      showToast('Failed to add showtime: ' + error.message);
    }
  };

  const handleDeleteClick = (showtime) => {
    setShowtimeToDelete(showtime);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteShowtime = async () => {
    if (!showtimeToDelete) return;
    
    setShowDeleteModal(false);
    
    try {
      await api.deleteShowtime({ token, showtimeId: showtimeToDelete.id });
      
      setShowtimes(prevShowtimes =>
        prevShowtimes.filter(showtime => showtime.id !== showtimeToDelete.id)
      );
      showToast('Showtime deleted successfully!');
      
    } catch (error) {
      showToast('Failed to delete showtime: ' + error.message);
    } finally {
      setShowtimeToDelete(null);
    }
  };
  
  const cancelDeleteShowtime = () => {
    setShowDeleteModal(false);
    setShowtimeToDelete(null);
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
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
          <p style={{ marginTop: 16 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel" style={{ maxWidth: 800, margin: '40px auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button 
            className="btn" 
            onClick={() => navigate('/')}
            style={{ marginBottom: 16 }}
          >
            ← Back to Movies
          </button>
          
          <h2 style={{ margin: 0, marginBottom: 8 }}>
            Manage Showtimes
          </h2>
          {movie && (
            <h3 style={{ margin: 0, color: 'var(--muted)', fontWeight: 'normal' }}>
              {movie.title} ({movie.genre})
            </h3>
          )}
        </div>

        {/* Add Showtime Section */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0 }}>Showtimes</h4>
            <button 
              className="btn primary" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Showtime'}
            </button>
          </div>

          {showAddForm && (
            <div className="panel" style={{ 
              marginBottom: 24, 
              background: 'var(--bg)', 
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <h5 style={{ marginTop: 0, color: 'var(--text)' }}>Add New Showtime</h5>
              <form onSubmit={handleAddShowtime}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: 16 }}>
                  <div>
                    <label className="label" style={{ color: 'var(--text)', marginBottom: '4px', display: 'block' }}>Date</label>
                    <input
                      type="date"
                      name="showDate"
                      value={newShowtime.showDate}
                      onChange={handleInputChange}
                      className="input"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        colorScheme: 'light dark'
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text)', marginBottom: '4px', display: 'block' }}>Time</label>
                    <input
                      type="time"
                      name="showTime"
                      value={newShowtime.showTime}
                      onChange={handleInputChange}
                      className="input"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        colorScheme: 'light dark'
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text)', marginBottom: '4px', display: 'block' }}>Available Seats</label>
                    <input
                      type="number"
                      name="availableSeats"
                      value={newShowtime.availableSeats}
                      onChange={handleInputChange}
                      className="input"
                      style={{
                        backgroundColor: 'var(--bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '14px'
                      }}
                      min="1"
                      max="200"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn primary">
                  Add Showtime
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Showtimes List */}
        <div>
          {showtimes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              <p>No showtimes available for this movie.</p>
              <p>Click "Add Showtime" to create the first showtime.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {showtimes.map(showtime => {
                const { date, time } = formatDateTime(showtime.showTime);
                return (
                  <div 
                    key={showtime.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '16px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        📅 {date} at {time}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.9em' }}>
                        🎫 {showtime.availableSeats} seats available
                      </div>
                    </div>
                    <button
                      className="btn danger"
                      onClick={() => handleDeleteClick(showtime)}
                      style={{ 
                        backgroundColor: 'var(--danger, #ef4444)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toast Messages */}
      {toast && <div className="toast">{toast}</div>}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && showtimeToDelete && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={cancelDeleteShowtime}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg, white)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border, #e5e7eb)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '16px',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: 'var(--text, #111827)'
                }}>
                  Delete Showtime
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: 'var(--muted, #6b7280)',
                  marginTop: '2px'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            {/* Modal Content */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                lineHeight: '1.5',
                color: 'var(--text, #374151)'
              }}>
                Are you sure you want to delete the showtime for{' '}
                <strong>{formatDateTime(showtimeToDelete.showTime).date}</strong>{' '}
                at <strong>{formatDateTime(showtimeToDelete.showTime).time}</strong>?
                This will permanently remove this showtime and may affect users who booked tickets.
              </p>
            </div>
            
            {/* Modal Actions */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDeleteShowtime}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: 'var(--muted, #6b7280)',
                  border: '1px solid var(--border, #d1d5db)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--border, #f3f4f6)';
                  e.target.style.borderColor = 'var(--muted, #9ca3af)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'var(--border, #d1d5db)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteShowtime}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                }}
              >
                Delete Showtime
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Enhanced date and time input styling */
        input[type="date"], input[type="time"] {
          position: relative;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: textfield;
        }
        
        /* Date picker icon styling */
        input[type="date"]::-webkit-calendar-picker-indicator {
          background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="4" width="18" height="18" rx="2" ry="2"/%3e%3cline x1="16" y1="2" x2="16" y2="6"/%3e%3cline x1="8" y1="2" x2="8" y2="6"/%3e%3cline x1="3" y1="10" x2="21" y2="10"/%3e%3c/svg%3e');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px 16px;
          width: 20px;
          height: 20px;
          border: none;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Time picker icon styling */
        input[type="time"]::-webkit-time-picker-indicator {
          background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3ccircle cx="12" cy="12" r="10"/%3e%3cpolyline points="12,6 12,12 16,14"/%3e%3c/svg%3e');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px 16px;
          width: 20px;
          height: 20px;
          border: none;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        
        input[type="time"]::-webkit-time-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Dark theme adjustments */
        [data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
          background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3crect x="3" y="4" width="18" height="18" rx="2" ry="2"/%3e%3cline x1="16" y1="2" x2="16" y2="6"/%3e%3cline x1="8" y1="2" x2="8" y2="6"/%3e%3cline x1="3" y1="10" x2="21" y2="10"/%3e%3c/svg%3e');
        }
        
        [data-theme="dark"] input[type="time"]::-webkit-time-picker-indicator {
          background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3ccircle cx="12" cy="12" r="10"/%3e%3cpolyline points="12,6 12,12 16,14"/%3e%3c/svg%3e');
        }
        
        /* Firefox fallback */
        input[type="date"]::-moz-calendar-picker-indicator,
        input[type="time"]::-moz-time-picker-indicator {
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        @media (max-width: 600px) {
          .panel form > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}