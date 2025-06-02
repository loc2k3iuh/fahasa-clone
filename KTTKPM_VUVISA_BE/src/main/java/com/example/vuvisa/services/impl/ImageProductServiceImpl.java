package com.example.vuvisa.services.impl;

import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.repositories.ImageProductRepository;
import com.example.vuvisa.services.ImageProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImageProductServiceImpl implements ImageProductService {

    private final ImageProductRepository imageProductRepository;

    @Override
    public List<ImageProduct> getAllImageProducts() {
        return imageProductRepository.findAll();
    }

    @Override
    public ImageProduct getImageProductById(Long id) {
        return imageProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ImageProduct not found"));
    }

    @Override
    public ImageProduct createImageProduct(ImageProduct imageProduct) {
        return imageProductRepository.save(imageProduct);
    }

    @Override
    public ImageProduct updateImageProduct(Long id, ImageProduct imageProduct) {
        ImageProduct existingImageProduct = getImageProductById(id);
        existingImageProduct.setUrl(imageProduct.getUrl());
        existingImageProduct.setDescription(imageProduct.getDescription());
        return imageProductRepository.save(existingImageProduct);
    }

    @Override
    public void deleteImageProduct(Long id) {
        imageProductRepository.deleteById(id);
    }
}