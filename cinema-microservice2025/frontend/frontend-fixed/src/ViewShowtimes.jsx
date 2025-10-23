import React from 'react';

export default function ViewShowtimes({ movie, showtimes, onClose, onBook, token }) {
  if (!movie) return null;

  const formatDateTime = (dateTimeStr) => {
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  return (
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
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '4px', fontSize: '1.5rem' }}>
              {movie.title}
            </h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
              {movie.genre} • {movie.durationMinutes} minutes
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--muted)'
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Movie Description */}
        {movie.description && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '16px', 
            background: 'rgba(0, 0, 0, 0.02)', 
            borderRadius: '8px', 
            border: '1px solid var(--border)' 
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.9rem', 
              lineHeight: '1.5', 
              color: 'var(--text)' 
            }}>
              {movie.description}
            </p>
          </div>
        )}

        {/* Showtimes */}
        <div>
          <h3 style={{ margin: 0, marginBottom: '16px' }}>Available Showtimes</h3>
          
          {!showtimes || showtimes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <p>No showtimes available for this movie.</p>
              <p style={{ fontSize: '0.85rem' }}>Please check back later or contact the theater.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {showtimes.map(showtime => {
                const { date, time } = formatDateTime(showtime.showTime || showtime.startTime);
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
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        📅 {date}
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '2px'
                      }}>
                        <span style={{ color: 'var(--muted)' }}>
                          🕐 {time}
                        </span>
                        <span style={{ 
                          color: (showtime.availableSeats || 50) <= 5 ? '#ef4444' : 
                                (showtime.availableSeats || 50) <= 15 ? '#f59e0b' : '#22c55e',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          • {(showtime.availableSeats || 50) <= 5 ? '⚠️' : 
                             (showtime.availableSeats || 50) <= 15 ? '🚀' : '🎟️'} 
                          {showtime.availableSeats || 50} seats
                          {(showtime.availableSeats || 50) <= 5 ? ' (Few left!)' : 
                           (showtime.availableSeats || 50) <= 15 ? ' (Filling fast)' : ' available'}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className={`btn ${(showtime.availableSeats || 50) > 0 ? 'primary' : ''}`}
                      onClick={() => {
                        if ((showtime.availableSeats || 50) > 0) {
                          console.log('Book button clicked for showtime:', showtime);
                          onBook(showtime);
                        }
                      }}
                      disabled={(showtime.availableSeats || 50) === 0}
                      style={{ 
                        minWidth: '100px',
                        backgroundColor: (showtime.availableSeats || 50) === 0 ? '#6b7280' : undefined,
                        cursor: (showtime.availableSeats || 50) === 0 ? 'not-allowed' : 'pointer',
                        opacity: (showtime.availableSeats || 50) === 0 ? 0.6 : 1
                      }}
                    >
                      {(showtime.availableSeats || 50) === 0 
                        ? 'Sold Out' 
                        : token 
                          ? 'Book Now' 
                          : 'Login to Book'
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            className="btn" 
            onClick={onClose}
            style={{ minWidth: '120px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}