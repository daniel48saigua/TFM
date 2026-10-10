package com.example.micronaut.controller;

import com.example.micronaut.model.Player;
import com.example.micronaut.repository.PlayerRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;

@Controller("/api/players")
public class PlayerController {

    private final PlayerRepository playerRepository;

    public PlayerController(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @Get
    public Iterable<Player> getAll() {
        return playerRepository.findAll();
    }

    @Get("/{id}")
    public HttpResponse<Player> getById(Long id) {
        return playerRepository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public Player create(@Body Player player) {
        return playerRepository.save(player);
    }

    @Put("/{id}")
    public HttpResponse<Player> update(Long id, @Body Player player) {
        return playerRepository.findById(id)
                .map(existing -> {
                    existing.setName(player.getName());
                    existing.setAge(player.getAge());
                    existing.setPosition(player.getPosition());
                    existing.setTeamId(player.getTeamId());

                    return HttpResponse.ok(playerRepository.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(Long id) {
        if (playerRepository.findById(id).isEmpty()) {
            return HttpResponse.notFound();
        }

        playerRepository.deleteById(id);
        return HttpResponse.noContent();
    }
}