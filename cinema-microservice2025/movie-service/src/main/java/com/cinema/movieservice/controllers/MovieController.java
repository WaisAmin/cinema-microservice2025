package com.cinema.movieservice.controllers;

import com.cinema.movieservice.Services.MovieService;
import com.cinema.movieservice.dto.MovieDTO;
import com.cinema.movieservice.dto.ShowtimeDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
public class MovieController {

  private final MovieService movieService;

  public MovieController(MovieService movieService) {
    this.movieService = movieService;
  }

  // Get all movies
  @GetMapping
  public ResponseEntity<List<MovieDTO>> getAllMovies() {
    List<MovieDTO> movies = movieService.getAllMovies();
    return ResponseEntity.ok(movies);
  }

  // Get showtimes for a specific movie
  @GetMapping("/{movieId}/showtimes")
  public ResponseEntity<List<ShowtimeDTO>> getShowtimes(@PathVariable("movieId") Long movieId) {
    List<ShowtimeDTO> showtimes = movieService.getShowtimesByMovie(movieId);
    return ResponseEntity.ok(showtimes);
  }

  // Add a new movie
  @PostMapping
  public ResponseEntity<MovieDTO> addMovie(@RequestBody MovieDTO movieDTO) {
    MovieDTO saved = movieService.saveMovie(movieDTO);
    return ResponseEntity.ok(saved);
  }
  
  // Update an existing movie
  @PutMapping("/{movieId}")
  public ResponseEntity<MovieDTO> updateMovie(@PathVariable Long movieId, @RequestBody MovieDTO movieDTO) {
    MovieDTO updated = movieService.updateMovie(movieId, movieDTO);
    return ResponseEntity.ok(updated);
  }

  @GetMapping("/showtimes/{showtimeId}/available-seats")
  public ResponseEntity<Integer> getAvailableSeats(@PathVariable Long showtimeId) {
    int availableSeats = movieService.getAvailableSeats(showtimeId);
    return ResponseEntity.ok(availableSeats);
  }

  // Add a new showtime
  @PostMapping("/showtimes")
  public ResponseEntity<ShowtimeDTO> addShowtime(@RequestBody ShowtimeDTO showtimeDTO) {
    ShowtimeDTO saved = movieService.addShowtime(showtimeDTO);
    return ResponseEntity.ok(saved);
  }

  // Delete a showtime
  @DeleteMapping("/showtimes/{showtimeId}")
  public ResponseEntity<Void> deleteShowtime(@PathVariable Long showtimeId) {
    movieService.deleteShowtime(showtimeId);
    return ResponseEntity.ok().build();
  }

  // Delete a movie
  @DeleteMapping("/{movieId}")
  public ResponseEntity<Void> deleteMovie(@PathVariable Long movieId) {
    movieService.deleteMovie(movieId);
    return ResponseEntity.ok().build();
  }
}
