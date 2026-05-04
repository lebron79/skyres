package com.skyres.service;
import com.skyres.model.entity.Hotel;
import com.skyres.repository.specification.HotelFilterRequest;
import java.util.List;
public interface HotelService {

    // ── CRUD ─────────────────────────────────────────────────────────────────

    Hotel create(Hotel hotel);

    Hotel getById(Long id);

    List<Hotel> getAll();

    Hotel update(Long id, Hotel hotel);

    void delete(Long id);

    // ── Filtres ───────────────────────────────────────────────────────────────

    List<Hotel> filter(HotelFilterRequest filterRequest);

    List<Hotel> getByDestination(Long destinationId);

    List<Hotel> getTopRated(Long destinationId);
}