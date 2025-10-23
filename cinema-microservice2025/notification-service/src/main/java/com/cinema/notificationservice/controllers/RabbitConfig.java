package com.cinema.notificationservice.controllers;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

  // Topic exchange used for communication between services
  @Bean
  public TopicExchange exchange() {
    return new TopicExchange("cinema.exchange");
  }

  // Queue to listen for payment completion messages
  @Bean
  public Queue paymentCompletedQueue() {
    return new Queue("payment.completed.queue", true);
  }

  // Binding connects queue with exchange using a routing key
  @Bean
  public Binding bindPaymentCompleted(Queue paymentCompletedQueue, TopicExchange exchange) {
    return BindingBuilder.bind(paymentCompletedQueue)
            .to(exchange)
            .with("payment.completed");
  }

  // JSON converter (Jackson) to automatically serialize/deserialize messages
  @Bean
  public Jackson2JsonMessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
  }

  // RabbitTemplate (used if this service ever needs to send messages)
  @Bean
  public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                       Jackson2JsonMessageConverter messageConverter) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setMessageConverter(messageConverter);
    return template;
  }

  @Bean
  public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
          ConnectionFactory connectionFactory,
          Jackson2JsonMessageConverter messageConverter) {

    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(connectionFactory);
    factory.setMessageConverter(messageConverter);
    return factory;
  }
}
