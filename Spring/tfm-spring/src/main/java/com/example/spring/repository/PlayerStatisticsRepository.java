package com.example.spring.repository;

import com.example.spring.model.PlayerStatistics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerStatisticsRepository extends JpaRepository<PlayerStatistics, Long> {
    Optional<PlayerStatistics> findByPlayerId(Long playerId);
}
