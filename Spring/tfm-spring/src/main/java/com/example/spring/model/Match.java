package com.example.spring.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "home_team_id")
    private Long homeTeamId;

    @Column(name = "away_team_id")
    private Long awayTeamId;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(name = "home_score", nullable = false)
    private int homeScore;

    @Column(name = "away_score", nullable = false)
    private int awayScore;

    @Column(nullable = false, length = 30)
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
