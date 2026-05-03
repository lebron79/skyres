package com.skyres.controller;

import com.skyres.model.entity.Destination;
import com.skyres.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/destinations
     * Créer une destination.
     */
    @PostMapping
    public ResponseEntity<Destination> create(@RequestBody Destination destination) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(destinationService.create(destination));
    }

    /**
     * GET /api/destinations
     * Toutes les destinations.
     */
    @GetMapping
    public ResponseEntity<List<Destination>> getAll() {
        return ResponseEntity.ok(destinationService.getAll());
    }

    /**
     * GET /api/destinations/{id}
     * Une destination par id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Destination> getById(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getById(id));
    }

    /**
     * PUT /api/destinations/{id}
     * Modifier une destination.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Destination> update(@PathVariable Long id,
                                              @RequestBody Destination destination) {
        return ResponseEntity.ok(destinationService.update(id, destination));
    }

    /**
     * DELETE /api/destinations/{id}
     * Supprimer une destination.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        destinationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Filtres ───────────────────────────────────────────────────────────────

    /**
     * GET /api/destinations/search?keyword=paris
     * Recherche libre dans pays, ville et description.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Destination>> search(
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(destinationService.search(keyword));
    }

    /**
     * GET /api/destinations/trending
     * Destinations tendance.
     */
    @GetMapping("/trending")
    public ResponseEntity<List<Destination>> getTrending() {
        return ResponseEntity.ok(destinationService.getTrending());
    }

    /**
     * GET /api/destinations/top-rated
     * Destinations triées par note (meilleures en premier).
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<Destination>> getTopRated() {
        return ResponseEntity.ok(destinationService.getTopRated());
    }

    /**
     * GET /api/destinations/country/{country}
     * Destinations par pays.
     */
    @GetMapping("/country/{country}")
    public ResponseEntity<List<Destination>> getByCountry(@PathVariable String country) {
        return ResponseEntity.ok(destinationService.getByCountry(country));
    }

    /**
     * GET /api/destinations/climate/{climate}
     * Destinations par type de climat.
     */
    @GetMapping("/climate/{climate}")
    public ResponseEntity<List<Destination>> getByClimate(@PathVariable String climate) {
        return ResponseEntity.ok(destinationService.getByClimate(climate));
    }

    /**
     * GET /api/destinations/filter
     *
     * Tous les paramètres sont optionnels :
     *   ?country=France
     *   &climate=mediterraneen
     *   &minRating=4.0
     *   &maxBudget=1500
     *   &trending=true
     *
     * Exemple complet :
     * GET /api/destinations/filter?country=Tunisie&minRating=3.5&trending=true
     */
    @GetMapping("/filter")
    public ResponseEntity<List<Destination>> filter(
            @RequestParam(required = false) String  country,
            @RequestParam(required = false) String  climate,
            @RequestParam(required = false) Double  minRating,
            @RequestParam(required = false) Double  maxBudget,
            @RequestParam(required = false) Boolean trending) {

        return ResponseEntity.ok(
                destinationService.filter(country, climate, minRating, maxBudget, trending));
    }
}