package com.example.micronaut.controller;

import com.example.micronaut.model.PlayerStatistics;
import com.example.micronaut.repository.PlayerStatisticsRepository;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.*;

@Controller("/api/statistics")
public class PlayerStatisticsController {

    private final PlayerStatisticsRepository statisticsRepository;

    public PlayerStatisticsController(PlayerStatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    @Get
    public Iterable<PlayerStatistics> getAll() {
        return statisticsRepository.findAll();
    }

    @Get("/{id}")
    public HttpResponse<PlayerStatistics> getById(Long id) {
        return statisticsRepository.findById(id)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Get("/player/{playerId}")
    public HttpResponse<PlayerStatistics> getByPlayerId(Long playerId) {
        return statisticsRepository.findByPlayerId(playerId)
                .map(HttpResponse::ok)
                .orElse(HttpResponse.notFound());
    }

    @Post
    public PlayerStatistics create(@Body PlayerStatistics statistics) {
        return statisticsRepository.save(statistics);
    }

    @Put("/{id}")
    public HttpResponse<PlayerStatistics> update(
            Long id,
            @Body PlayerStatistics statistics) {

        return statisticsRepository.findById(id)
                .map(existing -> {
                    existing.setPlayerId(statistics.getPlayerId());
                    existing.setMatchesPlayed(statistics.getMatchesPlayed());
                    existing.setGoals(statistics.getGoals());
                    existing.setAssists(statistics.getAssists());
                    existing.setYellowCards(statistics.getYellowCards());
                    existing.setRedCards(statistics.getRedCards());

                    return HttpResponse.ok(
                            statisticsRepository.update(existing)
                    );
                })
                .orElse(HttpResponse.notFound());
    }

    @Delete("/{id}")
    public HttpResponse<?> delete(Long id) {
        if (statisticsRepository.findById(id).isEmpty()) {
            return HttpResponse.notFound();
        }

        statisticsRepository.deleteById(id);
        return HttpResponse.noContent();
    }
}