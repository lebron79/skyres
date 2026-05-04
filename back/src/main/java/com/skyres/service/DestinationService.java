package com.skyres.service;

import com.skyres.model.entity.Destination;

import java.util.List;

public interface DestinationService {

    // ── CRUD ──────────────────────────────────────────────────────────────────

    Destination create(Destination destination);

    Destination getById(Long id);

    List<Destination> getAll();

    Destination update(Long id, Destination destination);

    void delete(Long id);

    // ── Filtres ───────────────────────────────────────────────────────────────

    List<Destination> search(String keyword);

    List<Destination> getTrending();

    List<Destination> getTopRated();

    List<Destination> getByCountry(String country);

    List<Destination> getByClimate(String climate);

    List<Destination> filter(String country, String climate,
                             Double minRating, Double maxBudget, Boolean trending);
}