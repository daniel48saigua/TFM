package com.example.spring.repository;

import com.example.spring.model.PlayerStatistics;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;

public interface PlayerStatisticsRepository extends ListCrudRepository<PlayerStatistics, Long> {
    Optional<PlayerStatistics> findByPlayerId(Long playerId);
}
