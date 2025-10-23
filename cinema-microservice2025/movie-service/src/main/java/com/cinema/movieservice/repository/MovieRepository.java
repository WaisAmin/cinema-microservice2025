package com.cinema.movieservice.repository;


import com.cinema.movieservice.Entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieRepository extends JpaRepository<Movie, Long> {
}
