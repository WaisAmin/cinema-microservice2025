package com.cinema.bookingservice.service.impl;

import com.cinema.bookingservice.dto.BookingDTO;
import com.cinema.bookingservice.entity.Booking;
import com.cinema.bookingservice.repository.BookingRepository;
import com.cinema.bookingservice.messaging.BookingEventProducer;
import com.cinema.bookingservice.service.BookingService;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.*;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingEventProducer eventProducer;
    private final RestTemplate restTemplate;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              BookingEventProducer eventProducer,
                              RestTemplate restTemplate) {
        this.bookingRepository = bookingRepository;
        this.eventProducer = eventProducer;
        this.restTemplate = restTemplate;
    }

    //Creates a new booking and processes payment
    @Override
    public Booking createBooking(BookingDTO dto) {
        String bookingId = UUID.randomUUID().toString();
        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setMovieId(dto.getMovieId());
        booking.setShowtimeId(dto.getShowtimeId());
        booking.setSeats(dto.getSeats());
        booking.setStatus("PENDING");

        booking = bookingRepository.save(booking);

        // ---- REST CALL to Payment Service ----
        try {
            String paymentUrl = "http://payment-service:8084/payments/process"; // for Docker
            // Or use localhost if running locally:
            // String paymentUrl = "http://localhost:8082/payments/process";

            Map<String, Object> paymentRequest = new HashMap<>();
            paymentRequest.put("bookingId", bookingId);
            paymentRequest.put("amount", dto.getSeats().size() * 10); // example rate

            ResponseEntity<String> response = restTemplate.postForEntity(paymentUrl, paymentRequest, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                booking.setStatus("CONFIRMED");
                bookingRepository.save(booking);

                // Publish booking.created event (only if successful)
                var event = new HashMap<String, Object>();
                event.put("type", "booking.created");
                event.put("bookingId", bookingId);
                event.put("movieId", dto.getMovieId());
                event.put("showtimeId", dto.getShowtimeId());
                event.put("seats", dto.getSeats());
                eventProducer.sendBookingCreatedEvent(event);
            } else {
                // Payment failed
                cancelBooking(bookingId);
            }
        } catch (Exception e) {
            // Handle payment service failure
            cancelBooking(bookingId);
        }

        return booking;
    }

    //Returns all bookings from database

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    //Finds a booking by its ID
    @Override
    public Booking getBooking(String bookingId) {
        return bookingRepository.findByBookingId(bookingId).orElse(null);
    }

    //Cancels a booking by setting its status to CANCELLED
    @Override
    public void cancelBooking(String bookingId) {
        bookingRepository.findByBookingId(bookingId).ifPresent(b -> {
            b.setStatus("CANCELLED");
            bookingRepository.save(b);
        });
    }
}
