package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CreateSupplierRequest;
import com.example.vuvisa.dtos.requests.UpdateSupplierRequest;
import com.example.vuvisa.dtos.responses.SupplierResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.Supplier;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.SupplierRepository;
import com.example.vuvisa.services.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Override
    public Page<SupplierResponse> getAllSuppliersByPage(int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return supplierRepository.findAll(pageable).map(SupplierResponse::fromSupplier);
    }
    @Override
    public List<Supplier> getAllSupplier(){
        return supplierRepository.findAll();
    }

    @Override
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        return SupplierResponse.fromSupplier(supplier);
    }

    @Transactional
    @Override
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        if (supplierRepository.existsBySupplierName(request.getSupplierName())) {
            throw new RuntimeException("Supplier name already exists");
        }

        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .description(request.getDescription())
                .products(new HashSet<>()).build();

        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            Set<Product> products = (Set<Product>) productRepository.findAllById(request.getProductIds());
            supplier.setProducts(products);
        }

        return SupplierResponse.fromSupplier(supplierRepository.save(supplier));
    }

    @Transactional
    @Override
    public SupplierResponse updateSupplier(Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        supplier.setSupplierName(request.getSupplierName());
        supplier.setDescription(request.getDescription());

        if (request.getProductIds() != null) {
            Set<Product> products = (Set<Product>) productRepository.findAllById(request.getProductIds());
            supplier.setProducts(products);
        }

        return SupplierResponse.fromSupplier(supplierRepository.save(supplier));
    }

    @Transactional
    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplierRepository.delete(supplier);
    }

    @Override
    public Page<SupplierResponse> getSuppliersByProductId(long productId, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return supplierRepository.findByProducts_Id(productId, pageable).map(SupplierResponse::fromSupplier);
    }

    @Override
    public Page<SupplierResponse> searchSupplierByName(String name, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return supplierRepository.findBySupplierNameContainingIgnoreCase(name, pageable)
                .map(SupplierResponse::fromSupplier);
    }

}
