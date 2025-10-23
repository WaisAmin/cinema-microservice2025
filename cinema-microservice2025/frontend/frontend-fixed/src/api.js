const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function http(path, { method = "GET", token, body, isFormData = false } = {}) {
    const headers = {};
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        
        // Try to parse error response as JSON to extract user-friendly message
        let errorMessage = `${res.status} ${res.statusText}`;
        
        if (text) {
            try {
                const errorData = JSON.parse(text);
                // Extract user-friendly error message from various possible formats
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.details) {
                    errorMessage = errorData.details;
                } else {
                    errorMessage = `${res.status} ${res.statusText} – ${text}`;
                }
            } catch (parseError) {
                // If not valid JSON, show the raw text if it looks user-friendly
                if (text.length < 200 && !text.includes('<!DOCTYPE') && !text.includes('<html>')) {
                    errorMessage = text;
                } else {
                    errorMessage = `${res.status} ${res.statusText}`;
                }
            }
        }
        
        throw new Error(errorMessage);
    }
    
    // Handle responses with no content (204) or empty body
    if (res.status === 204) {
        return null;
    }
    
    // Check if response has content to parse as JSON
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        // If not JSON, try to get text content, or return null if empty
        const text = await res.text();
        return text || null;
    }
    
    // Try to parse as JSON, but handle empty responses gracefully
    const text = await res.text();
    if (!text || text.trim() === '') {
        return null;
    }
    
    try {
        return JSON.parse(text);
    } catch (error) {
        console.warn('Failed to parse JSON response:', text);
        return text; // Return as text if JSON parsing fails
    }
}

export const api = {
    // Fetch all movies (GET /movies)
    async movies() {
        try {
            return await http("/movies");
        } catch (error) {
            console.error('Failed to fetch movies:', error);
            throw error;
        }
    },

    // Fetch a specific movie by ID (GET /movies/:id)
    async getMovieById({ movieId }) {
        try {
            console.log('Fetching movie by ID:', movieId);
            // For now, we'll get all movies and filter by ID since there's no single movie endpoint
            const movies = await this.movies();
            const movie = movies.find(m => m.id === parseInt(movieId));
            if (!movie) {
                throw new Error('Movie not found');
            }
            console.log('Movie found:', movie);
            return movie;
        } catch (error) {
            console.error('Failed to fetch movie by ID:', error);
            throw error;
        }
    },

    // Fetch showtimes for a movie (GET /movies/:id/showtimes)
    async showtimes(movieId) {
        try {
            return await http(`/movies/${movieId}/showtimes`);
        } catch (error) {
            console.error('Failed to fetch showtimes:', error);
            throw error;
        }
    },

    // Register user
    register({ email, password }) {
        return http("/users/register", { method: "POST", body: { email, password } });
    },

    // Login user
    login({ email, password }) {
        return http("/users/login", { method: "POST", body: { email, password } });
    },

    // Get current user
    me(token) {
        return http("/users/me", { token });
    },

    // Book tickets
    book({ token, movieId, showtimeId, seats }) {
        console.log('=== API.book called ===');
        console.log('Booking parameters:', { movieId, showtimeId, seats });
        
        const bookingData = {
            movieId: parseInt(movieId),
            showtimeId: parseInt(showtimeId),
            seats: Array.isArray(seats) ? seats : [seats] // Ensure seats is an array
        };
        
        console.log('Booking data to send:', bookingData);
        
        return http("/bookings", {
            method: "POST",
            token,
            body: bookingData
        }).then(result => {
            console.log('Booking API response:', result);
            return result;
        }).catch(error => {
            console.error('Booking API error:', error);
            throw error;
        });
    },

    createMovie({ token, title, genre, durationMinutes, description }) {
        return http("/movies", {
            method: "POST",
            token,
            body: { title, genre, durationMinutes, description },
        });
    },


    updateMovie({ token, movieId, title, genre, durationMinutes, description }) {
        console.log('=== API.updateMovie called ===');
        console.log('Parameters:', { movieId, title, genre, durationMinutes, description });
        
        const movieData = {
            id: movieId,
            title,
            genre, 
            durationMinutes,
            description
        };
        
        console.log('Update movie data:', movieData);
        
        return http(`/movies/${movieId}`, {
            method: "PUT",
            token,
            body: movieData
        }).then(result => {
            console.log('Update movie response:', result);
            return result;
        }).catch(error => {
            console.error('Update movie error:', error);
            throw error;
        });
    },

    deleteMovie({ token, movieId }) {
        return http(`/movies/${movieId}`, {
            method: "DELETE",
            token
        });
    },

    addShowtime({ token, movieId, showTime, availableSeats }) {
        console.log('=== API.addShowtime called ===');
        console.log('Parameters:', { token: token ? 'Present' : 'Missing', movieId, showTime, availableSeats });
        
        const body = { movieId, showTime, availableSeats };
        console.log('Request body:', body);
        console.log('Making POST request to /movies/showtimes');
        
        return http("/movies/showtimes", {
            method: "POST",
            token,
            body
        }).then(result => {
            console.log('API response:', result);
            return result;
        }).catch(error => {
            console.error('API error:', error);
            throw error;
        });
    },

    deleteShowtime({ token, showtimeId }) {
        return http(`/movies/showtimes/${showtimeId}`, {
            method: "DELETE",
            token
        });
    },
};
