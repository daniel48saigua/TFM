package com.example.spring.controller;

import com.example.spring.model.Match;
import com.example.spring.repository.MatchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {
    private final MatchRepository repository;

    public MatchController(MatchRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Match> getAll() { return repository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Match create(@RequestBody Match match) { return repository.save(match); }

    @PutMapping("/{id}")
    public ResponseEntity<Match> update(@PathVariable Long id, @RequestBody Match match) {
        return repository.findById(id).map(existing -> {
            existing.setHomeTeamId(match.getHomeTeamId());
            existing.setAwayTeamId(match.getAwayTeamId());
            existing.setDate(match.getDate());
            existing.setHomeScore(match.getHomeScore());
            existing.setAwayScore(match.getAwayScore());
            existing.setStatus(match.getStatus());
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
