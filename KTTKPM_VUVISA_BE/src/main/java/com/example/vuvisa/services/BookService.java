package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.BookRequestDTO;
import com.example.vuvisa.dtos.responses.BookResponseDTO;
import com.example.vuvisa.entities.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    /**
     * Get all books
     * @return List of all books
     */
    List<Book> getAllBooks();

    /**
     * Get all books with pagination
     * @param pageable Pagination information
     * @return Page of books
     */
    Page<BookResponseDTO> getAllBooksWithPagination(Pageable pageable);

    /**
     * Search books by name with pagination
     * @param productName Name to search for
     * @param pageable Pagination information
     * @return Page of books matching the search criteria
     */
    Page<BookResponseDTO> searchBooksByName(String productName, Pageable pageable);

    /**
     * Get a book by its ID
     * @param id ID of the book to retrieve
     * @return The book with the specified ID
     * @throws RuntimeException if the book is not found
     */
    Book getBookById(Long id);

    /**
     * Get a book DTO by its ID
     * @param id ID of the book to retrieve
     * @return The book DTO with the specified ID
     * @throws RuntimeException if the book is not found
     */
    BookResponseDTO getBookDTOById(Long id);

    /**
     * Convert a Book entity to a BookResponseDTO
     * @param book The book entity to convert
     * @return The converted BookResponseDTO
     */
    BookResponseDTO convertToResponseDTO(Book book);

    /**
     * Create a new book
     * @param bookDTO The book data to create
     * @return The created book
     */
    Book createBook(BookRequestDTO bookDTO);

    /**
     * Convert a BookRequestDTO to a Book entity
     * @param dto The BookRequestDTO to convert
     * @return The converted Book entity
     */
    Book convertToEntity(BookRequestDTO dto);

    /**
     * Update an existing book
     * @param id ID of the book to update
     * @param dto The new book data
     * @return The updated book
     * @throws RuntimeException if the book is not found
     */
    Book updateBook(Long id, BookRequestDTO dto);

    /**
     * Delete a book by its ID
     * @param id ID of the book to delete
     * @throws RuntimeException if the book is not found
     */
    void deleteBook(Long id);
}
