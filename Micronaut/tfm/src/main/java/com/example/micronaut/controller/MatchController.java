package com.example.micronaut.controller;

import com.example.micronaut.model.Match;
import com.example.micronaut.repository.MatchRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;

@Controller("/api/matches")
public class MatchController {

    private final MatchRepository matchRepository;

    public MatchController(MatchRepository matchRepository) {
        this.matchRepository = matchRepository;
    }

    @Get
    public Iterable<Match> getAll() {
        return matchRepository.findAll();
    }

    @Get("/{id}")
    public HttpResponse<Match> getById(Long id) {
        return matchRepository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public Match create(@Body Match match) {
        return matchRepository.save(match);
    }

    @Put("/{id}")
    public HttpResponse<Match> update(Long id, @Body Match match) {
        return matchRepository.findById(id)
                .map(existing -> {
                    existing.setHomeTeamId(match.getHomeTeamId());
                    existing.setAwayTeamId(match.getAwayTeamId());
                    existing.setDate(match.getDate());
                    existing.setHomeScore(match.getHomeScore());
                    existing.setAwayScore(match.getAwayScore());
                    existing.setStatus(match.getStatus());

                    return HttpResponse.ok(matchRepository.update(existing));
                })
                .orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(Long id) {
        if (matchRepository.findById(id).isEmpty()) {
            return HttpResponse.notFound();
        }

        matchRepository.deleteById(id);
        return HttpResponse.noContent();
    }
}