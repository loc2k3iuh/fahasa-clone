package com.example.vuvisa.services.impl;

import com.example.vuvisa.dtos.requests.BookRequestDTO;
import com.example.vuvisa.dtos.responses.AuthorResponseDTO;
import com.example.vuvisa.dtos.responses.BookResponseDTO;
import com.example.vuvisa.dtos.responses.DiscountResponse;
import com.example.vuvisa.entities.*;
import com.example.vuvisa.repositories.*;
import com.example.vuvisa.services.BookService;
import com.example.vuvisa.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final ImageProductRepository imageProductRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final PublisherRepository publisherRepository;

    private final CloudinaryService cloudinaryService;

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    @Override
    public Page<BookResponseDTO> getAllBooksWithPagination(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.ASC, "id")
        );
        return bookRepository.findAll(sortedPageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public Page<BookResponseDTO> searchBooksByName(String productName, Pageable pageable) {
        return bookRepository.findByProductNameContainingIgnoreCase(productName, pageable)
                .map(this::convertToResponseDTO);
    }

    @Override
    public Book getBookById(Long id) {
        return bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
    }

    @Override
    public BookResponseDTO getBookDTOById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        return convertToResponseDTO(book);
    }

    @Override
    public BookResponseDTO convertToResponseDTO(Book book) {
        BookResponseDTO dto = new BookResponseDTO();
        dto.setId(book.getId());
        dto.setProductName(book.getProductName());
        dto.setDescription(book.getDescription());
        dto.setPrice((double) book.getPrice());
        dto.setStockQuantity(book.getStockQuantity());
        dto.setImageUrl(book.getImageUrl());
        dto.setIsbn(book.getIsbn());
        dto.setPublisherDate(book.getPublisherDate());

        dto.setCategory(book.getCategory());
        dto.setSupplier(book.getSupplier());
        dto.setPublisher(book.getPublisher());
        dto.setImageProducts(book.getImageProducts());

        // convert authors
        Set<AuthorResponseDTO> authors = book.getAuthors().stream().map(author -> {
            AuthorResponseDTO authorDTO = new AuthorResponseDTO();
            authorDTO.setId(author.getId());
            authorDTO.setAuthorName(author.getAuthorName());
            authorDTO.setDescription(author.getDescription());
            return authorDTO;
        }).collect(Collectors.toSet());
        dto.setAuthors(authors);

        // convert discounts
        if (book.getDiscounts() != null) {
            Set<DiscountResponse> discounts = book.getDiscounts().stream()
                .map(DiscountResponse::fromDiscount)
                .collect(Collectors.toSet());
            dto.setDiscounts(discounts);
        }

        return dto;
    }

    @Override
    public Book createBook(BookRequestDTO bookDTO) {
        Book book = convertToEntity(bookDTO);
        return bookRepository.save(book);
    }

    @Override
    public Book convertToEntity(BookRequestDTO dto) {
        Book book = new Book();
        book.setProductName(dto.getProductName());
        book.setDescription(dto.getDescription());
        book.setPrice(dto.getPrice().longValue());
        book.setStockQuantity(dto.getStockQuantity());
        book.setImageUrl(dto.getImageUrl());
        book.setIsbn(dto.getIsbn());
        book.setPublisherDate(dto.getPublisherDate());

        // Gắn Category
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            book.setCategory(category);
        }

        // Gắn Supplier
        if (dto.getSupplier() != null && dto.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            book.setSupplier(supplier);
        }

        // Gắn Publisher
        if (dto.getPublisher() != null && dto.getPublisher().getId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisher().getId())
                    .orElseThrow(() -> new RuntimeException("Publisher not found"));
            book.setPublisher(publisher);
        }

        // Gắn Authors
        if (dto.getAuthors() != null && !dto.getAuthors().isEmpty()) {
            Set<Author> authors = dto.getAuthors().stream()
                    .map(authorDTO -> authorRepository.findById(authorDTO.getId())
                            .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorDTO.getId())))
                    .collect(Collectors.toSet());
            book.setAuthors(authors);
        }

        // Gắn ImageProducts
        if (dto.getImageProducts() != null && !dto.getImageProducts().isEmpty()) {
            Set<ImageProduct> imageProducts = dto.getImageProducts().stream().map(imgDTO -> {
                ImageProduct image = new ImageProduct();
                image.setDescription(imgDTO.getDescription());
                image.setUrl(imgDTO.getUrl());
                image.setProduct(book); // gắn ngược về sản phẩm
                return image;
            }).collect(Collectors.toSet());
            book.setImageProducts(imageProducts);
        }

        return book;
    }

    @Override
    public Book updateBook(Long id, BookRequestDTO dto) {
        Book existingBook = getBookById(id);

        existingBook.setProductName(dto.getProductName());
        existingBook.setDescription(dto.getDescription());
        existingBook.setPrice(dto.getPrice().longValue());
        existingBook.setStockQuantity(dto.getStockQuantity());
        existingBook.setIsbn(dto.getIsbn());
        existingBook.setPublisherDate(dto.getPublisherDate());

        // cập nhật ảnh chính trên clound
        if(dto.getImageUrl() != null && !dto.getImageUrl().isEmpty()) {
            if (existingBook.getImageUrl() != null && !existingBook.getImageUrl().isEmpty()) {
                processMedia(existingBook.getImageUrl());
            }
            existingBook.setImageUrl(dto.getImageUrl());
        }

        // Cập nhật Category
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = categoryRepository.findById(dto.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existingBook.setCategory(category);
        }

        // Cập nhật Supplier
        if (dto.getSupplier() != null && dto.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingBook.setSupplier(supplier);
        }

        // Cập nhật Publisher
        if (dto.getPublisher() != null && dto.getPublisher().getId() != null) {
            Publisher publisher = publisherRepository.findById(dto.getPublisher().getId())
                    .orElseThrow(() -> new RuntimeException("Publisher not found"));
            existingBook.setPublisher(publisher);
        }

        // Cập nhật Authors
        if (dto.getAuthors() != null && !dto.getAuthors().isEmpty()) {
            Set<Author> authors = dto.getAuthors().stream()
                    .map(authorDTO -> authorRepository.findById(authorDTO.getId())
                            .orElseThrow(() -> new RuntimeException("Author not found with id: " + authorDTO.getId())))
                    .collect(Collectors.toSet());
            existingBook.setAuthors(authors);
        }

        // ❗ XÓA TỪ TẬP HỢP COLLECTION CHỨ KHÔNG DÙNG REPOSITORY TRỰC TIẾP
        if (existingBook.getImageProducts() != null) {
            existingBook.getImageProducts().forEach(img -> {
                if (img.getUrl() != null && !img.getUrl().isEmpty()) {
                    processMedia(img.getUrl());
                }
            });
            existingBook.getImageProducts().clear();  // Hibernate sẽ tự orphan remove
        }

        if (dto.getImageProducts() != null && !dto.getImageProducts().isEmpty()) {
            Set<ImageProduct> newImages = dto.getImageProducts().stream().map(imgDTO -> {
                ImageProduct image = new ImageProduct();
                image.setDescription(imgDTO.getDescription());
                image.setUrl(imgDTO.getUrl());
                image.setProduct(existingBook);
                return image;
            }).collect(Collectors.toSet());

            existingBook.getImageProducts().addAll(newImages);
        }

        return bookRepository.save(existingBook);
    }


    @Override
    public void deleteBook(Long id) {
        // Lấy book
        Book book = getBookById(id);

        // Xóa ảnh trong bảng phụ (imageProducts)
        List<ImageProduct> imageProducts = imageProductRepository.findByProduct(book);
        imageProducts.forEach(img -> {
            if (img.getUrl() != null && !img.getUrl().isEmpty()) {
                processMedia(img.getUrl());
            }
        });
        imageProductRepository.deleteAll(imageProducts);

        // Xóa ảnh chính nếu có
        if (book.getImageUrl() != null && !book.getImageUrl().isEmpty()) {
            processMedia(book.getImageUrl());
        }

        // Xóa book
        bookRepository.deleteById(id);
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
