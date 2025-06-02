package com.example.vuvisa.repositories.specs;

import com.example.vuvisa.entities.Order;
import com.example.vuvisa.entities.OrderDetail;
import com.example.vuvisa.dtos.requests.OrderFilterRequest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;


import java.text.SimpleDateFormat;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class OrderSpecification {
    public static Specification<Order> filter(OrderFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getId() != null) {
                predicates.add(cb.equal(root.get("id"), filter.getId()));
            }
            if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
                predicates.add(root.get("status").in(filter.getStatus()));
            }
            if (filter.getFullName() != null && !filter.getFullName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("fullName")), "%" + filter.getFullName().toLowerCase() + "%"));
            }
            if (filter.getPhoneNumber() != null && !filter.getPhoneNumber().isEmpty()) {
                predicates.add(cb.like(root.get("phoneNumber"), "%" + filter.getPhoneNumber() + "%"));
            }
            if (filter.getShippingMethod() != null && !filter.getShippingMethod().isEmpty()) {
                predicates.add(root.get("shippingMethod").in(filter.getShippingMethod()));
            }
            if (filter.getStartDate() != null) {
                Date startDate = filter.getStartDate();
                predicates.add(cb.greaterThanOrEqualTo(root.get("orderDate"), startDate));
            }

            if (filter.getEndDate() != null) {
                Date endDate = filter.getEndDate();
                predicates.add(cb.lessThanOrEqualTo(root.get("orderDate"), endDate));
            }
            // Join with orderDetails and product
            if (filter.getProductName() != null && !filter.getProductName().isEmpty()) {
                Join<Order, OrderDetail> details = root.join("orderDetails");
                predicates.add(cb.like(cb.lower(details.get("product").get("productName")), "%" + filter.getProductName().toLowerCase() + "%"));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}