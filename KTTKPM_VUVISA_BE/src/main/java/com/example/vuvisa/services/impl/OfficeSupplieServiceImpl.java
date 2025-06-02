package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.OfficeSupplyRequestDTO;
import com.example.vuvisa.dtos.responses.DiscountResponse;
import com.example.vuvisa.dtos.responses.OfficeSuppliesResponseDTO;
import com.example.vuvisa.entities.Category;
import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.entities.OfficeSupplies;
import com.example.vuvisa.entities.Supplier;
import com.example.vuvisa.repositories.CategoryRepository;
import com.example.vuvisa.repositories.ImageProductRepository;
import com.example.vuvisa.repositories.OfficeSupplieRepository;
import com.example.vuvisa.repositories.SupplierRepository;
import com.example.vuvisa.services.CloudinaryService;
import com.example.vuvisa.services.OfficeSupplieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfficeSupplieServiceImpl implements OfficeSupplieService {

    private final OfficeSupplieRepository officeSupplieRepository;
    private final ImageProductRepository imageProductRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public List<OfficeSupplies> getAllOfficeSupplies() {
        return officeSupplieRepository.findAll();
    }

    @Override
    public Page<OfficeSuppliesResponseDTO> getAllOfficeSuppliesWithPagination(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "id")
        );
        return officeSupplieRepository.findAll(sortedPageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public Page<OfficeSuppliesResponseDTO> searchOfficeSuppliesByName(String productName, Pageable pageable) {
        return officeSupplieRepository.findByProductNameContainingIgnoreCase(productName, pageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public OfficeSupplies getOfficeSuppliesById(Long id) {
        return officeSupplieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Office Supplies not found"));
    }

    @Override
    public OfficeSuppliesResponseDTO getOfficeSuppliesDTOById(Long id) {
        OfficeSupplies officeSupplies = officeSupplieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OfficeSupplies not found"));
        return convertToResponseDTO(officeSupplies);
    }

    @Override
    public OfficeSuppliesResponseDTO convertToResponseDTO(OfficeSupplies officeSupplies) {
        OfficeSuppliesResponseDTO dto = new OfficeSuppliesResponseDTO();
        dto.setId(officeSupplies.getId());
        dto.setProductName(officeSupplies.getProductName());
        dto.setDescription(officeSupplies.getDescription());
        dto.setPrice(officeSupplies.getPrice().doubleValue());
        dto.setStockQuantity(officeSupplies.getStockQuantity());
        dto.setImageUrl(officeSupplies.getImageUrl());
        dto.setClassify(officeSupplies.getClassify());

        dto.setCategory(officeSupplies.getCategory());
        dto.setSupplier(officeSupplies.getSupplier());
        dto.setImageProducts(officeSupplies.getImageProducts());

        // convert discounts
        if (officeSupplies.getDiscounts() != null) {
            Set<DiscountResponse> discounts = officeSupplies.getDiscounts().stream()
                .map(DiscountResponse::fromDiscount)
                .collect(Collectors.toSet());
            dto.setDiscounts(discounts);
        }

        return dto;
    }

    @Override
    public OfficeSupplies createOfficeSupplies(OfficeSupplyRequestDTO officeSupplyDTO) {
        OfficeSupplies officeSupplies = convertToEntity(officeSupplyDTO);
        return officeSupplieRepository.save(officeSupplies);
    }

    @Override
    public OfficeSupplies convertToEntity(OfficeSupplyRequestDTO dto) {
        OfficeSupplies officeSupplies = new OfficeSupplies();
        officeSupplies.setProductName(dto.getProductName());
        officeSupplies.setDescription(dto.getDescription());
        officeSupplies.setPrice(dto.getPrice().longValue());
        officeSupplies.setStockQuantity(dto.getStockQuantity());
        officeSupplies.setImageUrl(dto.getImageUrl());
        officeSupplies.setClassify(dto.getClassify());

        // Gắn Category
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            officeSupplies.setCategory(category);
        }

        // Gắn Supplier
        if (dto.getSupplier() != null && dto.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            officeSupplies.setSupplier(supplier);
        }

        // Gắn ImageProducts
        if (dto.getImageProducts() != null && !dto.getImageProducts().isEmpty()) {
            Set<ImageProduct> imageProducts = dto.getImageProducts().stream().map(imgDTO -> {
                ImageProduct image = new ImageProduct();
                image.setDescription(imgDTO.getDescription());
                image.setUrl(imgDTO.getUrl());
                image.setProduct(officeSupplies); // gắn ngược về sản phẩm
                return image;
            }).collect(Collectors.toSet());
            officeSupplies.setImageProducts(imageProducts);
        }

        return officeSupplies;
    }

    @Override
    public OfficeSupplies updateOfficeSupplies(Long id, OfficeSupplyRequestDTO dto) {
        OfficeSupplies existingOfficeSupplies = getOfficeSuppliesById(id);

        existingOfficeSupplies.setProductName(dto.getProductName());
        existingOfficeSupplies.setDescription(dto.getDescription());
        existingOfficeSupplies.setPrice(dto.getPrice().longValue());

        existingOfficeSupplies.setStockQuantity(dto.getStockQuantity());
        existingOfficeSupplies.setClassify(dto.getClassify());

        // cập nhật ảnh chính trên clound
        if(dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
            if (existingOfficeSupplies.getImageUrl() != null && !existingOfficeSupplies.getImageUrl().isEmpty()) {
                processMedia(existingOfficeSupplies.getImageUrl());
            }
            existingOfficeSupplies.setImageUrl(dto.getImageUrl());
        }

        // Cập nhật Category
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existingOfficeSupplies.setCategory(category);
        }

        // Cập nhật Supplier
        if (dto.getSupplier() != null && dto.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingOfficeSupplies.setSupplier(supplier);
        }

        // Cập nhật ImageProducts: dùng orphanRemoval thay vì xóa tay
        if (existingOfficeSupplies.getImageProducts() != null) {
            existingOfficeSupplies.getImageProducts().forEach(img -> {
                if (img.getUrl() != null && !img.getUrl().isEmpty()) {
                    processMedia(img.getUrl());
                }
            });
            existingOfficeSupplies.getImageProducts().clear(); // Hibernate sẽ tự remove các orphan
        }

        if (dto.getImageProducts() != null && !dto.getImageProducts().isEmpty()) {
            Set<ImageProduct> newImages = dto.getImageProducts().stream().map(imgDTO -> {
                ImageProduct image = new ImageProduct();
                image.setDescription(imgDTO.getDescription());
                image.setUrl(imgDTO.getUrl());
                image.setProduct(existingOfficeSupplies); // gắn về lại sản phẩm cha
                return image;
            }).collect(Collectors.toSet());

            existingOfficeSupplies.getImageProducts().addAll(newImages);
        }

        return officeSupplieRepository.save(existingOfficeSupplies);
    }


    @Override
    public void deleteOfficeSupplies(Long id) {
        // Lấy book
        OfficeSupplies officeSupplies = getOfficeSuppliesById(id);

        // Xóa ảnh trong bảng phụ (imageProducts)
        List<ImageProduct> imageProducts = imageProductRepository.findByProduct(officeSupplies);
        imageProducts.forEach(img -> {
            if (img.getUrl() != null && !img.getUrl().isEmpty()) {
                processMedia(img.getUrl());
            }
        });
        imageProductRepository.deleteAll(imageProducts);

        // Xóa ảnh chính nếu có
        if (officeSupplies.getImageUrl() != null && !officeSupplies.getImageUrl().isEmpty()) {
            processMedia(officeSupplies.getImageUrl());
        }

        // Xóa book
        officeSupplieRepository.deleteById(id);
    }

    public void processMedia(String mediaUrl) {
        if (isImage(mediaUrl)) {
            // Xử lý ảnh
            cloudinaryService.deleteImage(mediaUrl);
        } else if (isVideo(mediaUrl)) {
            // Xử lý video
            cloudinaryService.deleteVideo(mediaUrl);
        } else {
            System.err.println("Không xác định được loại tài nguyên");
        }
    }

    private boolean isImage(String url) {
        return url != null && (url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".png") || url.endsWith(".gif"));
    }

    private boolean isVideo(String url) {
        return url != null && (url.endsWith(".mp4") || url.endsWith(".avi") || url.endsWith(".mov"));
    }

}
