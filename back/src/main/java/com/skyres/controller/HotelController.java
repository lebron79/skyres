package com.skyres.controller;

import com.skyres.model.entity.Hotel;
import com.skyres.repository.specification.HotelFilterRequest;
import com.skyres.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/hotels
     * Créer un hôtel.
     */
    @PostMapping
    public ResponseEntity<Hotel> create(@RequestBody Hotel hotel) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hotelService.create(hotel));
    }

    /**
     * GET /api/hotels
     * Récupérer tous les hôtels.
     */
    @GetMapping
    public ResponseEntity<List<Hotel>> getAll() {
        return ResponseEntity.ok(hotelService.getAll());
    }

    /**
     * GET /api/hotels/{id}
     * Récupérer un hôtel par son id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getById(id));
    }

    /**
     * PUT /api/hotels/{id}
     * Modifier un hôtel.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> update(@PathVariable Long id,
                                        @RequestBody Hotel hotel) {
        return ResponseEntity.ok(hotelService.update(id, hotel));
    }

    /**
     * DELETE /api/hotels/{id}
     * Supprimer un hôtel.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hotelService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Filtres ───────────────────────────────────────────────────────────────

    /**
     * POST /api/hotels/filter
     *
     * Corps JSON exemple :
     * {
     *   "destinationId"  : 1,
     *   "minStars"       : 3,
     *   "maxStars"       : 5,
     *   "minRating"      : 8.0,      ← Superbe et mieux
     *   "outdoorPool"    : true,
     *   "indoorPool"     : false,
     *   "beach"          : false,
     *   "parking"        : true,
     *   "spa"            : true,
     *   "airportShuttle" : false,
     *   "fitnessCenter"  : true,
     *   "bar"            : true,
     *   "maxDistanceKm"  : 5.0,
     *   "minPrice"       : null,
     *   "maxPrice"       : 300.0,
     *   "keyword"        : null
     * }
     *
     * Catégories de note (minRating) :
     *   Fabuleux      → 9.0
     *   Exceptionnel  → 9.5
     *   Superbe       → 8.0
     *   Très bien     → 8.4
     *   Bien          → 7.5
     *   Agréable      → 6.0
     */
    @PostMapping("/filter")
    public ResponseEntity<List<Hotel>> filter(@RequestBody HotelFilterRequest filterRequest) {
        return ResponseEntity.ok(hotelService.filter(filterRequest));
    }

    /**
     * GET /api/hotels/destination/{destinationId}
     * Tous les hôtels d'une destination.
     */
    @GetMapping("/destination/{destinationId}")
    public ResponseEntity<List<Hotel>> getByDestination(@PathVariable Long destinationId) {
        return ResponseEntity.ok(hotelService.getByDestination(destinationId));
    }

    /**
     * GET /api/hotels/destination/{destinationId}/top-rated
     * Top hôtels d'une destination triés par note.
     */
    @GetMapping("/destination/{destinationId}/top-rated")
    public ResponseEntity<List<Hotel>> getTopRated(@PathVariable Long destinationId) {
        return ResponseEntity.ok(hotelService.getTopRated(destinationId));
    }
}