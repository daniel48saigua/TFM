package com.example.spring.controller;

import com.example.spring.model.PlayerStatistics;
import com.example.spring.repository.PlayerStatisticsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/statistics")
public class PlayerStatisticsController {
    private final PlayerStatisticsRepository repository;

    public PlayerStatisticsController(PlayerStatisticsRepository repository) { this.repository = repository; }

    @GetMapping
    public List<PlayerStatistics> getAll() { return repository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerStatistics> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<PlayerStatistics> getByPlayerId(@PathVariable Long playerId) {
        return repository.findByPlayerId(playerId).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PlayerStatistics create(@RequestBody PlayerStatistics statistics) {
        return repository.save(statistics);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlayerStatistics> update(@PathVariable Long id,
                                                    @RequestBody PlayerStatistics statistics) {
        return repository.findById(id).map(existing -> {
            existing.setPlayerId(statistics.getPlayerId());
            existing.setMatchesPlayed(statistics.getMatchesPlayed());
            existing.setGoals(statistics.getGoals());
            existing.setAssists(statistics.getAssists());
            existing.setYellowCards(statistics.getYellowCards());
            existing.setRedCards(statistics.getRedCards());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
