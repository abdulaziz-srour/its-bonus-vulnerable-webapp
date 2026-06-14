package com.example.voltvibe.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class DiscountController {
    
    private final JdbcTemplate jdbcTemplate;
    
    public DiscountController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/discount")
    public Map<String, Object> checkDiscount(@RequestParam String code) {
        Map<String, Object> response = new HashMap<>();
        String query = "SELECT code, percentage FROM discounts WHERE code = '" + code + "'";
        try {
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query);
            if (results.isEmpty()) {
                response.put("error", "Invalid discount code");
            } else {
                response.put("percentage", results.get(0).get("percentage"));
            }
        } catch (Exception e) {
            response.put("error", "Server error");
        }
        return response;
    }
}
