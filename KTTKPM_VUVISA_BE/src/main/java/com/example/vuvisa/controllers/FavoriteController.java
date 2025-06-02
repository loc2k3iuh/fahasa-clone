package com.example.vuvisa.controllers;

import com.example.vuvisa.dtos.requests.FavoriteRequest;
import com.example.vuvisa.dtos.responses.FavoriteResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.services.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<FavoriteResponse> addFavorite(@Valid @RequestBody FavoriteRequest request) {
        FavoriteResponse response = favoriteService.addFavorite(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Map<String, Boolean>> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        boolean removed = favoriteService.removeFavorite(userId, productId);
        return ResponseEntity.ok(Map.of("removed", removed));
    }

    @GetMapping("/check/{userId}/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        boolean isFavorite = favoriteService.isFavorite(userId, productId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FavoriteResponse>> getUserFavorites(@PathVariable Long userId) {
        List<FavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/user/{userId}/products")
    public ResponseEntity<List<Product>> getUserFavoritedProducts(@PathVariable Long userId) {
        List<Product> products = favoriteService.getUserFavoritedProducts(userId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/count/{productId}")
    public ResponseEntity<Map<String, Long>> countProductFavorites(@PathVariable Long productId) {
        Long count = favoriteService.countProductFavorites(productId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}