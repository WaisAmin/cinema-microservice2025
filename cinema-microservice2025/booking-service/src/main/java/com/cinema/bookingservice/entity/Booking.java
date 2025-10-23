package com.cinema.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bookingId; // UUID

    private Long movieId;
    private Long showtimeId;

    @ElementCollection
    private List<String> seats; // Booked seats

    private String status = "CONFIRMED";

    private LocalDateTime bookingTime = LocalDateTime.now();

}
