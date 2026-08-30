package com.tripnest.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.SignupRequest;
import com.tripnest.dto.UserDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import jakarta.annotation.PostConstruct;

@Service
@SuppressWarnings("null")
public class AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    @PostConstruct
    public void init() {
        if (supabaseAnonKey == null || supabaseAnonKey.isBlank() || supabaseAnonKey.contains("YOUR_PUBLI") || supabaseAnonKey.contains("placeholder") || supabaseAnonKey.contains("your-publishable-key")) {
            this.supabaseAnonKey = "sb_publishable_tpxk77X1biBT7rLY7ar4bw_XMD87GnT";
        }
    }

    /**
     * Sign up a new user with Supabase Auth.
     */
    public AuthResponse signup(SignupRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";

        HttpHeaders headers = createSupabaseHeaders();
        
        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("full_name", request.getFullName());
        body.put("data", metadata);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            logger.info("[AUTH] Supabase URL: '{}', key prefix: '{}'", supabaseUrl, supabaseAnonKey != null && supabaseAnonKey.length() > 10 ? supabaseAnonKey.substring(0, 10) : supabaseAnonKey);
            logger.info("[AUTH] Attempting Supabase Auth signup for email domain: {}", getEmailDomain(request.getEmail()));
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String userId = root.has("id") ? root.get("id").asText() : "";
            if (root.has("user") && root.get("user").has("id")) {
                userId = root.get("user").get("id").asText();
            }

            UserDto userDto = new UserDto(userId, request.getEmail(), request.getFullName(), null);
            String token = root.has("access_token") ? root.get("access_token").asText() : null;

            logger.info("[AUTH] Supabase Auth signup successful for user ID: {}", userId);

            return new AuthResponse(
                true,
                "Account registered successfully! You can now sign in.",
                token,
                userDto
            );
        } catch (HttpClientErrorException e) {
            String errorResponseBody = e.getResponseBodyAsString();
            logger.warn("[AUTH] Supabase Auth signup returned HTTP {}: {}", e.getStatusCode(), errorResponseBody);
            String sanitizedMessage = parseSupabaseError(errorResponseBody, "Registration failed. Please check your details.");
            throw new RuntimeException(sanitizedMessage);
        } catch (Exception e) {
            logger.error("[AUTH] Unexpected error during signup", e);
            throw new RuntimeException("Unable to complete signup request. Please check Supabase service status.");
        }
    }

    private String getEmailDomain(String email) {
        if (email != null && email.contains("@")) {
            return "***@" + email.split("@")[1];
        }
        return "invalid-email";
    }

    /**
     * Authenticate an existing user with Supabase Auth.
     */
    public AuthResponse login(LoginRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";

        HttpHeaders headers = createSupabaseHeaders();

        Map<String, Object> body = new HashMap<>();
        body.put("email", request.getEmail());
        body.put("password", request.getPassword());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String accessToken = root.get("access_token").asText();
            JsonNode userNode = root.get("user");
            String userId = userNode.get("id").asText();
            String email = userNode.get("email").asText();
            
            String fullName = email.split("@")[0];
            if (userNode.has("user_metadata") && userNode.get("user_metadata").has("full_name")) {
                fullName = userNode.get("user_metadata").get("full_name").asText();
            }

            UserDto userDto = new UserDto(userId, email, fullName, null);

            return new AuthResponse(
                true,
                "Login successful!",
                accessToken,
                userDto
            );
        } catch (HttpClientErrorException e) {
            String sanitizedMessage = parseSupabaseError(e.getResponseBodyAsString(), "Invalid email or password.");
            throw new RuntimeException(sanitizedMessage);
        } catch (Exception e) {
            throw new RuntimeException("Unable to complete login request. Please verify server connection.");
        }
    }

    /**
     * Fetch current user profile given a Bearer token.
     */
    public UserDto getCurrentUser(String token) {
        String url = supabaseUrl + "/auth/v1/user";

        HttpHeaders headers = createSupabaseHeaders();
        headers.set("Authorization", "Bearer " + token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode userNode = objectMapper.readTree(response.getBody());

            String userId = userNode.get("id").asText();
            String email = userNode.get("email").asText();
            
            String fullName = email.split("@")[0];
            if (userNode.has("user_metadata") && userNode.get("user_metadata").has("full_name")) {
                fullName = userNode.get("user_metadata").get("full_name").asText();
            }

            return new UserDto(userId, email, fullName, null);
        } catch (Exception e) {
            throw new RuntimeException("Session expired or invalid token.");
        }
    }

    private HttpHeaders createSupabaseHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseAnonKey);
        return headers;
    }

    private String parseSupabaseError(String responseBody, String defaultMessage) {
        try {
            if (responseBody != null && !responseBody.isBlank()) {
                JsonNode root = objectMapper.readTree(responseBody);
                if (root.has("error_description")) {
                    return root.get("error_description").asText();
                } else if (root.has("msg")) {
                    return root.get("msg").asText();
                } else if (root.has("message")) {
                    return root.get("message").asText();
                }
            }
        } catch (Exception ignored) {}
        return defaultMessage;
    }
}
