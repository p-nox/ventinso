package com.example.order_service.controller;

import com.example.order_service.dto.*;
import com.example.order_service.service.OrderService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management, sales and purchases")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create order", description = "Create a new order based on the provided request data")
    public ResponseEntity<OrderConfirmedResponse> createOrder(@RequestBody OrderRequest request){
        OrderConfirmedResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get order by ID", description = "Retrieve detailed information of a specific order")
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "ID of the order") @PathVariable Long orderId){
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}/title")
    @Operation(summary = "Get order title by ID", description = "Retrieve only the title of a specific order")
    public ResponseEntity<OrderTitleResponse> getOrderTitleById(
            @Parameter(description = "ID of the order") @PathVariable Long orderId){
        OrderTitleResponse response = orderService.getOrderTitleById(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/sales")
    @Operation(summary = "Get sales", description = "Retrieve all orders where the user is the seller")
    public ResponseEntity<List<OrderResponse>> getAllOrdersAsSeller(
            @Parameter(description = "ID of the user (seller)") @PathVariable Long userId){
        List<OrderResponse> response = orderService.getAllOrdersAsSeller(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/purchases")
    @Operation(summary = "Get purchases", description = "Retrieve all orders where the user is the buyer")
    public ResponseEntity<List<OrderResponse>> getAllOrdersAsBuyer(
            @Parameter(description = "ID of the user (buyer)") @PathVariable Long userId){
        List<OrderResponse> response = orderService.getAllOrdersAsBuyer(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/confirm/{userId}")
    @Operation(summary = "Confirm order progress", description = "Confirm the progress of an order by user")
    public ResponseEntity<OrderProgressUpdateDto> confirmOrderProgress(
            @Parameter(description = "ID of the order") @PathVariable Long orderId,
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        OrderProgressUpdateDto response = orderService.confirmOrderProgress(orderId, userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{orderId}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an order by providing order ID and user ID")
    public ResponseEntity<OrderProgressUpdateDto> cancelOrder(
            @Parameter(description = "ID of the order") @PathVariable Long orderId,
            @Parameter(description = "ID of the user requesting cancel") @RequestParam Long userId) {
        OrderProgressUpdateDto response = orderService.cancelOrder(orderId, userId);
        return ResponseEntity.ok(response);
    }
}
