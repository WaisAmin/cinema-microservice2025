package com.cinema.movieservice.Services;

import com.cinema.movieservice.Entity.Movie;
import com.cinema.movieservice.Entity.Showtime;
import com.cinema.movieservice.dto.MovieDTO;
import com.cinema.movieservice.dto.ShowtimeDTO;

import java.util.List;

public interface MovieService {

    List<MovieDTO> getAllMovies();

    List<ShowtimeDTO> getShowtimesByMovie(Long movieId);

    MovieDTO saveMovie(MovieDTO movieDTO);
    
    MovieDTO updateMovie(Long movieId, MovieDTO movieDTO);

    int getAvailableSeats(Long showtimeId);
    
    ShowtimeDTO addShowtime(ShowtimeDTO showtimeDTO);
    
    void deleteShowtime(Long showtimeId);
    
    void deleteMovie(Long movieId);
}
