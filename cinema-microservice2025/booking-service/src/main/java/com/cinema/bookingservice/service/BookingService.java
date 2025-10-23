package com.cinema.bookingservice.service;

import com.cinema.bookingservice.dto.BookingDTO;
import com.cinema.bookingservice.entity.Booking;

import java.util.List;

public interface BookingService {
    Booking createBooking(BookingDTO dto);
    List<Booking> getAllBookings();
    Booking getBooking(String bookingId);
    void cancelBooking(String bookingId);
}
