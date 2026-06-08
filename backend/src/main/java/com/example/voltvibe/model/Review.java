package com.example.voltvibe.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long productId;
    private String username;
    
    @Column(columnDefinition = "TEXT")
    private String text;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
