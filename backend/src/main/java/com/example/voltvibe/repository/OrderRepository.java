package com.example.voltvibe.repository;

import com.example.voltvibe.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
