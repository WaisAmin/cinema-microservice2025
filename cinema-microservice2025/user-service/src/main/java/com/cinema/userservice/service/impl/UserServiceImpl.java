package com.cinema.userservice.service.impl;

import com.cinema.userservice.dto.UserDTO;
import com.cinema.userservice.entity.RoleType;
import com.cinema.userservice.entity.User;
import com.cinema.userservice.repository.UserRepository;
import com.cinema.userservice.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User register(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        if(userDTO.getUsername()!=null){
            user.setUsername(userDTO.getUsername());
        }else {user.setUsername(userDTO.getEmail());}
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        
        // Set default role as USER (first user gets ADMIN role)
        long userCount = userRepository.count();
        user.setRole(userCount == 0 ? RoleType.ADMIN : RoleType.USER);
        
        return userRepository.save(user);
    }

    @Override
    public Optional<User> login(UserDTO userDTO) {
        return userRepository.findByEmail(userDTO.getEmail())
                .filter(u -> passwordEncoder.matches(userDTO.getPassword(), u.getPassword()));
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
