package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CartItemDTO;
import com.example.vuvisa.dtos.responses.CartResponse;

import java.util.List;

public interface CartService {
    CartResponse getCartByUserId(Long userId);
    CartResponse addItemToCart(Long userId, CartItemDTO cartItemDTO);
    CartResponse updateCartItem(Long userId, Long productId, Long quantity);
    CartResponse removeItemFromCart(Long userId, Long productId);
    void clearCart(Long userId);
    CartResponse checkout(Long userId);
}