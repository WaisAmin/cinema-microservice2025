import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard.jsx';
import Showtimes from './Showtimes.jsx';
import ViewShowtimes from './ViewShowtimes.jsx';
import { api } from './api.js';

export default function Home({ token, user }) {
  // Function to invalidate movies cache (can be called from parent)
  React.useEffect(() => {
    // Listen for movie cache invalidation events
    const handleCacheInvalidation = () => {
      sessionStorage.removeItem('cachedMovies');
      sessionStorage.removeItem('moviesCacheTime');
      // Force refetch
      window.location.reload();
    };
    
    window.addEventListener('invalidateMoviesCache', handleCacheInvalidation);
    return () => window.removeEventListener('invalidateMoviesCache', handleCacheInvalidation);
  }, []);
  const [movies, setMovies] = useState(() => {
    // Try to get cached movies from sessionStorage on component init
    const cached = sessionStorage.getItem('cachedMovies');
    return cached ? JSON.parse(cached) : [];
  });
  const [openMovie, setOpenMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [viewingMovie, setViewingMovie] = useState(null); // For View Times modal
  const [viewingShowtimes, setViewingShowtimes] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(() => {
    // Only show loading if we don't have cached movies
    const cached = sessionStorage.getItem('cachedMovies');
    return !cached;
  });
  const [showWelcome, setShowWelcome] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // Manage welcome message visibility
  useEffect(() => {
    if (user) {
      const dismissed = localStorage.getItem(`welcome-dismissed-${user.email}`);
      setShowWelcome(!dismissed);
    } else {
      setShowWelcome(false);
    }
  }, [user]);

  // Fetch movies from backend
  useEffect(() => {
    async function fetchMovies() {
      try {
        // Check if we already have cached movies
        const cached = sessionStorage.getItem('cachedMovies');
        const cacheTime = sessionStorage.getItem('moviesCacheTime');
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // If cache is fresh (less than 5 minutes old), use cached data
        if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < fiveMinutes) {
          const cachedMovies = JSON.parse(cached);
          setMovies(cachedMovies);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        setLoading(true);
        const data = await api.movies();
        setMovies(data);
        
        // Cache the movies data
        sessionStorage.setItem('cachedMovies', JSON.stringify(data));
        sessionStorage.setItem('moviesCacheTime', Date.now().toString());
      } catch (e) {
        setToast('Failed to load movies: ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  async function openShowtimes(movie) {
    if (showWelcome && user) {
      dismissWelcome();
    }
    
    setOpenMovie(movie);
    try {
      const data = await api.showtimes(movie.id);
      setShowtimes(data);
      
      setTimeout(() => {
        const showtimesSection = document.getElementById('showtimes-section');
        if (showtimesSection) {
          showtimesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    } catch (e) {
      console.error('Failed to load showtimes for booking:', e);
      setToast('Failed to load showtimes: ' + e.message);
    }
  }

  // View showtimes in modal (View Times button)
  async function viewShowtimes(movie) {
    console.log('Viewing showtimes for movie:', movie);
    
    // Auto-dismiss welcome message when user starts interacting
    if (showWelcome && user) {
      dismissWelcome();
    }
    
    setViewingMovie(movie);
    try {
      const data = await api.showtimes(movie.id);
      setViewingShowtimes(data);
    } catch (e) {
      console.error('Failed to load showtimes for viewing:', e);
      setToast('Failed to load showtimes: ' + e.message);
    }
  }

  // Close view showtimes modal
  function closeViewShowtimes() {
    setViewingMovie(null);
    setViewingShowtimes([]);
  }

  // Book a seat
  async function book(showtime) {
    if (!token) {
      setToast('Please log in first to book tickets');
      return;
    }
    setToast('🎫 Processing your booking...');
    
    try {
      const seat = showtime.selectedSeat || 'A1';
      const movieId = showtime.movieId || openMovie?.id;
      const res = await api.book({
        token,
        movieId,
        showtimeId: showtime.id,
        seats: [seat]
      });

      const currentAvailableSeats = showtime.availableSeats || 50;
      const remainingSeats = Math.max(0, currentAvailableSeats - 1);
      
      // Enhanced booking confirmation message
      const formattedDate = new Date(showtime.showTime || showtime.startTime).toLocaleString('en-US', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get movie title from either openMovie (Book Ticket) or showtime.movie (View Times modal)
      const movieTitle = openMovie?.title || showtime.movie?.title || 'Unknown Movie';
      
      const confirmationMessage = `🎉 Booking Confirmed!\n\n` +
        `🎬 Movie: ${movieTitle}\n` +
        `📅 Date & Time: ${formattedDate}\n` +
        `🪑 Seat: ${seat}\n` +
        `🎫 Booking ID: ${res.bookingId || 'BOOK-' + Date.now()}\n` +
        `🎯 Remaining Seats: ${remainingSeats}\n\n` +
        `✅ Your ticket has been reserved successfully!`;
      
      showToast(confirmationMessage, 4000); // Show booking confirmation for 4 seconds
      
      setShowtimes(prevShowtimes =>
        prevShowtimes.map(s => 
          s.id === showtime.id 
            ? { ...s, availableSeats: remainingSeats }
            : s
        )
      );
      
      // Update viewing showtimes state if booking from modal
      if (showtime.movie) {
        setViewingShowtimes(prevShowtimes => 
          prevShowtimes.map(s => 
            s.id === showtime.id 
              ? { ...s, availableSeats: remainingSeats }
              : s
          )
        );
      }
      
      // Close the showtimes panel after successful booking
      setTimeout(() => {
        setOpenMovie(null);
        setShowtimes([]);
      }, 3000); // Increased timeout to give user more time to read confirmation
    } catch (e) {
      console.error('Booking failed:', e);
      setToast('Booking failed: ' + e.message);
    }
  }

  const showToast = (message, duration = 4000) => {
    setToast(message);
    setTimeout(() => setToast(''), duration);
  };

  // Dismiss welcome message
  const dismissWelcome = () => {
    if (user) {
      localStorage.setItem(`welcome-dismissed-${user.email}`, 'true');
    }
    setShowWelcome(false);
  };

  // Handle delete movie modal
  const handleDeleteClick = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteModal(true);
  };

  const confirmDeleteMovie = async () => {
    if (!movieToDelete) return;
    
    setShowDeleteModal(false);
    
    try {
      console.log('Deleting movie with ID:', movieToDelete.id);
      
      // Remove movie from state immediately for better UX
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieToDelete.id));
      
      // Call the API to delete the movie
      await api.deleteMovie({ token, movieId: movieToDelete.id });
      
      showToast('🎉 Movie deleted successfully!');
      
      // Reload movies from server to ensure consistency
      console.log('Reloading movies after deletion...');
      const updatedMovies = await api.movies();
      console.log('Updated movies list:', updatedMovies);
      setMovies(updatedMovies);
      
      // Update cache after deletion
      sessionStorage.setItem('cachedMovies', JSON.stringify(updatedMovies));
      sessionStorage.setItem('moviesCacheTime', Date.now().toString());
      
    } catch (error) {
      console.error('Failed to delete movie:', error);
      
      // Re-fetch movies on error to restore state
      try {
        const data = await api.movies();
        setMovies(data);
      } catch (fetchError) {
        console.error('Failed to reload movies after error:', fetchError);
      }
      
      showToast('Failed to delete movie: ' + error.message);
    } finally {
      setMovieToDelete(null);
    }
  };

  const cancelDeleteMovie = () => {
    setShowDeleteModal(false);
    setMovieToDelete(null);
  };


  return (
    <div className="container">
      <h1 style={{ marginBottom: 4 }}>Now Playing</h1>
      <p className="muted">Discover amazing movies and book your tickets instantly.</p>

      {/* Welcome message for authenticated users */}
      {user && showWelcome && (
        <div className="panel" style={{ 
          marginBottom: 24, 
          background: 'linear-gradient(135deg, var(--primary) 0%, #22d3ee 100%)', 
          color: 'white',
          position: 'relative'
        }}>
          {/* Close button */}
          <button
            onClick={dismissWelcome}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            title="Close welcome message"
          >
            ×
          </button>
          
          <h3 style={{ margin: 0, marginBottom: 8, paddingRight: '40px' }}>Welcome back, {user.email}!</h3>
          <p style={{ margin: 0, opacity: 0.9, marginBottom: 4 }}>Ready to book your next movie experience?</p>
          <div style={{ 
            display: 'inline-block', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '4px 8px', 
            borderRadius: '12px', 
            fontSize: '0.8em', 
            fontWeight: 'bold'
          }}>
            {user.role === 'ADMIN' ? '🔑 Administrator' : '🍿 User'}
          </div>
        </div>
      )}

      {/* Movie Cards Grid with Loading Skeletons */}
      <div className="grid">
        {loading ? (
          // Show skeleton cards while loading to maintain layout
          Array(6).fill(0).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className="panel"
              style={{
                minHeight: '400px',
                background: 'linear-gradient(90deg, var(--border) 25%, transparent 37%, var(--border) 63%)',
                backgroundSize: '400% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
                borderRadius: '8px'
              }}
            >
              {/* Skeleton content */}
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px 4px 0 0',
                marginBottom: '12px'
              }}></div>
              <div style={{
                height: '20px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                marginBottom: '8px',
                width: '80%'
              }}></div>
              <div style={{
                height: '16px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                marginBottom: '8px',
                width: '60%'
              }}></div>
              <div style={{
                height: '16px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                marginBottom: '16px',
                width: '40%'
              }}></div>
              <div style={{
                height: '36px',
                backgroundColor: 'var(--border)',
                borderRadius: '4px',
                width: '100%'
              }}></div>
            </div>
          ))
        ) : (
          // Show actual movie cards when loaded
          movies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onOpen={openShowtimes}  // Book Ticket
              onViewTimes={viewShowtimes}  // View Times
              token={token}
              user={user}
              onDeleteClick={user && user.role === 'ADMIN' ? handleDeleteClick : null}
            />
          ))
        )}
      </div>

      {/* No movies message */}
      {movies.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="muted">No movies available at the moment.</p>
        </div>
      )}

      {/* Showtimes Section - Moved above other sections */}
      {openMovie && (
        <div 
          id="showtimes-section" 
          style={{ 
            marginTop: 28,
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(124, 58, 237, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <h2 style={{ 
            marginBottom: 8,
            marginTop: 0,
            color: 'var(--primary, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🎬 {openMovie.title}
          </h2>
          <p style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--muted)', 
            fontSize: '0.9em' 
          }}>
            Select your preferred showtime and seat to book your ticket
          </p>
          <Showtimes showtimes={showtimes} onBook={book} token={token} />
        </div>
      )}

      {/* Movie Management Section - Only for ADMIN users */}
      {user && user.role === 'ADMIN' && (
        <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <div className="panel" style={{ 
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)', 
            border: '1px solid rgba(124, 58, 237, 0.2)',
            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.1)'
          }}>
            <h3 style={{ margin: 0, marginBottom: 16, color: 'var(--text)' }}>
              🎬 Admin Movie Management
            </h3>
            <p style={{ margin: 0, marginBottom: 20, color: 'var(--muted)', fontSize: '0.9em' }}>
              As an administrator, you can manage the complete movie catalog and showtimes.
            </p>
            
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <Link 
                to="/add-movie" 
                className="btn primary"
                style={{ 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ➕ Add New Movie
              </Link>
            </div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--warning-bg, rgba(245, 158, 11, 0.1))', 
                color: 'var(--warning, #f59e0b)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✏️ Click edit (✏️) on any movie card to modify its details
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--success-bg, rgba(34, 197, 94, 0.1))', 
                color: 'var(--success, #22c55e)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🕰️ Click manage showtimes (🕰️) to add/remove movie times
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--info-bg, rgba(59, 130, 246, 0.1))', 
                color: 'var(--info, #3b82f6)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🗑️ Click delete (🗑️) on any movie card to remove it
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information for regular users */}
      {user && user.role !== 'ADMIN' && (
        <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <div className="panel" style={{ 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
          }}>
            <h3 style={{ 
              margin: 0, 
              marginBottom: 16, 
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🍿 Movie Experience
            </h3>
            <p style={{ 
              margin: 0, 
              marginBottom: 16,
              color: 'var(--muted)', 
              fontSize: '0.9em',
              lineHeight: '1.5'
            }}>
              Explore our movie collection and book your tickets for the perfect cinema experience.
            </p>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--success-bg, rgba(34, 197, 94, 0.1))', 
                color: 'var(--success, #22c55e)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🎬 Click "View Times" to see all available showtimes
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--primary-bg, rgba(124, 58, 237, 0.1))', 
                color: 'var(--primary, #7c3aed)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🎫 Click "Book Ticket" to select seats and book instantly
              </div>
              <div style={{ 
                padding: '8px 12px', 
                background: 'var(--info-bg, rgba(59, 130, 246, 0.1))', 
                color: 'var(--info, #3b82f6)',
                borderRadius: '6px',
                fontSize: '0.85em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✨ Enjoy premium cinema experience with reserved seating
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Showtimes Modal */}
      {viewingMovie && (
        <ViewShowtimes 
          movie={viewingMovie}
          showtimes={viewingShowtimes}
          onClose={closeViewShowtimes}
          onBook={(showtime) => {
            // Close modal and book the showtime
            closeViewShowtimes();
            // Pass the movie information along with the showtime
            book({ ...showtime, movie: viewingMovie });
          }}
          token={token}
        />
      )}

      {/* Toast Messages */}
      {toast && (
        <div 
          className="toast" 
          style={{
            whiteSpace: 'pre-line',
            maxWidth: '400px',
            lineHeight: '1.5',
            textAlign: 'left'
          }}
        >
          {toast}
        </div>
      )}

      {/* Custom Delete Confirmation Modal - Centered on screen */}
      {showDeleteModal && movieToDelete && (
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
          onClick={cancelDeleteMovie}
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
                  Delete Movie
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
                Are you sure you want to delete <strong>"{movieToDelete.title}"</strong>? 
                This will permanently remove the movie and all its showtimes from the system.
              </p>
            </div>
            
            {/* Modal Actions */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDeleteMovie}
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
                onClick={confirmDeleteMovie}
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
                Delete Movie
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
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
      `}</style>
    </div>
  );
}
