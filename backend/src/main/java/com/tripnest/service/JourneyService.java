package com.tripnest.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.JourneyRequest;
import com.tripnest.dto.JourneyResponse;
import com.tripnest.dto.UserDto;
import com.tripnest.exception.ForbiddenException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JourneyService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final AuthService authService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JourneyService(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Create a new Journey belonging to the authenticated user.
     */
    public JourneyResponse createJourney(String authHeader, JourneyRequest request) {
        UserDto user = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/journeys";

        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", user.getId());
        body.put("title", request.getTitle());
        body.put("destination", request.getDestination());
        body.put("description", request.getDescription());
        body.put("start_date", request.getStartDate() != null ? request.getStartDate().toString() : null);
        body.put("end_date", request.getEndDate() != null ? request.getEndDate().toString() : null);
        body.put("cover_image_url", request.getCoverImageUrl());
        body.put("travel_type", request.getTravelType());
        body.put("budget", request.getBudget());
        body.put("travelers", request.getTravelers() != null ? request.getTravelers() : 1);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            List<JourneyResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<JourneyResponse>>() {});
            if (list != null && !list.isEmpty()) {
                return list.get(0);
            }
            throw new RuntimeException("Failed to retrieve created journey.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to create journey.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to create journey. Please check database connection.");
        }
    }

    /**
     * Get all journeys available to authenticated users.
     */
    public List<JourneyResponse> getAllJourneys(String authHeader) {
        extractAuthenticatedUser(authHeader); // Verify auth token validity

        String url = supabaseUrl + "/rest/v1/journeys?select=*&order=created_at.desc";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return objectMapper.readValue(response.getBody(), new TypeReference<List<JourneyResponse>>() {});
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch journeys.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch journeys.");
        }
    }

    /**
     * Get journeys belonging exclusively to the authenticated user.
     */
    public List<JourneyResponse> getMyJourneys(String authHeader) {
        UserDto user = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/journeys?user_id=eq." + user.getId() + "&select=*&order=created_at.desc";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return objectMapper.readValue(response.getBody(), new TypeReference<List<JourneyResponse>>() {});
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch user journeys.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch user journeys.");
        }
    }

    /**
     * Get a specific journey by ID.
     */
    public JourneyResponse getJourneyById(String authHeader, String id) {
        extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/journeys?id=eq." + id + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<JourneyResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<JourneyResponse>>() {});
            if (list == null || list.isEmpty()) {
                throw new ResourceNotFoundException("Journey with ID '" + id + "' was not found.");
            }
            return list.get(0);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch journey details.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch journey details.");
        }
    }

    /**
     * Update a journey if the authenticated user is the owner.
     */
    public JourneyResponse updateJourney(String authHeader, String id, JourneyRequest request) {
        UserDto user = extractAuthenticatedUser(authHeader);

        // Verify journey existence and ownership
        JourneyResponse existing = getJourneyById(authHeader, id);
        if (!existing.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to update this journey.");
        }

        String url = supabaseUrl + "/rest/v1/journeys?id=eq." + id;

        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("title", request.getTitle());
        body.put("destination", request.getDestination());
        body.put("description", request.getDescription());
        body.put("start_date", request.getStartDate() != null ? request.getStartDate().toString() : null);
        body.put("end_date", request.getEndDate() != null ? request.getEndDate().toString() : null);
        body.put("cover_image_url", request.getCoverImageUrl());
        body.put("travel_type", request.getTravelType());
        body.put("budget", request.getBudget());
        body.put("travelers", request.getTravelers() != null ? request.getTravelers() : 1);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            List<JourneyResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<JourneyResponse>>() {});
            if (list != null && !list.isEmpty()) {
                return list.get(0);
            }
            throw new RuntimeException("Failed to retrieve updated journey.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to update journey.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to update journey.");
        }
    }

    /**
     * Delete a journey if the authenticated user is the owner.
     */
    public void deleteJourney(String authHeader, String id) {
        UserDto user = extractAuthenticatedUser(authHeader);

        // Verify journey existence and ownership
        JourneyResponse existing = getJourneyById(authHeader, id);
        if (!existing.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to delete this journey.");
        }

        String url = supabaseUrl + "/rest/v1/journeys?id=eq." + id;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to delete journey.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to delete journey.");
        }
    }

    private UserDto extractAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header. Bearer token required.");
        }
        String token = authHeader.substring(7).trim();
        try {
            return authService.getCurrentUser(token);
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired authentication token.");
        }
    }

    private HttpHeaders createAuthenticatedHeaders(String authHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            headers.set("Authorization", authHeader);
        }
        return headers;
    }

    private void handleRestError(HttpClientErrorException e) {
        if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            throw new UnauthorizedException("Unauthorized access to Supabase service.");
        } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
            throw new ForbiddenException("Access forbidden by security policies.");
        } else if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
            throw new ResourceNotFoundException("Resource not found.");
        }
    }
}
