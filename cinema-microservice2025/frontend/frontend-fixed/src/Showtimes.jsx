import React, { useState } from 'react';
export default function Showtimes({ showtimes, onBook, token }) {
  const [selectedSeats, setSelectedSeats] = useState({});
  
  if (!showtimes?.length) {
    return (
      <div className="panel" style={{ marginTop: 12, textAlign: 'center', padding: '20px' }}>
        <p className="muted">No showtimes available for this movie.</p>
      </div>
    );
  }

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'Invalid Date';
    
    try {
      // Handle both showTime and startTime fields
      const dateString = dateTimeString.showTime || dateTimeString.startTime || dateTimeString;
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Date';
    }
  };

  const handleSeatSelection = (showtimeId, seat) => {
    setSelectedSeats(prev => ({
      ...prev,
      [showtimeId]: seat
    }));
  };

  const handleBook = (showtime) => {
    const seat = selectedSeats[showtime.id] || 'A1';
    onBook({ ...showtime, selectedSeat: seat });
  };
  
  const getSeatsStatus = (availableSeats) => {
    const seats = availableSeats || 50;
    if (seats <= 5) {
      return { 
        color: '#ef4444', 
        bgColor: 'rgba(239, 68, 68, 0.1)', 
        icon: '⚠️', 
        text: 'Few seats left!' 
      };
    } else if (seats <= 15) {
      return { 
        color: '#f59e0b', 
        bgColor: 'rgba(245, 158, 11, 0.1)', 
        icon: '🚀', 
        text: 'Filling fast' 
      };
    } else {
      return { 
        color: '#22c55e', 
        bgColor: 'rgba(34, 197, 94, 0.1)', 
        icon: '🎟️', 
        text: 'Good availability' 
      };
    }
  };

  return (
    <div className="panel" style={{ marginTop: 12 }}>
      <h4 style={{ marginTop: 0, marginBottom: 16 }}>Available Showtimes</h4>
      <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
        {showtimes.map(s => {
          const seatsStatus = getSeatsStatus(s.availableSeats);
          const availableSeats = s.availableSeats || 50;
          
          return (
            <div key={s.id} className="row" style={{ 
              alignItems:'center', 
              justifyContent:'space-between', 
              padding: '12px', 
              background: seatsStatus.bgColor, 
              borderRadius: '8px', 
              border: `1px solid ${seatsStatus.color}30`,
              transition: 'all 0.3s ease'
            }}>
              <div className="grow">
                <div style={{ fontWeight: 600, fontSize: '16px' }}>
                  {formatTime(s)}
                </div>
                <div style={{ 
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: seatsStatus.color, fontWeight: '600' }}>
                    {seatsStatus.icon} {availableSeats} seats available
                  </span>
                  <span style={{ 
                    color: seatsStatus.color, 
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'lowercase'
                  }}>
                    • {seatsStatus.text}
                  </span>
                </div>
              </div>
            
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {token && availableSeats > 0 && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['A1', 'A2', 'B1', 'B2'].map(seat => (
                      <button
                        key={seat}
                        className={`btn ${selectedSeats[s.id] === seat ? 'primary' : ''}`}
                        onClick={() => handleSeatSelection(s.id, seat)}
                        style={{ 
                          padding: '6px 10px', 
                          fontSize: '12px',
                          minWidth: '40px'
                        }}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                )}
                
                <button 
                  className={`btn ${availableSeats > 0 ? 'primary' : ''}`} 
                  onClick={() => availableSeats > 0 && handleBook(s)}
                  disabled={availableSeats === 0}
                  style={{ 
                    minWidth: '120px',
                    backgroundColor: availableSeats === 0 ? '#6b7280' : undefined,
                    cursor: availableSeats === 0 ? 'not-allowed' : 'pointer',
                    opacity: availableSeats === 0 ? 0.6 : 1
                  }}
                >
                  {availableSeats === 0 
                    ? 'Sold Out' 
                    : token 
                      ? 'Book Now' 
                      : 'Login to Book'
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {token && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--ok)' }}>
            💡 Select your preferred seat and click "Book Now"
          </p>
        </div>
      )}
    </div>
  );
}
