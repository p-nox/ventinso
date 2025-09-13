package com.example.order_service.repository;

import com.example.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByBuyerId(Long buyerId);

    List<Order> findAllBySellerId(Long sellerId);

    @Modifying
    @Query("UPDATE Order o SET o.paidAt = :paidAt WHERE o.id = :orderId")
    int updatePaidAtById(@Param("orderId") Long orderId, @Param("paidAt") LocalDateTime paidAt);

}
