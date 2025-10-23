package com.cinema.userservice.configuration;

import com.cinema.userservice.entity.RoleType;
import com.cinema.userservice.entity.User;
import com.cinema.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository repository;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@gmail.com";
        Optional<User> optional = repository.findByEmail(adminEmail);
        if (optional.isEmpty()) {
            String password = new BCryptPasswordEncoder(12).encode("admin123");
            User admin = new User(null, adminEmail, password, "admin", RoleType.ADMIN);
            repository.save(admin);
            System.out.println("Default admin user created with email: " + adminEmail);
        } else {
            System.out.println("Admin user already exists, Skipping creation...");
        }
    }
}
