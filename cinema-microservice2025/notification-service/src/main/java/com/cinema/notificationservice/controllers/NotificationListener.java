package com.cinema.notificationservice.controllers;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class NotificationListener {

  // This will automatically receive JSON from RabbitMQ and convert it into a Map
  @RabbitListener(queues = "payment.completed.queue")
  public void onPayment(Map<String, Object> evt) {
    System.out.println("🔔 NOTIFY: Booking ID " + evt.get("bookingId") + " -> Status: " + evt.get("status"));
  }
}
