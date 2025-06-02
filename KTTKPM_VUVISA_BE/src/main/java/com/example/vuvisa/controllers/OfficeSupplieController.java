package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.OfficeSupplyRequestDTO;
import com.example.vuvisa.dtos.responses.OfficeSuppliesResponseDTO;
import com.example.vuvisa.entities.OfficeSupplies;
import com.example.vuvisa.services.OfficeSupplieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/products/office-supplies")
@RequiredArgsConstructor
public class OfficeSupplieController {

    private final OfficeSupplieService officeSupplieService;

    @GetMapping
    public ResponseEntity<List<OfficeSuppliesResponseDTO>> getAllOfficeSupplies() {
        List<OfficeSupplies> officeSupplies = officeSupplieService.getAllOfficeSupplies();
        List<OfficeSuppliesResponseDTO> officeSuppliesResponseDTOS = officeSupplies.stream()
                .map(officeSupplieService::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(officeSuppliesResponseDTOS);
    }

    @GetMapping("/page")
    public APIResponse<Page<OfficeSuppliesResponseDTO>> getAllOfficeSuppliesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String productName) {

        Pageable pageable = PageRequest.of(page, size);

        if (productName != null && !productName.isEmpty()) {
            return APIResponse.<Page<OfficeSuppliesResponseDTO>>builder()
                    .result(officeSupplieService.searchOfficeSuppliesByName(productName, pageable))
                    .message("Office Supplies found by name")
                    .build();
        }

        return APIResponse.<Page<OfficeSuppliesResponseDTO>>builder()
                .result(officeSupplieService.getAllOfficeSuppliesWithPagination(pageable))
                .message("Office Supplies retrieved successfully with pagination")
                .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficeSuppliesResponseDTO> getOfficeSuppliesById(@PathVariable Long id) {
        OfficeSupplies officeSupplies = officeSupplieService.getOfficeSuppliesById(id);
        OfficeSuppliesResponseDTO dto = officeSupplieService.convertToResponseDTO(officeSupplies);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<?> createOfficeSupplies(@RequestBody OfficeSupplyRequestDTO officeSupplyDTO) {
        OfficeSupplies saveOfficeSupplies = officeSupplieService.createOfficeSupplies(officeSupplyDTO);
        return ResponseEntity.ok(saveOfficeSupplies);
    }


    @PutMapping("/{id}")
    public ResponseEntity<OfficeSupplies> updateOfficeSupplies(@PathVariable Long id, @RequestBody OfficeSupplyRequestDTO officeSupplyDTO) {
        return ResponseEntity.ok(officeSupplieService.updateOfficeSupplies(id, officeSupplyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOfficeSupplies(@PathVariable Long id) {
        officeSupplieService.deleteOfficeSupplies(id);
        return ResponseEntity.noContent().build();
    }
}