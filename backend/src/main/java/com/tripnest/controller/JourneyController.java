package com.tripnest.controller;

import com.tripnest.dto.JourneyRequest;
import com.tripnest.dto.JourneyResponse;
import com.tripnest.service.JourneyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journeys")
public class JourneyController {

    private final JourneyService journeyService;

    public JourneyController(JourneyService journeyService) {
        this.journeyService = journeyService;
    }

    @PostMapping
    public ResponseEntity<JourneyResponse> createJourney(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody JourneyRequest request) {
        JourneyResponse created = journeyService.createJourney(authHeader, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<JourneyResponse>> getAllJourneys(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        List<JourneyResponse> journeys = journeyService.getAllJourneys(authHeader);
        return ResponseEntity.ok(journeys);
    }

    @GetMapping("/my")
    public ResponseEntity<List<JourneyResponse>> getMyJourneys(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        List<JourneyResponse> myJourneys = journeyService.getMyJourneys(authHeader);
        return ResponseEntity.ok(myJourneys);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JourneyResponse> getJourneyById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        JourneyResponse journey = journeyService.getJourneyById(authHeader, id);
        return ResponseEntity.ok(journey);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JourneyResponse> updateJourney(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @Valid @RequestBody JourneyRequest request) {
        JourneyResponse updated = journeyService.updateJourney(authHeader, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJourney(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        journeyService.deleteJourney(authHeader, id);
        return ResponseEntity.noContent().build();
    }
}
