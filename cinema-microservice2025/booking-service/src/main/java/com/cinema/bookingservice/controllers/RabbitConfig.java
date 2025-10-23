package com.cinema.bookingservice.controllers;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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
    return new Queue("booking.created", true); // durable queue
  }


  @Bean
  public Jackson2JsonMessageConverter jsonMessageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  @Bean
  public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setMessageConverter(jsonMessageConverter());
    return template;
  }
  @Bean
  public Binding bindBookingCreatedQueue(Queue bookingCreatedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(bookingCreatedQueue).to(exchange).with("booking.created");
  }
}
