package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CartItemDTO;
import com.example.vuvisa.dtos.responses.CartResponse;
import com.example.vuvisa.services.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix}/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public APIResponse<?> getCartByUserId(@PathVariable Long userId) {
        try {
            CartResponse cartResponse = cartService.getCartByUserId(userId);
            return APIResponse.builder()
                    .message("Cart retrieved successfully")
                    .result(cartResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error retrieving cart: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/{userId}/items")
    public APIResponse<?> addItemToCart(@PathVariable Long userId, @RequestBody CartItemDTO cartItemDTO) {
        try {
            CartResponse cartResponse = cartService.addItemToCart(userId, cartItemDTO);
            return APIResponse.builder()
                    .message("Item added to cart successfully")
                    .result(cartResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error adding item to cart: " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{userId}/items/{productId}")
    public APIResponse<?> updateCartItem(@PathVariable Long userId, @PathVariable Long productId, @RequestParam Long quantity) {
        try {
            CartResponse cartResponse = cartService.updateCartItem(userId, productId, quantity);
            return APIResponse.builder()
                    .message("Cart item updated successfully")
                    .result(cartResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error updating cart item: " + e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public APIResponse<?> removeItemFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            CartResponse cartResponse = cartService.removeItemFromCart(userId, productId);
            return APIResponse.builder()
                    .message("Item removed from cart successfully")
                    .result(cartResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error removing item from cart: " + e.getMessage())
                    .build();
        }
    }

    @DeleteMapping("/{userId}")
    public APIResponse<?> clearCart(@PathVariable Long userId) {
        try {
            cartService.clearCart(userId);
            return APIResponse.builder()
                    .message("Cart cleared successfully")
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error clearing cart: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/{userId}/checkout")
    public APIResponse<?> checkout(@PathVariable Long userId) {
        try {
            CartResponse cartResponse = cartService.checkout(userId);
            return APIResponse.builder()
                    .message("Checkout successful")
                    .result(cartResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error during checkout: " + e.getMessage())
                    .build();
        }
    }
}
