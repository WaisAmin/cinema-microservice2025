package com.cinema.movieservice.dto;

import lombok.Data;

import java.util.List;
@Data
public class MovieDTO {
    private Long id;
    private String title;
    private String genre;
    private String description;
    private int durationMinutes;
    private List<ShowtimeDTO> showtimes;
}
