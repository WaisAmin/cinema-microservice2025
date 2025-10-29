package com.cinema.movieservice.Services.impl;

import com.cinema.movieservice.Entity.Movie;
import com.cinema.movieservice.Entity.Showtime;
import com.cinema.movieservice.Services.MovieService;
import com.cinema.movieservice.dto.MovieDTO;
import com.cinema.movieservice.dto.ShowtimeDTO;
import com.cinema.movieservice.repository.MovieRepository;
import com.cinema.movieservice.repository.ShowtimeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;

    public MovieServiceImpl(MovieRepository movieRepository, ShowtimeRepository showtimeRepository) {
        this.movieRepository = movieRepository;
        this.showtimeRepository = showtimeRepository;
    }

    //Retrieve all movies with their showtimes
    @Override
    public List<MovieDTO> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(this::toMovieDTO)
                .collect(Collectors.toList());
    }

    //Retrieve all showtimes for a specific movie by its ID
    @Override
    public List<ShowtimeDTO> getShowtimesByMovie(Long movieId) {
        return showtimeRepository.findByMovieId(movieId)
                .stream()
                .map(this::toShowtimeDTO)
                .collect(Collectors.toList());
    }

    // Mapping: Movie -> MovieDTO
    private MovieDTO toMovieDTO(Movie movie) {
        MovieDTO dto = new MovieDTO();
        dto.setId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setGenre(movie.getGenre());
        dto.setDescription(movie.getDescription());
        dto.setDurationMinutes(movie.getDurationMinutes());

        List<ShowtimeDTO> showtimeDTOs = movie.getShowtimes()
                .stream()
                .map(this::toShowtimeDTO)
                .collect(Collectors.toList());
        dto.setShowtimes(showtimeDTOs);

        return dto;
    }

    // Mapping: Showtime -> ShowtimeDTO
    private ShowtimeDTO toShowtimeDTO(Showtime showtime) {
        ShowtimeDTO dto = new ShowtimeDTO();
        dto.setId(showtime.getId());
        dto.setStartTime(showtime.getStartTime());
        dto.setShowTime(showtime.getStartTime().toString()); // For API compatibility
        dto.setMovieId(showtime.getMovie().getId());
        dto.setAvailableSeats(showtime.getAvailableSeats());
        return dto;
    }

    // Mapping: MovieDTO -> Movie (for create/update operations)
    public Movie toMovieEntity(MovieDTO dto) {
        Movie movie = new Movie();
        movie.setId(dto.getId());
        movie.setTitle(dto.getTitle());
        movie.setGenre(dto.getGenre());
        movie.setDescription(dto.getDescription());
        movie.setDurationMinutes(dto.getDurationMinutes());

        // Safe mapping: avoid NullPointerException
        List<Showtime> showtimes = dto.getShowtimes() != null
                ? dto.getShowtimes()
                .stream()
                .map(showDTO -> {
                    Showtime s = toShowtimeEntity(showDTO);
                    s.setMovie(movie); // set back-reference
                    return s;
                })
                .collect(Collectors.toList())
                : List.of(); // empty list if null

        movie.setShowtimes(showtimes);

        return movie;
    }


    // Mapping: ShowtimeDTO -> Showtime
    public Showtime toShowtimeEntity(ShowtimeDTO dto) {
        Showtime showtime = new Showtime();
        showtime.setId(dto.getId());
        showtime.setStartTime(dto.getStartTime());
        showtime.setAvailableSeats(dto.getAvailableSeats());
        return showtime;
    }

    //Create and save a new movie in the database
    @Override
    public MovieDTO saveMovie(MovieDTO movieDTO) {
        Movie movie = toMovieEntity(movieDTO);
        Movie saved = movieRepository.save(movie);
        return toMovieDTO(saved);
    }

    //Update an existing movie by its ID
    @Override
    public MovieDTO updateMovie(Long movieId, MovieDTO movieDTO) {
        System.out.println("=== MovieService.updateMovie ===");
        System.out.println("Movie ID: " + movieId);
        System.out.println("Input DTO: " + movieDTO);
        
        // Check if movie exists
        if (!movieRepository.existsById(movieId)) {
            throw new RuntimeException("Movie not found with ID: " + movieId);
        }
        
        // Set the ID to ensure we're updating the correct movie
        movieDTO.setId(movieId);
        
        // Convert to entity and save
        Movie movie = toMovieEntity(movieDTO);
        Movie updated = movieRepository.save(movie);
        
        System.out.println("Updated movie: " + updated.getTitle());
        
        return toMovieDTO(updated);
    }

    //Get the number available seats for a showtime
@Override
    public int getAvailableSeats(Long showtimeId) {
        return showtimeRepository.findById(showtimeId)
                .map(Showtime::getAvailableSeats)
                .orElseThrow(() -> new RuntimeException("Showtime not found"));
    }

    //Add a new showtime for an existing movie
    
    @Override
    public ShowtimeDTO addShowtime(ShowtimeDTO showtimeDTO) {
        System.out.println("=== MovieService.addShowtime ===");
        System.out.println("Input DTO: " + showtimeDTO);
        
        // Find the movie
        Movie movie = movieRepository.findById(showtimeDTO.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + showtimeDTO.getMovieId()));
        
        System.out.println("Found movie: " + movie.getTitle());
        
        // Create showtime entity
        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        
        // Parse showTime string to LocalDateTime
        LocalDateTime showDateTime;
        if (showtimeDTO.getShowTime() != null && !showtimeDTO.getShowTime().isEmpty()) {
            System.out.println("Parsing showTime string: " + showtimeDTO.getShowTime());
            try {
                showDateTime = LocalDateTime.parse(showtimeDTO.getShowTime());
                System.out.println("Parsed datetime: " + showDateTime);
            } catch (Exception e) {
                System.err.println("Failed to parse showTime: " + e.getMessage());
                throw new RuntimeException("Invalid showTime format: " + showtimeDTO.getShowTime());
            }
        } else if (showtimeDTO.getStartTime() != null) {
            showDateTime = showtimeDTO.getStartTime();
        } else {
            throw new RuntimeException("No valid time provided");
        }
        
        showtime.setStartTime(showDateTime);
        showtime.setAvailableSeats(showtimeDTO.getAvailableSeats());
        
        System.out.println("Saving showtime entity: " + showtime);
        
        // Save showtime
        Showtime saved = showtimeRepository.save(showtime);
        
        System.out.println("Saved showtime entity: " + saved);
        
        // Return DTO
        ShowtimeDTO result = toShowtimeDTO(saved);
        System.out.println("Returning DTO: " + result);
        
        return result;
    }

    //Delete a showtime by ID
    @Override
    public void deleteShowtime(Long showtimeId) {
        if (!showtimeRepository.existsById(showtimeId)) {
            throw new RuntimeException("Showtime not found");
        }
        showtimeRepository.deleteById(showtimeId);
    }

    //Delete a movie by its ID
    @Override
    public void deleteMovie(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new RuntimeException("Movie not found");
        }
        // This will cascade delete showtimes due to the @OneToMany relationship
        movieRepository.deleteById(movieId);
    }

}
