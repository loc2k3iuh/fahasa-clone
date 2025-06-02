package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.OrderDTO;
import com.example.vuvisa.dtos.requests.OrderFilterRequest;
import com.example.vuvisa.dtos.requests.UpdateOrderStatusRequest;
import com.example.vuvisa.dtos.responses.OrderResponse;
import com.example.vuvisa.services.OrderService;
import com.example.vuvisa.utils.PdfGeneratorUtils;
import com.example.vuvisa.utils.PdfStorageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PdfStorageUtils pdfStorageUtils;

    @PostMapping
    public APIResponse<?> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            OrderResponse orderResponse = orderService.createOrder(orderDTO);
            return APIResponse.builder()
                    .message("Order created successfully")
                    .result(orderResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error creating order: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping()
    public APIResponse<?> getOrders(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size) {
        try {
            Page<OrderResponse> orders = orderService.getOrders(page, size);
            return APIResponse.builder()
                    .message("Orders retrieved successfully")
                    .result(orders)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error retrieving orders: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{id}")
    public APIResponse<?> getOrderById(@PathVariable Long id) {
        try {
            OrderResponse orderResponse = orderService.getOrderById(id);
            return APIResponse.builder()
                    .message("Order retrieved successfully")
                    .result(orderResponse)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error retrieving order: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/user/{userId}")
    public APIResponse<?> getOrdersByUserId(@PathVariable Long userId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "5") int size) {
        try {
            Page<OrderResponse> orders = orderService.getOrdersByUserId(userId, page, size);
            return APIResponse.builder()
                    .message("Orders retrieved successfully")
                    .result(orders)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error retrieving orders: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/filter")
    public APIResponse<?> filterOrders(
            @RequestBody OrderFilterRequest filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        log.info("filterOrders: filter: {}, page: {}, size: {}", filter, page, size);
        try {
                Page<OrderResponse> orders = orderService.filterOrders(filter, page, size);
            return APIResponse.builder()
                    .message("Orders filtered successfully")
                    .result(orders)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error filtering orders: " + e.getMessage())
                    .build();
        }
    }


    @PostMapping("/generate-sample-orders")
    public APIResponse<?> generateSampleOrders() {
        try {
            int created = orderService.generateSampleOrders(10);
            return APIResponse.builder()
                    .message("Successfully created " + created + " orders")
                    .result(created)
                    .build();
        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/generate-pdfs")
    public APIResponse<?> generateOrderPdfs(@RequestBody List<Long> orderIds) {
        try {
            List<byte[]> pdfs = orderService.generateOrderPdfs(orderIds);

            if (pdfs.isEmpty()) {
                return APIResponse.builder()
                        .message("No PDFs were generated")
                        .build();
            }

            // Merge all PDFs into a single PDF
            byte[] mergedPdf = PdfGeneratorUtils.mergePdfs(pdfs);

            // Store the merged PDF in S3 and get the URL
            String pdfUrl = pdfStorageUtils.storeMergedPdf(mergedPdf, orderIds);

            return APIResponse.builder()
                    .message("PDFs generated and merged successfully")
                    .result(pdfUrl)
                    .build();

        } catch (Exception e) {
            return APIResponse.builder()
                    .message("Error generating PDFs: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/update-status")
    public APIResponse<?> updateOrdersStatus(@RequestBody UpdateOrderStatusRequest request) {
        try {
            log.info("Updating status for orders: {} to {}", request.getOrderIds(), request.getStatus());

            List<OrderResponse> updatedOrders = orderService.updateOrdersStatus(
                    request.getOrderIds(),
                    request.getStatus()
            );

            return APIResponse.builder()
                    .message("Orders status updated successfully to " + request.getStatus())
                    .result(updatedOrders)
                    .build();

        } catch (Exception e) {
            log.error("Error updating orders status: {}", e.getMessage(), e);
            return APIResponse.builder()
                    .message("Error updating orders status: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/delete")
    public APIResponse<?> deleteOrders(@RequestBody List<Long> orderIds) {
        try {
            orderService.deleteOrders(orderIds);
            return APIResponse.builder()
                    .message("Order deleted successfully")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting order: {}", e.getMessage(), e);
            return APIResponse.builder()
                    .message("Error deleting order: " + e.getMessage())
                    .build();
        }
    }

    @PutMapping("/{id}")
    public APIResponse<?> updateOrder(@PathVariable Long id, @RequestBody OrderDTO orderDTO) {
        try {
            log.info("Updating order with ID: {}", id);
            OrderResponse updatedOrder = orderService.updateOrder(id, orderDTO);
            return APIResponse.builder()
                    .message("Order updated successfully")
                    .result(updatedOrder)
                    .build();
        } catch (Exception e) {
            log.error("Error updating order: {}", e.getMessage(), e);
            return APIResponse.builder()
                    .code(500)
                    .message("Error updating order: " + e.getMessage())
                    .build();
        }
    }
}
