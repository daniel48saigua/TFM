package com.example.spring.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("player_statistics")
public class PlayerStatistics {
    @Id
    private Long id;
    private Long playerId;
    private int matchesPlayed;
    private int goals;
    private int assists;
    private int yellowCards;
    private int redCards;

    public PlayerStatistics() {}

    public PlayerStatistics(Long id, Long playerId, int matchesPlayed, int goals,
                            int assists, int yellowCards, int redCards) {
        this.id = id;
        this.playerId = playerId;
        this.matchesPlayed = matchesPlayed;
        this.goals = goals;
        this.assists = assists;
        this.yellowCards = yellowCards;
        this.redCards = redCards;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long value) { playerId = value; }
    public int getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(int value) { matchesPlayed = value; }
    public int getGoals() { return goals; }
    public void setGoals(int goals) { this.goals = goals; }
    public int getAssists() { return assists; }
    public void setAssists(int assists) { this.assists = assists; }
    public int getYellowCards() { return yellowCards; }
    public void setYellowCards(int value) { yellowCards = value; }
    public int getRedCards() { return redCards; }
    public void setRedCards(int value) { redCards = value; }
}
