package com.example.micronaut.controller;

import com.example.micronaut.model.Team;
import com.example.micronaut.repository.TeamRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;

@Controller("/api/teams")
public class TeamController {

    private final TeamRepository teamRepository;

    public TeamController(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Get
    public Iterable<Team> getAll() {
        return teamRepository.findAll();
    }

    @Get("/{id}")
    public HttpResponse<Team> getById(Long id) {
        return teamRepository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public Team create(@Body Team team) {
        return teamRepository.save(team);
    }

    @Put("/{id}")
    public HttpResponse<Team> update(Long id, @Body Team team) {

        return teamRepository.findById(id)
                .map(existingTeam -> {
                    existingTeam.setName(team.getName());
                    existingTeam.setCity(team.getCity());
                    existingTeam.setStadium(team.getStadium());

                    return HttpResponse.ok(teamRepository.update(existingTeam));
                })
                .orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(Long id) {

        if (teamRepository.findById(id).isEmpty()) {
            return HttpResponse.notFound();
        }

        teamRepository.deleteById(id);
        return HttpResponse.noContent();
    }
}