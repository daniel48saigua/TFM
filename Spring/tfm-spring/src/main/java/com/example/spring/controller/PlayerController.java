package com.example.spring.controller;

import com.example.spring.model.Player;
import com.example.spring.repository.PlayerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {
    private final PlayerRepository repository;

    public PlayerController(PlayerRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Player> getAll() { return repository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Player create(@RequestBody Player player) { return repository.save(player); }

    @PutMapping("/{id}")
    public ResponseEntity<Player> update(@PathVariable Long id, @RequestBody Player player) {
        return repository.findById(id).map(existing -> {
            existing.setName(player.getName());
            existing.setAge(player.getAge());
            existing.setPosition(player.getPosition());
            existing.setTeamId(player.getTeamId());
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
