package com.cinema.bookingservice.dto;

import lombok.Data;

@Data
public class BookingResponse {
    private String bookingId;
    public BookingResponse(String bookingId){ this.bookingId = bookingId; }
    public String getBookingId(){ return bookingId; }
}