package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.CreatePublisherRequest;
import com.example.vuvisa.dtos.requests.UpdatePublisherRequest;
import com.example.vuvisa.dtos.responses.PublisherResponse;
import com.example.vuvisa.entities.Product;
import com.example.vuvisa.entities.Publisher;
import com.example.vuvisa.repositories.ProductRepository;
import com.example.vuvisa.repositories.PublisherRepository;
import com.example.vuvisa.services.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;
    private final ProductRepository productRepository;

    @Override
    public Page<PublisherResponse> getAllPublishersByPage(int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return publisherRepository.findAll(pageable).map(PublisherResponse::fromPublisher);
    }

    @Override
    public PublisherResponse getPublisherById(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));
        return PublisherResponse.fromPublisher(publisher);
    }

    @Transactional
    @Override
    public PublisherResponse createPublisher(CreatePublisherRequest request) {
        if (publisherRepository.existsByPublisherName(request.getPublisherName())) {
            throw new RuntimeException("Publisher name already exists");
        }

        Publisher publisher = Publisher.builder()
                .publisherName(request.getPublisherName())
                .description(request.getDescription())
                .build();

        return PublisherResponse.fromPublisher(publisherRepository.save(publisher));
    }

    @Transactional
    @Override
    public PublisherResponse updatePublisher(Long id, UpdatePublisherRequest request) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));

        publisher.setPublisherName(request.getPublisherName());
        publisher.setDescription(request.getDescription());


        return PublisherResponse.fromPublisher(publisherRepository.save(publisher));
    }

    @Transactional
    @Override
    public void deletePublisher(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));
        publisherRepository.delete(publisher);
    }

    @Override
    public Page<PublisherResponse> searchPublisherByName(String name, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return publisherRepository.findByPublisherNameContainingIgnoreCase(name, pageable)
                .map(PublisherResponse::fromPublisher);
    }
}
