package com.cinema.paymentservice.controllers;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class PaymentEventProducer {
    private final RabbitTemplate rabbitTemplate;

    public PaymentEventProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendPaymentCompletedEvent(Map<String, Object> event) {
        rabbitTemplate.convertAndSend("cinema.exchange", "payment.completed.queue", event);
    }
}
