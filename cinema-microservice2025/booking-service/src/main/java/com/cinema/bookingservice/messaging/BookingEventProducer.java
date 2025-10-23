package com.cinema.bookingservice.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class BookingEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public BookingEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendBookingCreatedEvent(Map<String, Object> event) {
        rabbitTemplate.convertAndSend("cinema.exchange", "booking.created", event);
    }
}
