package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateSupplierRequest;
import com.example.vuvisa.dtos.requests.UpdateSupplierRequest;
import com.example.vuvisa.dtos.responses.SupplierResponse;
import com.example.vuvisa.entities.Supplier;
import com.example.vuvisa.services.SupplierService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/suppliers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping("/create")
    public APIResponse<SupplierResponse> createSupplier(
            @Valid @RequestBody CreateSupplierRequest request) {
        return APIResponse.<SupplierResponse>builder()
                .result(supplierService.createSupplier(request))
                .message("Supplier created successfully")
                .build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<Supplier>> getAll(){
        return ResponseEntity.ok().body(supplierService.getAllSupplier());
    }

    @GetMapping("/{id}")
    public APIResponse<SupplierResponse> getSupplierById(@PathVariable("id") long id) {
        return APIResponse.<SupplierResponse>builder()
                .result(supplierService.getSupplierById(id))
                .message("Supplier retrieved successfully").build();
    }

    @GetMapping
    public APIResponse<Page<SupplierResponse>> getAllSuppliersByPage(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(required = false) String supplierName){
        if(supplierName != null && !supplierName.isEmpty()){
            return APIResponse.<Page<SupplierResponse>>builder()
                    .result(supplierService.searchSupplierByName(supplierName, page)).build();
        }
        return APIResponse.<Page<SupplierResponse>>builder()
                .result(supplierService.getAllSuppliersByPage(page))
                .message("Suppliers retrieved successfully").build();
    }

    @PutMapping("/{id}")
    public APIResponse<SupplierResponse> updateSupplier(@PathVariable long id, @Valid @RequestBody UpdateSupplierRequest request) {
        return APIResponse.<SupplierResponse>builder()
                .result(supplierService.updateSupplier(id, request))
                .message("Supplier updated successfully").build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<String> deleteSupplier(@PathVariable long id) {
        supplierService.deleteSupplier(id);
        return APIResponse.<String>builder()
                .message("Supplier deleted successfully").build();
    }

    @GetMapping("/by-product/{productId}")
    public APIResponse<Page<SupplierResponse>> getSuppliersByProductId(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page) {
        return APIResponse.<Page<SupplierResponse>>builder()
                .result(supplierService.getSuppliersByProductId(productId, page))
                .message("Suppliers by product retrieved successfully")
                .build();
    }
}
