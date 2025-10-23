package com.cinema.movieservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class ShowtimeDTO {
    private Long id;
    private LocalDateTime startTime;
    private Long movieId;
    private String showTime; // For API compatibility
    private int availableSeats;
}
