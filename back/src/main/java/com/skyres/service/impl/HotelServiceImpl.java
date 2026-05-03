package com.skyres.service.impl;

import com.skyres.model.entity.Hotel;
import com.skyres.repository.HotelRepository;
import com.skyres.repository.specification.HotelFilterRequest;
import com.skyres.repository.specification.HotelSpecification;
import com.skyres.service.HotelService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Hotel create(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public Hotel getById(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hôtel introuvable : id=" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hotel> getAll() {
        return hotelRepository.findAll();
    }

    @Override
    @Transactional
    public Hotel update(Long id, Hotel updated) {
        Hotel existing = getById(id);

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setAddress(updated.getAddress());
        existing.setStars(updated.getStars());
        existing.setPricePerNight(updated.getPricePerNight());
        existing.setAvailable(updated.isAvailable());
        existing.setPhotoUrl(updated.getPhotoUrl());
        existing.setAverageRating(updated.getAverageRating());
        existing.setDistanceToCenter(updated.getDistanceToCenter());

        // Équipements
        existing.setHasOutdoorPool(updated.isHasOutdoorPool());
        existing.setHasIndoorPool(updated.isHasIndoorPool());
        existing.setHasBeach(updated.isHasBeach());
        existing.setHasParking(updated.isHasParking());
        existing.setHasSpa(updated.isHasSpa());
        existing.setHasAirportShuttle(updated.isHasAirportShuttle());
        existing.setHasFitnessCenter(updated.isHasFitnessCenter());
        existing.setHasBar(updated.isHasBar());

        return hotelRepository.save(existing);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!hotelRepository.existsById(id)) {
            throw new EntityNotFoundException("Hôtel introuvable : id=" + id);
        }
        hotelRepository.deleteById(id);
    }

    // ── Filtres ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<Hotel> filter(HotelFilterRequest filterRequest) {
        return hotelRepository.findAll(HotelSpecification.build(filterRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hotel> getByDestination(Long destinationId) {
        return hotelRepository.findByDestinationId(destinationId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hotel> getTopRated(Long destinationId) {
        return hotelRepository.findTopRatedByDestination(destinationId);
    }
}