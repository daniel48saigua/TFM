
package com.example.micronaut.repository;

import com.example.micronaut.model.Team;
import io.micronaut.data.jdbc.annotation.JdbcRepository;
import io.micronaut.data.repository.CrudRepository;
import io.micronaut.data.model.query.builder.sql.Dialect;

@JdbcRepository(dialect = Dialect.POSTGRES)
public interface TeamRepository extends CrudRepository<Team, Long> {
}


