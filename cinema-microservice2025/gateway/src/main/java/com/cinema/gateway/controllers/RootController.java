package com.cinema.gateway.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {
  @GetMapping("/")
  public String hello(){ return "Cinema Gateway is up"; }
}
