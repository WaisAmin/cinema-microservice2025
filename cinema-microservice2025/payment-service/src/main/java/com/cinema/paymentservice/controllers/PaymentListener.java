package com.cinema.paymentservice.controllers;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class PaymentListener {

  private final RabbitTemplate rabbit;
  private final RestTemplate restTemplate = new RestTemplate();

  public PaymentListener(RabbitTemplate rabbit) {
    this.rabbit = rabbit;
  }

  // ✅ Match queue name from RabbitConfig
  @RabbitListener(queues = "booking.created.queue")
  public void onBookingCreated(Map<String, Object> evt) {
    System.out.println("📩 Received booking event: " + evt);


    String bookingId = (String) evt.get("bookingId");
    int movieId = (int) evt.get("movieId");

    //  If movieId starts with "FAIL" → simulate payment failure
    boolean ok = movieId!=1;

    if (ok) {
      // ✅ Send payment success message to RabbitMQ
      Map<String, Object> out = new HashMap<>();
      out.put("type", "payment.completed");
      out.put("bookingId", bookingId);
      out.put("status", "OK");
      rabbit.convertAndSend("cinema.exchange", "payment.completed.queue", out);
      System.out.println("✅ Payment succeeded for booking: " + bookingId);
    } else {
      // ❌ Simulate payment failure — call booking cancellation API directly
      try {
        String cancelUrl = "http://booking-service:8083/bookings/" + bookingId;
        restTemplate.delete(cancelUrl);
        System.out.println("❌ Payment failed — booking cancelled: " + bookingId);
      } catch (Exception e) {
        System.err.println("⚠️ Failed to call booking cancellation API: " + e.getMessage());
      }
    }
  }
}
