package com.cinema.userservice.service;

import com.cinema.userservice.dto.UserDTO;
import com.cinema.userservice.entity.User;

import java.util.Optional;

public interface UserService {
    User register(UserDTO userDTO);
    Optional<User> login(UserDTO userDTO);
    Optional<User> getUserByEmail(String email);
}
