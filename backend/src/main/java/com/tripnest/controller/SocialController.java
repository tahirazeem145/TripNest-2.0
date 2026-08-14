package com.tripnest.controller;

import com.tripnest.dto.*;
import com.tripnest.service.SocialService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SocialController {

    private final SocialService socialService;

    public SocialController(SocialService socialService) {
        this.socialService = socialService;
    }

    // Feeds
    @GetMapping("/feed/home")
    public ResponseEntity<List<PostResponse>> getHomeFeed(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(socialService.getHomeFeed(authHeader));
    }

    @GetMapping("/feed/following")
    public ResponseEntity<List<PostResponse>> getFollowingFeed(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(socialService.getFollowingFeed(authHeader));
    }

    @GetMapping("/posts/saved")
    public ResponseEntity<List<PostResponse>> getSavedPosts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(socialService.getSavedPosts(authHeader));
    }

    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostResponse>> getUserPosts(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String userId) {
        return ResponseEntity.ok(socialService.getUserPosts(authHeader, userId));
    }

    // Posts CRUD
    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody PostRequest request) {
        PostResponse post = socialService.createPost(authHeader, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.deletePost(authHeader, id);
        return ResponseEntity.noContent().build();
    }

    // Likes
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Void> likePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.likePost(authHeader, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<Void> unlikePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.unlikePost(authHeader, id);
        return ResponseEntity.ok().build();
    }

    // Saves
    @PostMapping("/posts/{id}/save")
    public ResponseEntity<Void> savePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.savePost(authHeader, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/posts/{id}/save")
    public ResponseEntity<Void> unsavePost(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.unsavePost(authHeader, id);
        return ResponseEntity.ok().build();
    }

    // Comments
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommentDto> addComment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id,
            @RequestBody CommentRequest body) {
        String content = (body != null && body.getContent() != null) ? body.getContent().trim() : "";
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }
        CommentDto comment = socialService.addComment(authHeader, id, content);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        return ResponseEntity.ok(socialService.getPostComments(authHeader, id));
    }

    // Follows
    @PostMapping("/users/{id}/follow")
    public ResponseEntity<Void> followUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.followUser(authHeader, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}/follow")
    public ResponseEntity<Void> unfollowUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String id) {
        socialService.unfollowUser(authHeader, id);
        return ResponseEntity.ok().build();
    }

    // Travelers
    @GetMapping("/travelers")
    public ResponseEntity<List<TravelerDto>> getTravelers(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "search", required = false) String searchQuery) {
        String effectiveQuery = (searchQuery != null && !searchQuery.isBlank()) ? searchQuery : query;
        return ResponseEntity.ok(socialService.getTravelers(authHeader, effectiveQuery));
    }

    // Profile
    @GetMapping("/profile/{userId}")
    public ResponseEntity<TravelerDto> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String userId) {
        return ResponseEntity.ok(socialService.getTravelerProfile(authHeader, userId));
    }

    @PutMapping("/profile/me")
    public ResponseEntity<TravelerDto> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ProfileUpdateRequest updates) {
        return ResponseEntity.ok(socialService.updateProfile(authHeader, updates));
    }

    // Notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(socialService.getNotifications(authHeader));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Void> markNotificationsRead(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        socialService.markNotificationsRead(authHeader);
        return ResponseEntity.ok().build();
    }
}
