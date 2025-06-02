package com.example.vuvisa.controllers;

import com.example.vuvisa.api_responses.APIResponse;
import com.example.vuvisa.dtos.requests.BookRequestDTO;
import com.example.vuvisa.dtos.responses.BookResponseDTO;
import com.example.vuvisa.entities.Book;
import com.example.vuvisa.services.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix}/products/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<BookResponseDTO>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        List<BookResponseDTO> bookDTOs = books.stream()
                .map(bookService::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(bookDTOs);
    }

    @GetMapping("/page")
    public APIResponse<Page<BookResponseDTO>> getAllBooksWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String productName) {

        Pageable pageable = PageRequest.of(page, size);

        if (productName != null && !productName.isEmpty()) {
            return APIResponse.<Page<BookResponseDTO>>builder()
                    .result(bookService.searchBooksByName(productName, pageable))
                    .message("Books found by name")
                    .build();
        }

        return APIResponse.<Page<BookResponseDTO>>builder()
                .result(bookService.getAllBooksWithPagination(pageable))
                .message("Books retrieved successfully with pagination")
                .build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        BookResponseDTO dto = bookService.convertToResponseDTO(book);
        return ResponseEntity.ok(dto);
    }


//    @PostMapping
//    public ResponseEntity<Book> createBook(@RequestBody Book book) {
//        Book createdBook = bookService.createBookFromDTO(book);
//        return ResponseEntity.ok(createdBook);
//    }

//    @PostMapping
//    public ResponseEntity<Book> createBook(@RequestBody BookRequestDTO bookDTO) {
//        Book createdBook = bookService.createBookFromDTO(bookDTO);
//        return ResponseEntity.ok(createdBook);
//    }

    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody BookRequestDTO bookDTO) {
        Book savedBook = bookService.createBook(bookDTO);
        return ResponseEntity.ok(savedBook);
    }



    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody BookRequestDTO bookDTO) {
        return ResponseEntity.ok(bookService.updateBook(id, bookDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}