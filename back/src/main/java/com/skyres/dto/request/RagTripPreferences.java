package com.skyres.dto.request;

import lombok.Data;

@Data
public class RagTripPreferences {
    /** Rough total trip budget in EUR for matching destinations / hotels. */
    private Double budgetEur;
    private String season;
    /** City, country, or region the user is interested in. */
    private String destinationHint;
    private Integer adults;
    /** Optional: youngest child age for activity min_age checks. */
    private Integer youngestChildAge;
    /** Free-text interests: e.g. beach, culture, northern lights. */
    private String interests;
}
