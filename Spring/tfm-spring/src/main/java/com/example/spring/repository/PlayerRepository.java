package com.example.spring.repository;

import com.example.spring.model.Player;
import org.springframework.data.repository.ListCrudRepository;

public interface PlayerRepository extends ListCrudRepository<Player, Long> {
}
