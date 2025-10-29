package com.cinema.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    //Configures and registers a global CORS
    @Bean
    public CorsWebFilter corsWebFilter() {
        System.out.println("=== CORS Configuration Loading ===");

        //Create a new CORS configuration object
        CorsConfiguration config = new CorsConfiguration();
        //Add frontend URLs or containerized service hosts here
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://frontend:80"));
        //Allowed HTTP methods for cross-origin requests
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        //Allow all headers
        config.setAllowedHeaders(List.of("*"));
        //Allow cookies and authorization headers in cross-origin requests
        config.setAllowCredentials(true);
        //Cache preflight responses for 1 hour to reduce OPTION calls
        config.setMaxAge(3600L);
        //Register configuration for all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        //Return the configured CORS WebFilter bean
        System.out.println("=== CORS Configuration Applied ===");
        return new CorsWebFilter(source);
    }
}
