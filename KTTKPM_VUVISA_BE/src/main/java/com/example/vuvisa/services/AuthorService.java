package com.example.vuvisa.services;

import com.example.vuvisa.dtos.requests.CreateAuthorRequest;
import com.example.vuvisa.dtos.requests.UpdateAuthorRequest;
import com.example.vuvisa.dtos.responses.AuthorReponse;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

public interface AuthorService {

    @Transactional
    AuthorReponse createAuthor(CreateAuthorRequest request);

    AuthorReponse getAuthorById(Long id);

    Page<AuthorReponse> getAllAuthorsByPage(int page);

    @Transactional
    AuthorReponse updateAuthor(Long id, UpdateAuthorRequest request);

    @Transactional
    void deteleAuthor(Long id);

    Page<AuthorReponse> getAuthorsByBookId(long bookId, int page);

    Page<AuthorReponse> searchAuthorByName(String name, int page);
}
