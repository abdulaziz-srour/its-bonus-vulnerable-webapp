package com.example.voltvibe.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    private final JdbcTemplate jdbcTemplate;
    
    public ProductController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchProducts(@RequestParam String q) {
        String query = "SELECT id, name, description, price, image_url FROM products WHERE name LIKE '%" + q + "%'";
        return jdbcTemplate.queryForList(query);
    }

    @GetMapping("/preview")
    public String previewExternalSpec(@RequestParam String url) {
        try {
            java.net.URL targetUrl = new java.net.URL(url);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) targetUrl.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);
            
            java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine).append("\n");
            }
            in.close();
            conn.disconnect();
            return content.toString();
        } catch (Exception e) {
            return "Fehler beim Laden der externen Spezifikation: " + e.getMessage();
        }
    }
    
    @GetMapping
    public List<Map<String, Object>> getAllProducts() {
        return jdbcTemplate.queryForList("SELECT * FROM products");
    }
}
