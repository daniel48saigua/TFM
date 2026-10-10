package com.example.spring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Table("matches")
public class Match {
    @Id
    private Long id;
    private Long homeTeamId;
    private Long awayTeamId;
    private LocalDateTime date;
    private int homeScore;
    private int awayScore;
    private String status;

    public Match() {}

    public Match(Long id, Long homeTeamId, Long awayTeamId, LocalDateTime date,
                 int homeScore, int awayScore, String status) {
        this.id = id;
        this.homeTeamId = homeTeamId;
        this.awayTeamId = awayTeamId;
        this.date = date;
        this.homeScore = homeScore;
        this.awayScore = awayScore;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getHomeTeamId() { return homeTeamId; }
    public void setHomeTeamId(Long value) { homeTeamId = value; }
    public Long getAwayTeamId() { return awayTeamId; }
    public void setAwayTeamId(Long value) { awayTeamId = value; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public int getHomeScore() { return homeScore; }
    public void setHomeScore(int value) { homeScore = value; }
    public int getAwayScore() { return awayScore; }
    public void setAwayScore(int value) { awayScore = value; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
