package com.tripnest.service;

import com.tripnest.dto.UserDto;
import com.tripnest.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class MediaService {

    private static final Logger logger = LoggerFactory.getLogger(MediaService.class);
    private static final long MAX_POST_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;     // 5 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final AuthService authService;
    private final RestTemplate restTemplate;

    public MediaService(AuthService authService, RestTemplate restTemplate) {
        this.authService = authService;
        this.restTemplate = restTemplate;
    }

    /**
     * Upload post or avatar media to Supabase Storage (tripnest-media bucket with posts/ or avatars/ path)
     */
    public Map<String, Object> uploadMedia(String authHeader, MultipartFile file, String folderType) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No image file provided.");
        }

        boolean isAvatar = "avatar".equalsIgnoreCase(folderType) || "avatars".equalsIgnoreCase(folderType);
        long maxLimit = isAvatar ? MAX_AVATAR_SIZE : MAX_POST_IMAGE_SIZE;

        if (file.getSize() > maxLimit) {
            String limitDesc = isAvatar ? "5 MB" : "10 MB";
            throw new IllegalArgumentException("Image size must be less than " + limitDesc + ".");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Image must be JPG, PNG, or WEBP format.");
        }

        String extension = "jpg";
        if (contentType.equalsIgnoreCase("image/png")) {
            extension = "png";
        } else if (contentType.equalsIgnoreCase("image/webp")) {
            extension = "webp";
        }

        String folder = isAvatar ? "avatars" : "posts";
        String uniqueFileName = UUID.randomUUID().toString() + "." + extension;
        String relativePath = folder + "/" + currentUser.getId() + "/" + uniqueFileName;
        String bucket = "tripnest-media";

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + relativePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", authHeader);
        headers.setContentType(MediaType.parseMediaType(contentType));

        try {
            byte[] fileBytes = file.getBytes();
            HttpEntity<byte[]> entity = new HttpEntity<>(fileBytes, headers);

            restTemplate.postForEntity(uploadUrl, entity, String.class);

            String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + relativePath;

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("url", publicUrl);
            result.put("imageUrl", publicUrl);
            result.put("path", relativePath);
            result.put("fileName", uniqueFileName);
            result.put("bucket", bucket);
            return result;
        } catch (HttpClientErrorException e) {
            logger.error("[STORAGE] Upload failed with status {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED || e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new UnauthorizedException("Storage authorization failed.");
            }
            throw new RuntimeException("Unable to upload image. Please try again.");
        } catch (Exception e) {
            logger.error("[STORAGE] Unexpected upload error: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to upload image. Please try again.");
        }
    }

    /**
     * Delete user media from Supabase Storage
     */
    public void deleteMedia(String authHeader, String path) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        // Security check: ensure path belongs to currentUser (contains /{userId}/)
        if (path == null || !path.contains("/" + currentUser.getId() + "/")) {
            logger.warn("[STORAGE] Unauthorized media deletion attempted by user {} for path {}", currentUser.getId(), path);
            return;
        }

        String bucket = "tripnest-media";
        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", supabaseAnonKey);
        headers.set("Authorization", authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, Void.class);
            logger.info("[STORAGE] Deleted media object {}", path);
        } catch (Exception e) {
            logger.warn("[STORAGE] Non-fatal media deletion error for path {}: {}", path, e.getMessage());
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
}
