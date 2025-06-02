package com.example.vuvisa.services.impl;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import com.example.vuvisa.dtos.requests.CreateAuthorRequest;
import com.example.vuvisa.dtos.requests.UpdateAuthorRequest;
import com.example.vuvisa.dtos.responses.AuthorReponse;
import com.example.vuvisa.entities.Author;
import com.example.vuvisa.entities.Book;
import com.example.vuvisa.repositories.AuthorRepository;
import com.example.vuvisa.repositories.BookRepository;
import com.example.vuvisa.services.AuthorService;

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
public class AuthorImpl implements AuthorService {
    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    @Transactional
    @Override

    public AuthorReponse createAuthor(CreateAuthorRequest request){
        if (authorRepository.existsByAuthorName(request.getAuthorName())){
            throw new RuntimeException("Author name already exists");
        }
        Author author = Author.builder()
                .authorName(request.getAuthorName())
                .description(request.getDescription())
                .books(new HashSet<>()).build();
        if(request.getBookIds()!=null && !request.getBookIds().isEmpty()){
            Set<Book> books = (Set<Book>) bookRepository.findAllById(request.getBookIds());
            author.setBooks(books);
        }
        return AuthorReponse.fromAuthor(authorRepository.save(author));
    }
    @Override
   
    public AuthorReponse getAuthorById(Long id){

        Author author=authorRepository.findById(id).orElseThrow(()-> new RuntimeException("Author not found"));
        return AuthorReponse.fromAuthor(author);
    }
    @Override
    public Page<AuthorReponse> getAllAuthorsByPage(int page){
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return authorRepository.findAll(pageable).map(AuthorReponse::fromAuthor);
    }
    @Transactional
    @Override

    public AuthorReponse updateAuthor(Long id, UpdateAuthorRequest request){
        Author author=authorRepository.findById(id).orElseThrow(()-> new RuntimeException("Author not found"));
        author.setAuthorName(request.getAuthorName());
        author.setDescription(request.getDescription());

        if(request.getBookIds()!=null ){
            Set<Book> books=(Set<Book>) bookRepository.findAllById(request.getBookIds());
            author.setBooks(books);
        }
        return AuthorReponse.fromAuthor(authorRepository.save(author));
    }
    @Transactional
    @Override

    public void deteleAuthor(Long id){
        Author author=authorRepository.findById(id).orElseThrow(()-> new RuntimeException("Author not found"));
        authorRepository.delete(author);
    }
    @Override
    public Page<AuthorReponse> getAuthorsByBookId(long bookId, int page){
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return authorRepository.findByBooks_Id(bookId, pageable).map(AuthorReponse::fromAuthor);
    }
    @Override
    public Page<AuthorReponse> searchAuthorByName(String name, int page){
        Pageable pageable = PageRequest.of(page, 10, Sort.by("id").ascending());
        return authorRepository.findByAuthorNameContainingIgnoreCase(name,pageable).map(AuthorReponse::fromAuthor);
    }

}
