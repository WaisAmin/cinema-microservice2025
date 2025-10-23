package com.cinema.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
@Data
public class BookingDTO {
    @NotNull private Long movieId;
    @NotNull private Long showtimeId;
    @NotNull private List<String> seats;

}


