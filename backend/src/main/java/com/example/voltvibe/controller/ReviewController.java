package com.example.voltvibe.controller;

import com.example.voltvibe.model.Review;
import com.example.voltvibe.repository.ReviewRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private final ReviewRepository reviewRepository;
    
    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getReviews(@PathVariable Long id) {
        return reviewRepository.findByProductId(id);
    }

    @PostMapping("/{id}/reviews")
    public Review addReview(@PathVariable Long id, @RequestBody Review review) {
        review.setProductId(id);
        return reviewRepository.save(review);
    }
}
