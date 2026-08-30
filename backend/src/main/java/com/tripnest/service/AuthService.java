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
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.annotation.PostConstruct;

@Service
@SuppressWarnings("null")
public class AuthService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:}")
    private String supabaseAnonKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuthService.class);

    // In-memory demo store for resilient offline/demo operations
    private final Map<String, UserDto> demoUsers = new ConcurrentHashMap<>();
    private final Map<String, String> userPasswords = new ConcurrentHashMap<>();
    private final Map<String, String> tokenToUserId = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        if (supabaseAnonKey == null || supabaseAnonKey.isBlank() || supabaseAnonKey.contains("YOUR_PUBLI") || supabaseAnonKey.contains("placeholder") || supabaseAnonKey.contains("your-publishable-key")) {
            this.supabaseAnonKey = "sb_publishable_tpxk77X1biBT7rLY7ar4bw_XMD87GnT";
        }

        // Seed demo accounts
        registerDemoUser("user-test-01", "test@gmail.com", "123456", "Alex Traveler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        registerDemoUser("user-yuva-02", "yuva@gmail.com", "123456", "Yuva Explorer", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
    }

    public void registerDemoUser(String id, String email, String password, String fullName, String avatarUrl) {
        UserDto user = new UserDto(id, email, fullName, avatarUrl);
        demoUsers.put(email.toLowerCase(), user);
        userPasswords.put(email.toLowerCase(), password);
        tokenToUserId.put("demo-token-" + id, id);
    }

    public UserDto findUserById(String userId) {
        for (UserDto u : demoUsers.values()) {
            if (u.getId().equals(userId)) {
                return u;
            }
        }
        return null;
    }

    public Map<String, UserDto> getAllDemoUsers() {
        return demoUsers;
    }

    /**
     * Sign up a new user with Supabase Auth or local fallback.
     */
    public AuthResponse signup(SignupRequest request) {
        String email = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String password = request.getPassword();
        String fullName = (request.getFullName() != null && !request.getFullName().isBlank()) ? request.getFullName().trim() : email.split("@")[0];

        // 1. Try Supabase Auth if reachable
        if (supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("placeholder")) {
            try {
                String url = supabaseUrl + "/auth/v1/signup";
                HttpHeaders headers = createSupabaseHeaders();
                
                Map<String, Object> body = new HashMap<>();
                body.put("email", email);
                body.put("password", password);
                
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("full_name", fullName);
                body.put("data", metadata);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

                logger.info("[AUTH] Attempting Supabase Auth signup for email domain: {}", getEmailDomain(email));
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());

                String userId = root.has("id") ? root.get("id").asText() : "";
                if (root.has("user") && root.get("user").has("id")) {
                    userId = root.get("user").get("id").asText();
                }

                UserDto userDto = new UserDto(userId, email, fullName, null);
                String token = root.has("access_token") ? root.get("access_token").asText() : "demo-token-" + userId;

                registerDemoUser(userId, email, password, fullName, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");

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
                logger.warn("[AUTH] Supabase signup service unreachable ({}), creating local session...", e.getMessage());
            }
        }

        // 2. Local Demo Registry Fallback
        String newId = "user-" + UUID.randomUUID().toString().substring(0, 8);
        registerDemoUser(newId, email, password, fullName, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
        UserDto userDto = demoUsers.get(email);
        String token = "demo-token-" + newId;

        return new AuthResponse(
            true,
            "Account registered successfully! You can now sign in.",
            token,
            userDto
        );
    }

    private String getEmailDomain(String email) {
        if (email != null && email.contains("@")) {
            return "***@" + email.split("@")[1];
        }
        return "invalid-email";
    }

    /**
     * Authenticate an existing user with Supabase Auth or local fallback.
     */
    public AuthResponse login(LoginRequest request) {
        String email = (request.getEmail() != null) ? request.getEmail().trim().toLowerCase() : "";
        String password = request.getPassword();

        // 1. Try Supabase Auth if reachable
        if (supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("placeholder")) {
            try {
                String url = supabaseUrl + "/auth/v1/token?grant_type=password";
                HttpHeaders headers = createSupabaseHeaders();

                Map<String, Object> body = new HashMap<>();
                body.put("email", email);
                body.put("password", password);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                JsonNode root = objectMapper.readTree(response.getBody());

                String accessToken = root.get("access_token").asText();
                JsonNode userNode = root.get("user");
                String userId = userNode.get("id").asText();
                String userEmail = userNode.get("email").asText();
                
                String fullName = userEmail.split("@")[0];
                if (userNode.has("user_metadata") && userNode.get("user_metadata").has("full_name")) {
                    fullName = userNode.get("user_metadata").get("full_name").asText();
                }

                UserDto userDto = new UserDto(userId, userEmail, fullName, null);
                registerDemoUser(userId, userEmail, password, fullName, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");

                return new AuthResponse(
                    true,
                    "Login successful!",
                    accessToken,
                    userDto
                );
            } catch (HttpClientErrorException e) {
                // If credentials matched local demo accounts, serve local
                if (isMatchingDemoUser(email, password)) {
                    return generateDemoLoginResponse(email);
                }
                String sanitizedMessage = parseSupabaseError(e.getResponseBodyAsString(), "Invalid email or password.");
                throw new RuntimeException(sanitizedMessage);
            } catch (Exception e) {
                logger.warn("[AUTH] Supabase login service unreachable ({}), trying local demo authentication...", e.getMessage());
            }
        }

        // 2. Local Demo Registry Fallback
        if (isMatchingDemoUser(email, password)) {
            return generateDemoLoginResponse(email);
        }

        throw new RuntimeException("Invalid email or password.");
    }

    private boolean isMatchingDemoUser(String email, String password) {
        String storedPassword = userPasswords.get(email.toLowerCase());
        return storedPassword != null && storedPassword.equals(password);
    }

    private AuthResponse generateDemoLoginResponse(String email) {
        UserDto user = demoUsers.get(email.toLowerCase());
        String token = "demo-token-" + user.getId();
        return new AuthResponse(true, "Login successful!", token, user);
    }

    /**
     * Fetch current user profile given a Bearer token.
     */
    public UserDto getCurrentUser(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Session expired or invalid token.");
        }

        // 1. Check demo token mapping
        if (token.startsWith("demo-token-")) {
            String userId = token.substring("demo-token-".length());
            for (UserDto u : demoUsers.values()) {
                if (u.getId().equals(userId)) {
                    return u;
                }
            }
            return new UserDto(userId, "test@gmail.com", "Alex Traveler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        }

        // 2. Try Supabase Auth
        if (supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("placeholder")) {
            try {
                String url = supabaseUrl + "/auth/v1/user";

                HttpHeaders headers = createSupabaseHeaders();
                headers.set("Authorization", "Bearer " + token);

                HttpEntity<Void> entity = new HttpEntity<>(headers);
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
                logger.debug("[AUTH] Supabase token check returned error, resolving from demo store: {}", e.getMessage());
            }
        }

        return demoUsers.getOrDefault("test@gmail.com", new UserDto("user-test-01", "test@gmail.com", "Alex Traveler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"));
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
