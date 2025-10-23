import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api.js';

export default function MovieCard({ movie, onOpen, onViewTimes, token, user, onDelete, onDeleteClick }) {
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Generate a consistent color based on movie title
    const cardColor = useMemo(() => {
        const colors = [
            '#4F87CC',
            '#5CB85C',
            '#B85CB8',
            '#5CBCB8',
            '#CC7F4F',
            '#6B5CB8',
            '#B84F87',
            '#87B84F'
        ];
        
        // Use title to generate consistent color index
        const hash = movie.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }, [movie.title]);


    const handleDeleteClick = () => {
        if (!token || !onDeleteClick) return;
        onDeleteClick(movie);
    };

    return (
        <div className="card">
            {/* Colored Card Header */}
            <div 
                style={{
                    width: '100%',
                    aspectRatio: '2.8/3', // Reduced height by ~30% (was 2/3, now 2.8/3)
                    backgroundColor: cardColor,
                    borderRadius: 12,
                    marginBottom: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '15px', // Reduced padding slightly
                    position: 'relative'
                }}
            >
                <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.3rem', // Slightly smaller font
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {movie.title}
                </h2>
                <div style={{ 
                    margin: '8px 0 0 0',
                    padding: '3px 8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(4px)'
                }}>
                    {movie.genre}
                </div>
            </div>
            
            <h3 style={{ 
                marginBottom: 8, 
                color: 'var(--text)', 
                fontSize: '1.1rem',
                fontWeight: '600' 
            }}>
                {movie.title}
            </h3>
            <div style={{ 
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: 'var(--primary-bg, rgba(124, 58, 237, 0.1))',
                color: 'var(--primary, #7c3aed)',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: 12,
                border: '1px solid var(--primary-border, rgba(124, 58, 237, 0.2))'
            }}>
                {movie.genre}
            </div>
            <p className="description" style={{ 
                color: 'var(--text-secondary, var(--muted))',
                lineHeight: '1.4',
                fontSize: '0.9rem'
            }}>
                {movie.description}
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={() => onOpen(movie)} style={{ flex: 1 }}>
                    Book Ticket
                </button>
                <button className="btn" onClick={() => onViewTimes ? onViewTimes(movie) : onOpen(movie)} style={{ padding: '10px' }}>
                    View Times
                </button>
                {user && user.role === 'ADMIN' && (
                    <>
                        <Link 
                            to={`/edit-movie/${movie.id}`}
                            className="btn"
                            style={{ 
                                textDecoration: 'none',
                                padding: '10px',
                                backgroundColor: 'var(--warning, #f59e0b)',
                                color: 'white',
                                border: 'none'
                            }}
                            title="Edit Movie"
                        >
                            ✏️
                        </Link>
                        <Link 
                            to={`/manage-showtimes/${movie.id}`}
                            className="btn"
                            style={{ 
                                textDecoration: 'none',
                                padding: '10px',
                                backgroundColor: 'var(--info, #3b82f6)',
                                color: 'white',
                                border: 'none'
                            }}
                            title="Manage Showtimes"
                        >
                            🕰️
                        </Link>
                        <button 
                            className="btn danger" 
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            style={{ 
                                padding: '10px',
                                backgroundColor: 'var(--danger, #ef4444)',
                                color: 'white',
                                border: 'none',
                                opacity: isDeleting ? 0.6 : 1
                            }}
                            title="Delete Movie"
                        >
                            {isDeleting ? '...' : '🗑️'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
