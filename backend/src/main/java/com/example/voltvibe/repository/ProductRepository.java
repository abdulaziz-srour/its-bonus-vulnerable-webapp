package com.example.voltvibe.repository;

import com.example.voltvibe.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
