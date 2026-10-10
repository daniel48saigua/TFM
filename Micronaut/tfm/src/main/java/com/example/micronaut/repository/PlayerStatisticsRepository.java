package com.example.micronaut.repository;

import com.example.micronaut.model.PlayerStatistics;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.model.query.builder.sql.Dialect;
import io.micronaut.data.repository.CrudRepository;

import java.util.Optional;

@JdbcRepository(dialect = Dialect.POSTGRES)
public interface PlayerStatisticsRepository extends CrudRepository<PlayerStatistics, Long> {

    Optional<PlayerStatistics> findByPlayerId(Long playerId);
}