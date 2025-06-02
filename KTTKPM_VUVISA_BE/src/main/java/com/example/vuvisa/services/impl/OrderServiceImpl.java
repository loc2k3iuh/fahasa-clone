package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CartItemDTO;
import com.example.vuvisa.dtos.requests.OrderDTO;
import com.example.vuvisa.dtos.requests.OrderDetailDTO;
import com.example.vuvisa.dtos.requests.OrderFilterRequest;
import com.example.vuvisa.dtos.responses.OrderResponse;
import com.example.vuvisa.dtos.responses.VoucherResponse;
import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.OrderDetail;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.User;
import com.example.vuvisa.entities.Voucher;
import com.example.vuvisa.enums.OrderStatus;
import com.example.vuvisa.enums.PaymentMethod;
import com.example.vuvisa.enums.ShippingMethod;
import com.example.vuvisa.repositories.OrderDetailRepository;
import com.example.vuvisa.repositories.OrderRepository;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.UserRepository;
import com.example.vuvisa.repositories.VoucherRepository;
import com.example.vuvisa.repositories.specs.OrderSpecification;
import com.example.vuvisa.services.OrderService;
import com.example.vuvisa.utils.PdfGeneratorUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final VoucherRepository voucherRepository;
    private final MailServiceImpl mailService;
    private final SpringTemplateEngine templateEngine;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderDTO orderDTO) throws Exception {

        User user = userRepository
                .findById(orderDTO.getUserId())
                .orElseThrow(() -> new Exception("User not found with id = " + orderDTO.getUserId()));
        // Check product quantities before creating the order
        Map<Long, Product> productsToUpdate = new HashMap<>();
        double totalOrderValue = 0.0;
        for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
            Long productId = cartItemDTO.getProductId();
            Long requestedQuantity = cartItemDTO.getQuantity();

            Product product = productRepository
                    .findById(productId)
                    .orElseThrow(() -> new Exception("Product not found with id = " + productId));

            // Check if there's enough stock
            if (product.getStockQuantity() < requestedQuantity) {
                throw new Exception("Not enough stock for product: " + product.getProductName() + 
                                   ". Available: " + product.getStockQuantity() + 
                                   ", Requested: " + requestedQuantity);
            }

            productsToUpdate.put(productId, product);
            totalOrderValue += product.getPrice() * requestedQuantity;
        }

        Order order = Order.builder()
                .user(user)
                .orderDate(new Date())
                .city(orderDTO.getCity())
                .district(orderDTO.getDistrict())
                .ward(orderDTO.getWard())
                .address(orderDTO.getAddress())
                .fullName(orderDTO.getFullName())
                .email(orderDTO.getEmail())
                .phoneNumber(orderDTO.getPhoneNumber())
                .shippingMethod(orderDTO.getShippingMethod())
                .shippingDate(new Date()) // 2 days later
                .paymentMethod(orderDTO.getPaymentMethod())
                .discountCode(orderDTO.getDiscountCode())
                .note(orderDTO.getNote())
                .build();

        if(order.getPaymentMethod() == PaymentMethod.VN_PAY) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setStatus(OrderStatus.PENDING);
        }

        orderRepository.save(order);

        // Handle vouchers if provided
        if (orderDTO.getVoucherIds() != null && !orderDTO.getVoucherIds().isEmpty()) {
            Set<Voucher> vouchers = new HashSet<>(voucherRepository.findAllById(orderDTO.getVoucherIds()));

            // Validate each voucher
            for (Voucher voucher : vouchers) {
                validateVoucher(voucher, totalOrderValue);
                voucher.setMaxUses(voucher.getMaxUses() - 1);
                voucherRepository.save(voucher);
            }

            order.setVouchers(vouchers);
            orderRepository.save(order);
        }

        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
            Long productId = cartItemDTO.getProductId();
            Long quantity = cartItemDTO.getQuantity();

            Product product = productsToUpdate.get(productId);

            // Update product stock quantity
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setProduct(product);
            orderDetail.setQuantity(quantity);

            orderDetail.setPrice(product.getPrice());
            orderDetails.add(orderDetail);
        }

        order.setOrderDetails(orderDetails);
        orderDetailRepository.saveAll(orderDetails);
        // Send email with invoice


        mailService.sendInvoiceEmail(order, order.getEmail());

        return modelMapper.map(order, OrderResponse.class);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        // Configure mapping for vouchers
        modelMapper.typeMap(Order.class, OrderResponse.class)
                .addMappings(mapper -> mapper.map(src -> src.getVouchers().stream()
                        .map(VoucherResponse::fromVoucher)
                        .collect(Collectors.toSet()), OrderResponse::setVouchers));

        List<Order> orders = orderRepository.findAll();
        return orders.stream().map((order) -> modelMapper.map(order, OrderResponse.class)).toList();
    }

    @Override
    public OrderResponse getOrderById(Long id) throws Exception {
        Order order = orderRepository
                .findById(id)
                .orElseThrow(() -> new Exception("Order not found with id = " + id));
        modelMapper.typeMap(OrderDetail.class, OrderDetailDTO.class)
                .addMapping(src -> src.getProduct().getImageUrl(), OrderDetailDTO::setImageUrl)
                .addMapping(src -> src.getProduct().getStockQuantity(), OrderDetailDTO::setStockQuantity);

        return modelMapper.map(order, OrderResponse.class);
    }

    @Override
    public Page<OrderResponse> getOrdersByUserId(Long userId, int page, int size) throws Exception {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new Exception("User not found with id = " + userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findByUserId(userId, pageable);

        orders.getContent().stream().peek(order -> modelMapper.typeMap(OrderDetail.class, OrderDetailDTO.class)
                .addMapping(src -> src.getProduct().getImageUrl(), OrderDetailDTO::setImageUrl)
                .addMapping(src -> src.getProduct().getStockQuantity(), OrderDetailDTO::setStockQuantity)).toList();
        return orders.map(order -> modelMapper.map(order, OrderResponse.class));
    }

    @Override
    public Page<OrderResponse> getOrders(int page, int size) {
        // Configure mapping for vouchers
        modelMapper.typeMap(Order.class, OrderResponse.class)
                .addMappings(mapper -> mapper.map(src -> src.getVouchers().stream()
                        .map(VoucherResponse::fromVoucher)
                        .collect(Collectors.toSet()), OrderResponse::setVouchers));

        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").ascending());
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(order -> modelMapper.map(order, OrderResponse.class));
    }

    @Override
    public Page<OrderResponse> filterOrders(OrderFilterRequest filter, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<Order> orderPage = orderRepository.findAll(OrderSpecification.filter(filter), pageable);
        return orderPage.map(order -> modelMapper.map(order, OrderResponse.class));
    }


    @Override
    @Transactional
    public int generateSampleOrders(int count) throws Exception {
        // Lấy user có ID nhỏ nhất để gán cho order
        User user = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new Exception("No user found for sample order creation"));

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) throw new Exception("No products available to create order items.");

        Random random = new Random();

        for (int i = 0; i < count; i++) {
            Order order = Order.builder()
                    .user(user)
                    .orderDate(new Date())
                    .status(OrderStatus.PENDING)
                    .city("Sample City " + i)
                    .district("Sample District " + i)
                    .ward("Sample Ward " + i)
                    .address("123 Sample Address " + i)
                    .fullName("Customer " + i)
                    .email("customer" + i + "@example.com")
                    .phoneNumber("090012345" + (i % 10))
                    .shippingMethod(ShippingMethod.STANDARD)
                    .shippingDate(new Date())
                    .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                    .discountCode(null)
                    .note("Sample order " + i)
                    .build();

            orderRepository.save(order);

            List<OrderDetail> orderDetails = new ArrayList<>();
            int items = 1 + random.nextInt(3); // mỗi đơn hàng 1-3 sản phẩm
            for (int j = 0; j < items; j++) {
                Product product = products.get(random.nextInt(products.size()));
                OrderDetail orderDetail = new OrderDetail();
                orderDetail.setOrder(order);
                orderDetail.setProduct(product);
                orderDetail.setQuantity(1 + random.nextLong(5));
                orderDetail.setPrice(product.getPrice());
                orderDetails.add(orderDetail);
            }
            order.setOrderDetails(orderDetails);

            orderDetailRepository.saveAll(orderDetails);
        }
        return count;
    }

    @Override
    public List<byte[]> generateOrderPdfs(List<Long> orderIds) throws Exception {
        List<Order> orders = orderRepository.findAllById(orderIds);

        if (orders.isEmpty()) {
            throw new Exception("No orders found with the provided IDs");
        }

        List<String> htmlContents = new ArrayList<>();

        for (Order order : orders) {
            Context context = new Context();
            context.setVariable("order", order);
            // Calculate or retrieve discountAmount - set to 0 if not applicable
            double discountAmount = 0.0;
            if (order.getVouchers() != null && !order.getVouchers().isEmpty()) {
                discountAmount = order.getVouchers().stream()
                        .mapToDouble(Voucher::getDiscountAmount)
                        .sum();
            }
            context.setVariable("discountAmount", discountAmount);


            double totalPrice = order.getOrderDetails().stream()
                    .mapToDouble(orderDetail -> orderDetail.getPrice() * orderDetail.getQuantity())
                    .sum();

            context.setVariable("totalPrice", totalPrice);

            String htmlContent = templateEngine.process("invoice", context);
            htmlContents.add(htmlContent);

            // cập nhật trang thái order sau khi tạo pdf
            order.setStatus(OrderStatus.PACKING);
            orderRepository.save(order);
        }

        return PdfGeneratorUtils.generatePdfsFromHtmlList(htmlContents);
    }

    @Override
    @Transactional
    public List<OrderResponse> updateOrdersStatus(List<Long> orderIds, OrderStatus status) throws Exception {
        // Find all orders by their IDs
        List<Order> orders = orderRepository.findAllById(orderIds);

        // Check if all orders were found
        if (orders.size() != orderIds.size()) {
            // Find which order IDs were not found
            List<Long> foundOrderIds = orders.stream()
                    .map(Order::getId)
                    .toList();

            List<Long> notFoundOrderIds = orderIds.stream()
                    .filter(id -> !foundOrderIds.contains(id))
                    .toList();

            throw new Exception("The following orders were not found: " + notFoundOrderIds);
        }

        // Update the status of each order
        for (Order order : orders) {
            order.setStatus(status);
        }

        // Save all updated orders
        orderRepository.saveAll(orders);

        return orders.stream()
                .map(order -> modelMapper.map(order, OrderResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteOrders(List<Long> orderIds) throws Exception {

        // Find all orders by their IDs
        List<Order> orders = orderRepository.findAllById(orderIds);

        // Check if all orders were found
        if (orders.size() != orderIds.size()) {
            // Find which order IDs were not found
            List<Long> foundOrderIds = orders.stream()
                    .map(Order::getId)
                    .toList();

            List<Long> notFoundOrderIds = orderIds.stream()
                    .filter(id -> !foundOrderIds.contains(id))
                    .toList();

            throw new Exception("The following orders were not found: " + notFoundOrderIds);
        }
        // Delete all found orders
        orderRepository.deleteAll(orders);

    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderDTO orderDTO) throws Exception {
        // Find the order by ID
        Order order = orderRepository
                .findById(id)
                .orElseThrow(() -> new Exception("Order not found with id = " + id));

        // Update user if userId is provided
        if (orderDTO.getUserId() != null) {
            User user = userRepository
                    .findById(orderDTO.getUserId())
                    .orElseThrow(() -> new Exception("User not found with id = " + orderDTO.getUserId()));
            order.setUser(user);
        }

        // Update basic order information
        if (orderDTO.getFullName() != null) order.setFullName(orderDTO.getFullName());
        if (orderDTO.getEmail() != null) order.setEmail(orderDTO.getEmail());
        if (orderDTO.getPhoneNumber() != null) order.setPhoneNumber(orderDTO.getPhoneNumber());
        if (orderDTO.getCity() != null) order.setCity(orderDTO.getCity());
        if (orderDTO.getDistrict() != null) order.setDistrict(orderDTO.getDistrict());
        if (orderDTO.getWard() != null) order.setWard(orderDTO.getWard());
        if (orderDTO.getAddress() != null) order.setAddress(orderDTO.getAddress());
        if (orderDTO.getShippingMethod() != null) order.setShippingMethod(orderDTO.getShippingMethod());
        if (orderDTO.getShippingDate() != null) order.setShippingDate(orderDTO.getShippingDate());
        if (orderDTO.getPaymentMethod() != null) order.setPaymentMethod(orderDTO.getPaymentMethod());
        if (orderDTO.getStatus() != null) order.setStatus(orderDTO.getStatus());
        if (orderDTO.getDiscountCode() != null) order.setDiscountCode(orderDTO.getDiscountCode());
        if (orderDTO.getNote() != null) order.setNote(orderDTO.getNote());

        // Calculate total order value for voucher validation
        double totalOrderValue = 0.0;

        // If new cart items are provided, calculate based on them
        if (orderDTO.getCartItems() != null && !orderDTO.getCartItems().isEmpty()) {
            for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
                Long productId = cartItemDTO.getProductId();
                Long quantity = cartItemDTO.getQuantity();

                Product product = productRepository
                        .findById(productId)
                        .orElseThrow(() -> new Exception("Product not found with id = " + productId));

                totalOrderValue += product.getPrice() * quantity;
            }
        } else {
            // Otherwise, calculate based on existing order details
            totalOrderValue = order.getOrderDetails().stream()
                    .mapToDouble(detail -> detail.getPrice() * detail.getQuantity())
                    .sum();
        }

        // Update vouchers if provided
        if (orderDTO.getVoucherIds() != null) {
            Set<Voucher> vouchers = new HashSet<>(voucherRepository.findAllById(orderDTO.getVoucherIds()));

            // Validate each voucher
            for (Voucher voucher : vouchers) {
                validateVoucher(voucher, totalOrderValue);
            }

            order.setVouchers(vouchers);
        }

        // Update order details if provided
        if (orderDTO.getCartItems() != null && !orderDTO.getCartItems().isEmpty()) {
            // Store the original order details for comparison
            Map<Long, Long> originalProductQuantities = new HashMap<>();
            for (OrderDetail detail : order.getOrderDetails()) {
                originalProductQuantities.put(detail.getProduct().getId(), detail.getQuantity());
            }

            // Check product quantities before updating
            Map<Long, Product> productsToUpdate = new HashMap<>();
            for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
                Long productId = cartItemDTO.getProductId();
                Long requestedQuantity = cartItemDTO.getQuantity();

                Product product = productRepository
                        .findById(productId)
                        .orElseThrow(() -> new Exception("Product not found with id = " + productId));

                // Calculate the quantity difference
                Long originalQuantity = originalProductQuantities.getOrDefault(productId, 0L);
                Long quantityDifference = requestedQuantity - originalQuantity;

                // Check if there's enough stock if we're increasing the quantity
                if (quantityDifference > 0 && product.getStockQuantity() < quantityDifference) {
                    throw new Exception("Not enough stock for product: " + product.getProductName() + 
                                       ". Available: " + product.getStockQuantity() + 
                                       ", Additional needed: " + quantityDifference);
                }

                productsToUpdate.put(productId, product);
            }

            // Remove existing order details
            orderDetailRepository.deleteAll(order.getOrderDetails());

            // Create new order details
            List<OrderDetail> orderDetails = new ArrayList<>();
            for (CartItemDTO cartItemDTO : orderDTO.getCartItems()) {
                Long productId = cartItemDTO.getProductId();
                Long quantity = cartItemDTO.getQuantity();

                Product product = productsToUpdate.get(productId);

                // Calculate the quantity difference
                Long originalQuantity = originalProductQuantities.getOrDefault(productId, 0L);
                Long quantityDifference = quantity - originalQuantity;

                // Update product stock quantity
                if (quantityDifference != 0) {
                    product.setStockQuantity(product.getStockQuantity() - quantityDifference);
                    productRepository.save(product);
                }

                OrderDetail orderDetail = new OrderDetail();
                orderDetail.setOrder(order);
                orderDetail.setProduct(product);
                orderDetail.setQuantity(quantity);
                orderDetail.setPrice(product.getPrice());
                orderDetails.add(orderDetail);
            }

            order.setOrderDetails(orderDetails);
            orderDetailRepository.saveAll(orderDetails);
        }

        // Save the updated order
        orderRepository.save(order);

        // Return the updated order
        return modelMapper.map(order, OrderResponse.class);
    }

    private void validateVoucher(Voucher voucher, double orderValue) throws Exception {
        LocalDate currentDate = LocalDate.now();

        // Kiểm tra xem voucher có nằm trong khoảng thời gian hợp lệ không
        if (voucher.getStartDate() != null && currentDate.isBefore(voucher.getStartDate())) {
            throw new Exception("Voucher " + voucher.getCode() + " hiện chưa có hiệu lực. Có hiệu lực từ: " + voucher.getStartDate());
        }

        if (voucher.getEndDate() != null && currentDate.isAfter(voucher.getEndDate())) {
            throw new Exception("Voucher " + voucher.getCode() + " đã hết hạn. Có hiệu lực đến: " + voucher.getEndDate());
        }

        // Kiểm tra xem voucher còn lượt sử dụng không
        if (voucher.getMaxUses() != null && voucher.getOrders().size() >= voucher.getMaxUses()) {
            throw new Exception("Voucher " + voucher.getCode() + " đã đạt đến giới hạn số lần sử dụng.");
        }

        // Kiểm tra xem giá trị đơn hàng có đạt yêu cầu tối thiểu không
        if (voucher.getMinOrderValue() != null && orderValue < voucher.getMinOrderValue()) {
            throw new Exception("Giá trị đơn hàng (" + orderValue + ") không đạt mức tối thiểu (" +
                    voucher.getMinOrderValue() + ") để áp dụng voucher " + voucher.getCode());
        }
    }

}
