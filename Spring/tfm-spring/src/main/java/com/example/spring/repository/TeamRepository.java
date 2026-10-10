package com.example.spring.repository;

import com.example.spring.model.Team;
import org.springframework.data.repository.ListCrudRepository;

public interface TeamRepository extends ListCrudRepository<Team, Long> {
}
