package com.skyres.service.impl;

import com.skyres.model.entity.Destination;
import com.skyres.repository.DestinationRepository;
import com.skyres.service.DestinationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Destination create(Destination destination) {
        return destinationRepository.save(destination);
    }

    @Override
    @Transactional(readOnly = true)
    public Destination getById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Destination introuvable : id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> getAll() {
        return destinationRepository.findAll();
    }

    @Override
    @Transactional
    public Destination update(Long id, Destination updated) {
        Destination existing = getById(id);

        existing.setCountry(updated.getCountry());
        existing.setCity(updated.getCity());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setClimate(updated.getClimate());
        existing.setEstimatedBudget(updated.getEstimatedBudget());
        existing.setAverageRating(updated.getAverageRating());
        existing.setTrending(updated.isTrending());

        return destinationRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new EntityNotFoundException("Destination introuvable : id=" + id);
        }
        destinationRepository.deleteById(id);
    }

    // ── Filtres ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<Destination> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return destinationRepository.findAll();
        }
        return destinationRepository.search(keyword.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> getTrending() {
        return destinationRepository.findByTrendingTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> getTopRated() {
        return destinationRepository.findTopRated();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> getByCountry(String country) {
        return destinationRepository.findByCountryIgnoreCase(country);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> getByClimate(String climate) {
        return destinationRepository.findByClimateIgnoreCase(climate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Destination> filter(String country, String climate,
                                    Double minRating, Double maxBudget, Boolean trending) {
        return destinationRepository.findByFilters(country, climate, minRating, maxBudget, trending);
    }
}