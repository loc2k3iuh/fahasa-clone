package com.example.vuvisa.dtos.responses;

import com.example.vuvisa.entities.Author;
import com.example.vuvisa.entities.Book;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthorReponse implements Serializable {
    private static final long serialVersionUID = 1L;
    Long id;
    String authorName;
    String description;
    Set<Long> bookIds;//có ther rỗng nếu kh có sách

    public static AuthorReponse fromAuthor(Author author) {
        return AuthorReponse.builder()
                .id(author.getId())
                .authorName(author.getAuthorName())
                .description(author.getDescription())
                .bookIds(author.getBooks()!= null?
                        author.getBooks().stream()
                                .map(Book::getId)
                                .collect(Collectors.toSet())
                        :Set.of()).build();
    }

}
