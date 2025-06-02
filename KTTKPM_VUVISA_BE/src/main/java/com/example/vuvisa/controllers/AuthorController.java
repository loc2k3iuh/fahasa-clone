package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.CreateAuthorRequest;
import com.example.vuvisa.dtos.requests.UpdateAuthorRequest;
import com.example.vuvisa.dtos.responses.AuthorReponse;
import com.example.vuvisa.services.AuthorService;
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
@RequestMapping("${api.prefix}/authors")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthorController {
    private final AuthorService authorService;

    @PostMapping("/create")
    public APIResponse<AuthorReponse> createAuthor(
            @Valid @RequestBody CreateAuthorRequest request) {
        return APIResponse.<AuthorReponse>builder()
                .result(authorService.createAuthor(request))
                .message("Author created successfully")
                .build();
    }
    @GetMapping("/{id}")
    public APIResponse<AuthorReponse> getAuthorById(@PathVariable("id") long id) {
        return APIResponse.<AuthorReponse>builder()
                .result(authorService.getAuthorById(id))
                .message("Author retrived successfully").build();
    }

    @GetMapping
    public APIResponse<Page<AuthorReponse>> getAllAuthorsByPage(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(required = false) String authorName){
        if(authorName != null && !authorName.isEmpty()){
            return APIResponse.<Page<AuthorReponse>>builder()
                    .result(authorService.searchAuthorByName(authorName,page)).build();
        }
        return APIResponse.<Page<AuthorReponse>>builder()
                .result(authorService.getAllAuthorsByPage(page))
                .message("Authors retrieved successfully").build();
    }
    @PutMapping("/{id}")
    public APIResponse<AuthorReponse> updateAuthor(@PathVariable long id,@Valid @RequestBody UpdateAuthorRequest request) {
        return APIResponse.<AuthorReponse>builder()
                .result(authorService.updateAuthor(id,request))
                .message("Author updated successfully").build();

    }
    @DeleteMapping("/{id}")
    public APIResponse<String> deleteAuthor(@PathVariable long id) {
        authorService.deteleAuthor(id);
        return APIResponse.<String>builder()
                .message("Author delete successfully").build();
    }
    @GetMapping("/by-book/{bookId}")
    public APIResponse<Page<AuthorReponse>> getAuthorsByBookId(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page) {
        return APIResponse.<Page<AuthorReponse>>builder()
                .result(authorService.getAuthorsByBookId(bookId, page))
                .message("Authors by book retrieved successfully")
                .build();
    }
}
