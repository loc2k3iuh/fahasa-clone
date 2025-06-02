package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreatePublisherRequest;
import com.example.vuvisa.dtos.requests.UpdatePublisherRequest;
import com.example.vuvisa.dtos.responses.PublisherResponse;
import com.example.vuvisa.services.PublisherService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/publishers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublisherController {

    PublisherService publisherService;

    @PostMapping("/create")
    public APIResponse<PublisherResponse> createPublisher(
            @Valid @RequestBody CreatePublisherRequest request) {
        return APIResponse.<PublisherResponse>builder()
                .result(publisherService.createPublisher(request))
                .message("Publisher created successfully")
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<PublisherResponse> getPublisherById(@PathVariable("id") long id) {
        return APIResponse.<PublisherResponse>builder()
                .result(publisherService.getPublisherById(id))
                .message("Publisher retrieved successfully").build();
    }

    @GetMapping
    public APIResponse<Page<PublisherResponse>> getAllPublishersByPage(@RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(required = false) String publisherName) {
        if (publisherName != null && !publisherName.isEmpty()) {
            return APIResponse.<Page<PublisherResponse>>builder()
                    .result(publisherService.searchPublisherByName(publisherName, page)).build();
        }
        return APIResponse.<Page<PublisherResponse>>builder()
                .result(publisherService.getAllPublishersByPage(page))
                .message("Publishers retrieved successfully").build();
    }

    @PutMapping("/{id}")
    public APIResponse<PublisherResponse> updatePublisher(@PathVariable long id,
                                                          @Valid @RequestBody UpdatePublisherRequest request) {
        return APIResponse.<PublisherResponse>builder()
                .result(publisherService.updatePublisher(id, request))
                .message("Publisher updated successfully").build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<String> deletePublisher(@PathVariable long id) {
        publisherService.deletePublisher(id);
        return APIResponse.<String>builder()
                .message("Publisher deleted successfully").build();
    }
}
