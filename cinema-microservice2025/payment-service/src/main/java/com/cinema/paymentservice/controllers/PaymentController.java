package com.cinema.paymentservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Random;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentEventProducer eventProducer;

    public PaymentController(PaymentEventProducer eventProducer) {
        this.eventProducer = eventProducer;
    }

    @PostMapping("/process")
    public ResponseEntity<String> processPayment(@RequestBody Map<String, Object> payload) {
        String bookingId = (String) payload.get("bookingId");
        Double amount = Double.valueOf(payload.get("amount").toString());

        // Simulate payment success/failure
        boolean success = new Random().nextBoolean();

        if (success) {
            // send event to queue
            Map<String, Object> event = new HashMap<>();
            event.put("type", "payment.completed.queue");
            event.put("bookingId", bookingId);
            event.put("amount", amount);
            eventProducer.sendPaymentCompletedEvent(event);
            return ResponseEntity.ok("Payment successful for booking " + bookingId);
        } else {
            return ResponseEntity.status(400).body("Payment failed for booking " + bookingId);
        }
    }
}
