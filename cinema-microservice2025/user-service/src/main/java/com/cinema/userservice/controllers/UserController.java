package com.cinema.userservice.controllers;

import com.cinema.userservice.dto.UserDTO;
import com.cinema.userservice.entity.User;
import com.cinema.userservice.repository.UserRepository;
import com.cinema.userservice.security.JwtUtil;
import com.cinema.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO req) {
        try {
            User savedUser = userService.register(req);
            return ResponseEntity.ok(Map.of(
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole().toString()
            ));
        } catch (Exception e) {
            String message = e instanceof RuntimeException ex ? ex.getMessage() : e.getMessage();
            return ResponseEntity.status(500).body(Map.of("error", message));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        return userService.login(userDTO)
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getEmail());
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", Map.of(
                                    "email", u.getEmail(),
                                    "role", u.getRole().toString()
                            )
                    ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        String email = jwtUtil.validateTokenAndGetEmail(auth.substring(7));
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        // Get user details including role
        return userService.getUserByEmail(email)
                .map(user -> ResponseEntity.ok(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().toString()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of("error", "User not found")));
    }
}
