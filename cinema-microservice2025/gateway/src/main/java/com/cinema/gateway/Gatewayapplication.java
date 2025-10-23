package com.cinema.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.cinema.gateway")
public class Gatewayapplication {
  public static void main(String[] args) {
    SpringApplication.run(Gatewayapplication.class, args);
  }
}
