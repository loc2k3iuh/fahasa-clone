package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CartItemDTO;
import com.example.vuvisa.dtos.requests.OrderDTO;
import com.example.vuvisa.dtos.responses.CartItemResponse;
import com.example.vuvisa.dtos.responses.CartResponse;
import com.example.vuvisa.entities.Cart;
import com.example.vuvisa.entities.CartItem;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.repositories.CartItemRepository;
import com.example.vuvisa.repositories.CartRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.services.CartService;
import com.example.vuvisa.services.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderService orderService;

    @Override
    public CartResponse getCartByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createNewCart(user));

        return mapCartToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItemToCart(Long userId, CartItemDTO cartItemDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(cartItemDTO.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + cartItemDTO.getProductId()));

        // Check if product is in stock
        if (product.getStockQuantity() < cartItemDTO.getQuantity()) {
            throw new IllegalArgumentException("Not enough stock for product: " + product.getProductName());
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createNewCart(user));

        // Check if product already exists in cart
        Optional<CartItem> existingCartItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingCartItem.isPresent()) {
            // Update quantity
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + cartItemDTO.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            // Add new cart item
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(cartItemDTO.getQuantity())
                    .build();
            cart.addCartItem(cartItem);
            cartItemRepository.save(cartItem);
        }

        cart.setUpdatedDate(new Date());
        cartRepository.save(cart);

        return mapCartToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long userId, Long productId, Long quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new EntityNotFoundException("Product not found in cart"));

        // Check if product is in stock
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Not enough stock for product: " + product.getProductName());
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.removeCartItem(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            // Update quantity
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        cart.setUpdatedDate(new Date());
        cartRepository.save(cart);

        return mapCartToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItemFromCart(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user: " + userId));

        CartItem cartItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new EntityNotFoundException("Product not found in cart"));

        cart.removeCartItem(cartItem);
        cartItemRepository.delete(cartItem);

        cart.setUpdatedDate(new Date());
        cartRepository.save(cart);

        return mapCartToCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user: " + userId));

        cart.clearCart();
        cartItemRepository.deleteByCart(cart);

        cart.setUpdatedDate(new Date());
        cartRepository.save(cart);
    }

    @Override
    @Transactional
    public CartResponse checkout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("Cart not found for user: " + userId));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalStateException("Cannot checkout with an empty cart");
        }

        // Create OrderDTO from cart
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setUserId(userId);
        orderDTO.setFullName(user.getFullName());
        orderDTO.setEmail(user.getEmail());
        orderDTO.setPhoneNumber(user.getPhoneNumber());
        orderDTO.setAddress(user.getAddress());

        // Convert cart items to CartItemDTO set
        Set<CartItemDTO> cartItemDTOs = cart.getCartItems().stream()
                .map(cartItem -> CartItemDTO.builder()
                        .productId(cartItem.getProduct().getId())
                        .quantity(cartItem.getQuantity())
                        .build())
                .collect(Collectors.toSet());

        orderDTO.setCartItems(cartItemDTOs);

        // Create order
        try {
            orderService.createOrder(orderDTO);

            // Clear the cart after successful order creation
            clearCart(userId);
        } catch (Exception e) {
            throw new RuntimeException("Error creating order: " + e.getMessage(), e);
        }

        // Return empty cart
        return CartResponse.builder()
                .id(cart.getId())
                .userId(userId)
                .createdDate(cart.getCreatedDate())
                .updatedDate(new Date())
                .items(new ArrayList<>())
                .totalItems(0)
                .totalPrice(0L)
                .build();
    }

    private Cart createNewCart(User user) {
        Cart cart = Cart.builder()
                .user(user)
                .build();
        return cartRepository.save(cart);
    }

    private CartResponse mapCartToCartResponse(Cart cart) {
        List<CartItemResponse> cartItemResponses = cart.getCartItems().stream()
                .map(this::mapCartItemToCartItemResponse)
                .collect(Collectors.toList());

        long totalPrice = cartItemResponses.stream()
                .mapToLong(CartItemResponse::getSubtotal)
                .sum();



        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .createdDate(cart.getCreatedDate())
                .updatedDate(cart.getUpdatedDate())
                .items(cartItemResponses)
                .totalItems(cartItemResponses.size())
                .totalPrice(totalPrice)
                .build();
    }

    private CartItemResponse mapCartItemToCartItemResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(product.getId())
                .productName(product.getProductName())
                .price(product.getPrice())
                .quantity(cartItem.getQuantity())
                .quantityInStock(product.getStockQuantity())
                .subtotal(product.getPrice() * cartItem.getQuantity())
                .imageUrl(product.getImageUrl())
                .build();
    }
}
