package com.example.spring.repository;

import com.example.spring.model.Match;
import org.springframework.data.repository.ListCrudRepository;

public interface MatchRepository extends ListCrudRepository<Match, Long> {
}
