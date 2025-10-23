package com.cinema.paymentservice.controllers;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

  @Bean
  public TopicExchange exchange() {
    return new TopicExchange("cinema.exchange");
  }

  @Bean
  public Queue bookingCreatedQueue() {
    return new Queue("booking.created.queue", true);
  }

  @Bean
  public Queue paymentCompletedQueue() {
    return new Queue("payment.completed.queue", true);
  }

  @Bean
  public Binding bindBookingCreated(Queue bookingCreatedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(bookingCreatedQueue)
            .to(exchange)
            .with("booking.created");
  }

  @Bean
  public Binding bindPaymentCompleted(Queue paymentCompletedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(paymentCompletedQueue)
            .to(exchange)
            .with("payment.completed.queue");
  }

  @Bean
  public Jackson2JsonMessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                       Jackson2JsonMessageConverter messageConverter) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setMessageConverter(messageConverter);
    return template;
  }
}
