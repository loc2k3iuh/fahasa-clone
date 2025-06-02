package com.example.vuvisa.controllers;

import com.example.vuvisa.entities.ImageProduct;
import com.example.vuvisa.services.ImageProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/image-products")
@RequiredArgsConstructor
public class ImageProductController {

    private final ImageProductService imageProductService;

    @GetMapping
    public List<ImageProduct> getAllImageProducts() {
        return imageProductService.getAllImageProducts();
    }

    @GetMapping("/{id}")
    public ImageProduct getImageProductById(@PathVariable Long id) {
        return imageProductService.getImageProductById(id);
    }

    @PostMapping
    public ImageProduct createImageProduct(@RequestBody ImageProduct imageProduct) {
        return imageProductService.createImageProduct(imageProduct);
    }

    @PutMapping("/{id}")
    public ImageProduct updateImageProduct(@PathVariable Long id, @RequestBody ImageProduct imageProduct) {
        return imageProductService.updateImageProduct(id, imageProduct);
    }

    @DeleteMapping("/{id}")
    public void deleteImageProduct(@PathVariable Long id) {
        imageProductService.deleteImageProduct(id);
    }
}
