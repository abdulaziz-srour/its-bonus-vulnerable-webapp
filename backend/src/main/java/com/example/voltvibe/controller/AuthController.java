package com.example.voltvibe.controller;

import com.example.voltvibe.model.User;
import com.example.voltvibe.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final UserRepository userRepository;
    
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        Map<String, Object> response = new HashMap<>();
        User user = userRepository.findByUsername(username);
        
        if (user != null && user.getPassword().equals(password)) {
            response.put("token", "fake-jwt-token-" + user.getId() + "-" + user.getRole());
            response.put("user", user);
        } else {
            response.put("error", "Invalid credentials");
        }
        return response;
    }
}
