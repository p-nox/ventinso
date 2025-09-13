package com.example.user_service.repository;

import com.example.user_service.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByRevieweeId(Long revieweeId);

    Rating findByOrderId(Long orderId);

}
