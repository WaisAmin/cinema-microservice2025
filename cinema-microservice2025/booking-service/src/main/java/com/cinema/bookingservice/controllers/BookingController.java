package com.cinema.bookingservice.controllers;

import com.cinema.bookingservice.service.BookingService;
import com.cinema.bookingservice.dto.BookingDTO;
import com.cinema.bookingservice.dto.BookingResponse;
import com.cinema.bookingservice.entity.Booking;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

  private final BookingService bookingService;

  public BookingController(BookingService bookingService){
    this.bookingService = bookingService;
  }

  // Creates a new booking
  @PostMapping
  public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingDTO dto){
    Booking booking = bookingService.createBooking(dto);
    return ResponseEntity.ok(new BookingResponse(booking.getBookingId()));
  }

  //Retrieves booking
  @GetMapping
  public ResponseEntity<List<Booking>> getAll(){
    return ResponseEntity.ok(bookingService.getAllBookings());
  }

  //Retrieves a specific booking
  @GetMapping("/{bookingId}")
  public ResponseEntity<Booking> get(@PathVariable String bookingId){
    Booking booking = bookingService.getBooking(bookingId);
    if(booking == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(booking);
  }

  //Deletes booking by ID
  @DeleteMapping("/{bookingId}")
  public ResponseEntity<Void> cancel(@PathVariable String bookingId){
    bookingService.cancelBooking(bookingId);
    return ResponseEntity.noContent().build();
  }




}
