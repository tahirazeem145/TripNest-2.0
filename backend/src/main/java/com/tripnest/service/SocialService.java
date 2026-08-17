package com.tripnest.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.dto.*;
import com.tripnest.exception.ForbiddenException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;

@Service
@SuppressWarnings("null")
public class SocialService {

    private static final Logger logger = LoggerFactory.getLogger(SocialService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final AuthService authService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        if (supabaseAnonKey == null || supabaseAnonKey.isBlank() || supabaseAnonKey.contains("YOUR_PUBLI") || supabaseAnonKey.contains("placeholder") || supabaseAnonKey.contains("your-publishable-key")) {
            this.supabaseAnonKey = "sb_publishable_tpxk77X1biBT7rLY7ar4bw_XMD87GnT";
        }
    }

    public SocialService(AuthService authService, RestTemplate restTemplate) {
        this.authService = authService;
        this.restTemplate = restTemplate;
    }

    /**
     * Create a new post (supports multi-image post_media)
     */
    public PostResponse createPost(String authHeader, PostRequest request) {
        UserDto user = extractAuthenticatedUser(authHeader);

        List<String> imageUrls = new ArrayList<>();
        if (request.getMedia() != null && !request.getMedia().isEmpty()) {
            for (PostMediaDto m : request.getMedia()) {
                if (m.getMediaUrl() != null && !m.getMediaUrl().isBlank()) {
                    imageUrls.add(m.getMediaUrl().trim());
                }
            }
        }

        if (imageUrls.isEmpty() && request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            imageUrls.add(request.getImageUrl().trim());
        }

        if (imageUrls.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required.");
        }

        String primaryImageUrl = imageUrls.get(0);
        String storedImageUrlValue = primaryImageUrl;
        if (imageUrls.size() > 1) {
            try {
                storedImageUrlValue = objectMapper.writeValueAsString(imageUrls);
            } catch (Exception e) {
                storedImageUrlValue = primaryImageUrl;
            }
        }

        String url = supabaseUrl + "/rest/v1/posts";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", user.getId());
        body.put("image_url", storedImageUrlValue);
        body.put("caption", request.getCaption());
        body.put("destination", request.getDestination());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            if (list != null && !list.isEmpty()) {
                PostResponse created = list.get(0);
                created.setAuthor(user);

                // Insert into post_media table if multiple or individual media provided
                List<PostMediaDto> mediaList = new ArrayList<>();
                if (request.getMedia() != null && !request.getMedia().isEmpty()) {
                    String mediaUrlEndpoint = supabaseUrl + "/rest/v1/post_media";
                    List<Map<String, Object>> mediaBatch = new ArrayList<>();
                    int order = 0;
                    for (PostMediaDto m : request.getMedia()) {
                        if (m.getMediaUrl() != null && !m.getMediaUrl().isBlank()) {
                            Map<String, Object> mRow = new HashMap<>();
                            mRow.put("post_id", created.getId());
                            mRow.put("media_url", m.getMediaUrl().trim());
                            mRow.put("media_type", (m.getMediaType() != null) ? m.getMediaType() : "image");
                            mRow.put("display_order", order++);
                            mediaBatch.add(mRow);
                        }
                    }

                    if (!mediaBatch.isEmpty()) {
                        try {
                            HttpEntity<List<Map<String, Object>>> mediaEntity = new HttpEntity<>(mediaBatch, headers);
                            ResponseEntity<String> mediaResp = restTemplate.postForEntity(mediaUrlEndpoint, mediaEntity, String.class);
                            List<PostMediaDto> insertedMedia = objectMapper.readValue(mediaResp.getBody(), new TypeReference<List<PostMediaDto>>() {});
                            if (insertedMedia != null) {
                                mediaList.addAll(insertedMedia);
                            }
                        } catch (Exception e) {
                            logger.warn("[POSTS] Error saving post_media rows (fallback to image_url JSON array): {}", e.getMessage());
                        }
                    }
                }

                // Fallback: if no separate post_media created, parse imageUrls list
                if (mediaList.isEmpty()) {
                    int order = 0;
                    for (String imgUrl : imageUrls) {
                        mediaList.add(new PostMediaDto(imgUrl, order++));
                    }
                }
                created.setMedia(mediaList);
                return created;
            }
            throw new RuntimeException("Failed to create post.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to create post.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to create post. Please check database connection.");
        }
    }

    /**
     * Get Discovery Home Feed with pagination
     */
    public List<PostResponse> getHomeFeed(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        int safeLimit = (limit > 0 && limit <= 50) ? limit : 10;
        int safeOffset = Math.max(0, offset);

        String url = supabaseUrl + "/rest/v1/posts?select=*&order=created_at.desc&limit=" + safeLimit + "&offset=" + safeOffset;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> posts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            return enrichPosts(authHeader, currentUser.getId(), posts);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch home feed.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch home feed.");
        }
    }

    /**
     * Get Following Feed with pagination
     */
    public List<PostResponse> getFollowingFeed(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        int safeLimit = (limit > 0 && limit <= 50) ? limit : 10;
        int safeOffset = Math.max(0, offset);

        // 1. Get following IDs
        List<String> followingIds = getFollowingUserIds(authHeader, currentUser.getId());
        if (followingIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Fetch posts from those following IDs
        String idList = followingIds.stream().collect(Collectors.joining(","));
        String url = supabaseUrl + "/rest/v1/posts?user_id=in.(" + idList + ")&select=*&order=created_at.desc&limit=" + safeLimit + "&offset=" + safeOffset;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> posts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            return enrichPosts(authHeader, currentUser.getId(), posts);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch following feed.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch following feed.");
        }
    }

    /**
     * Get Saved Posts for current user
     */
    public List<PostResponse> getSavedPosts(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/saved_posts?user_id=eq." + currentUser.getId() + "&select=post_id,created_at&order=created_at.desc";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> savedRecords = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            if (savedRecords.isEmpty()) {
                return Collections.emptyList();
            }

            List<String> postIds = savedRecords.stream().map(r -> (String) r.get("post_id")).collect(Collectors.toList());
            String idList = postIds.stream().collect(Collectors.joining(","));

            String postsUrl = supabaseUrl + "/rest/v1/posts?id=in.(" + idList + ")&select=*";
            ResponseEntity<String> postsResponse = restTemplate.exchange(postsUrl, HttpMethod.GET, entity, String.class);
            List<PostResponse> posts = objectMapper.readValue(postsResponse.getBody(), new TypeReference<List<PostResponse>>() {});

            return enrichPosts(authHeader, currentUser.getId(), posts);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch saved posts.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch saved posts.");
        }
    }

    /**
     * Get User Profile Posts
     */
    public List<PostResponse> getUserPosts(String authHeader, String userId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/posts?user_id=eq." + userId + "&select=*&order=created_at.desc";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> posts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            return enrichPosts(authHeader, currentUser.getId(), posts);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch user posts.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch user posts.");
        }
    }

    /**
     * Delete Post
     */
    public void deletePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        // Check ownership
        String url = supabaseUrl + "/rest/v1/posts?id=eq." + postId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            if (list == null || list.isEmpty()) {
                throw new ResourceNotFoundException("Post not found.");
            }
            if (!list.get(0).getUserId().equals(currentUser.getId())) {
                throw new ForbiddenException("You cannot delete another user's post.");
            }

            // Perform post deletion
            restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to delete post.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to delete post.");
        }
    }

    /**
     * Like a Post
     */
    public void likePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/likes";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", currentUser.getId());
        body.put("post_id", postId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);

            // Fetch post to notify owner
            PostResponse post = getPostById(authHeader, postId);
            if (!post.getUserId().equals(currentUser.getId())) {
                createNotification(authHeader, post.getUserId(), currentUser.getId(), "like", postId);
            }
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                return; // Already liked
            }
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Unlike a Post
     */
    public void unlikePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/likes?user_id=eq." + currentUser.getId() + "&post_id=eq." + postId;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Save a Post
     */
    public void savePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/saved_posts";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", currentUser.getId());
        body.put("post_id", postId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);

            // Notify post owner of saved post
            try {
                PostResponse post = getPostById(authHeader, postId);
                if (!post.getUserId().equals(currentUser.getId())) {
                    createNotification(authHeader, post.getUserId(), currentUser.getId(), "save", postId);
                }
            } catch (Exception ignored) {}
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                return; // Already saved
            }
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Unsave a Post
     */
    public void unsavePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/saved_posts?user_id=eq." + currentUser.getId() + "&post_id=eq." + postId;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Add Comment to Post (supports optional parentId for replies)
     */
    public CommentDto addComment(String authHeader, String postId, String content) {
        return addComment(authHeader, postId, content, null);
    }

    public CommentDto addComment(String authHeader, String postId, String content, String parentId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/comments";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", currentUser.getId());
        body.put("post_id", postId);
        body.put("content", content);
        if (parentId != null && !parentId.isBlank()) {
            body.put("parent_id", parentId.trim());
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            List<CommentDto> list = objectMapper.readValue(response.getBody(), new TypeReference<List<CommentDto>>() {});
            if (list != null && !list.isEmpty()) {
                CommentDto comment = list.get(0);
                comment.setAuthor(currentUser);

                // Notify post owner
                try {
                    PostResponse post = getPostById(authHeader, postId);
                    if (!post.getUserId().equals(currentUser.getId())) {
                        createNotification(authHeader, post.getUserId(), currentUser.getId(), "comment", postId);
                    }
                } catch (Exception ignored) {}

                return comment;
            }
            throw new RuntimeException("Failed to add comment.");
        } catch (HttpClientErrorException e) {
            logger.error("[COMMENTS] Error adding comment: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            handleRestError(e);
            throw new RuntimeException("Failed to add comment: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            logger.error("[COMMENTS] Unexpected error: {}", e.getMessage(), e);
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to add comment.");
        }
    }

    /**
     * Delete Comment (Comment author or Post author)
     */
    public void deleteComment(String authHeader, String commentId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String fetchUrl = supabaseUrl + "/rest/v1/comments?id=eq." + commentId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(fetchUrl, HttpMethod.GET, entity, String.class);
            List<CommentDto> list = objectMapper.readValue(response.getBody(), new TypeReference<List<CommentDto>>() {});
            if (list == null || list.isEmpty()) {
                throw new ResourceNotFoundException("Comment not found.");
            }
            CommentDto comment = list.get(0);
            
            boolean isCommentOwner = currentUser.getId().equals(comment.getUserId());
            boolean isPostOwner = false;
            try {
                PostResponse post = getPostById(authHeader, comment.getPostId());
                isPostOwner = currentUser.getId().equals(post.getUserId());
            } catch (Exception ignored) {}

            if (!isCommentOwner && !isPostOwner) {
                throw new ForbiddenException("You do not have permission to delete this comment.");
            }

            String deleteUrl = supabaseUrl + "/rest/v1/comments?id=eq." + commentId;
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to delete comment.");
        }
    }

    /**
     * Update Comment (Comment author only)
     */
    public CommentDto updateComment(String authHeader, String commentId, String content) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty.");
        }

        String fetchUrl = supabaseUrl + "/rest/v1/comments?id=eq." + commentId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(fetchUrl, HttpMethod.GET, entity, String.class);
            List<CommentDto> list = objectMapper.readValue(response.getBody(), new TypeReference<List<CommentDto>>() {});
            if (list == null || list.isEmpty()) {
                throw new ResourceNotFoundException("Comment not found.");
            }
            CommentDto existing = list.get(0);
            if (!currentUser.getId().equals(existing.getUserId())) {
                throw new ForbiddenException("You can only edit your own comments.");
            }

            String patchUrl = supabaseUrl + "/rest/v1/comments?id=eq." + commentId;
            headers.set("Prefer", "return=representation");

            Map<String, Object> body = new HashMap<>();
            body.put("content", content.trim());
            HttpEntity<Map<String, Object>> patchEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> patchResp = restTemplate.exchange(patchUrl, HttpMethod.PATCH, patchEntity, String.class);
            List<CommentDto> updatedList = objectMapper.readValue(patchResp.getBody(), new TypeReference<List<CommentDto>>() {});
            if (updatedList != null && !updatedList.isEmpty()) {
                CommentDto updated = updatedList.get(0);
                updated.setAuthor(currentUser);
                return updated;
            }
            throw new RuntimeException("Failed to update comment.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to update comment.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to update comment.");
        }
    }

    /**
     * Get Comments for Post
     */
    public List<CommentDto> getPostComments(String authHeader, String postId) {
        extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/comments?post_id=eq." + postId + "&select=*&order=created_at.asc";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<CommentDto> comments = objectMapper.readValue(response.getBody(), new TypeReference<List<CommentDto>>() {});

            if (!comments.isEmpty()) {
                Set<String> userIds = comments.stream().map(CommentDto::getUserId).collect(Collectors.toSet());
                Map<String, UserDto> userMap = fetchUserMap(authHeader, userIds);
                comments.forEach(c -> c.setAuthor(userMap.get(c.getUserId())));
            }

            return comments;
        } catch (HttpClientErrorException e) {
            logger.error("[COMMENTS] Error fetching comments: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            handleRestError(e);
            throw new RuntimeException("Failed to fetch comments.");
        } catch (Exception e) {
            logger.error("[COMMENTS] Unexpected error fetching comments: {}", e.getMessage(), e);
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch comments.");
        }
    }

    /**
     * Follow a User
     */
    public void followUser(String authHeader, String followingId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        if (currentUser.getId().equals(followingId)) {
            throw new RuntimeException("You cannot follow yourself.");
        }

        String url = supabaseUrl + "/rest/v1/follows";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);

        Map<String, Object> body = new HashMap<>();
        body.put("follower_id", currentUser.getId());
        body.put("following_id", followingId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
            createNotification(authHeader, followingId, currentUser.getId(), "follow", null);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                return;
            }
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Unfollow a User
     */
    public void unfollowUser(String authHeader, String followingId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/follows?follower_id=eq." + currentUser.getId() + "&following_id=eq." + followingId;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
        } catch (Exception ignored) {}
    }

    /**
     * Get Travelers / Suggestions
     */
    public List<TravelerDto> getTravelers(String authHeader, String query) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/profiles?select=*&order=created_at.desc&limit=50";
        if (query != null && !query.isBlank()) {
            url = supabaseUrl + "/rest/v1/profiles?full_name=ilike.*" + query.trim() + "*&select=*&order=created_at.desc&limit=50";
        }

        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> profiles = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});

            List<String> followingIds = getFollowingUserIds(authHeader, currentUser.getId());
            Set<String> followingSet = new HashSet<>(followingIds);

            List<TravelerDto> result = new ArrayList<>();
            for (Map<String, Object> p : profiles) {
                String pId = (String) p.get("id");
                TravelerDto traveler = new TravelerDto();
                traveler.setId(pId);
                traveler.setEmail((String) p.get("email"));
                traveler.setFullName((String) p.get("full_name"));
                traveler.setAvatarUrl((String) p.get("avatar_url"));
                traveler.setBio((String) p.get("bio"));
                traveler.setFollowing(followingSet.contains(pId));
                result.add(traveler);
            }
            return result;
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch travelers.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch travelers.");
        }
    }

    /**
     * Get Notifications
     */
    public List<NotificationDto> getNotifications(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/notifications?recipient_id=eq." + currentUser.getId() + "&select=*&order=created_at.desc&limit=50";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<NotificationDto> list = objectMapper.readValue(response.getBody(), new TypeReference<List<NotificationDto>>() {});

            if (!list.isEmpty()) {
                Set<String> actorIds = list.stream().map(NotificationDto::getActorId).collect(Collectors.toSet());
                Map<String, UserDto> userMap = fetchUserMap(authHeader, actorIds);
                list.forEach(n -> n.setActor(userMap.get(n.getActorId())));
            }

            return list;
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch notifications.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch notifications.");
        }
    }

    /**
     * Mark all notifications read
     */
    public void markNotificationsRead(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/notifications?recipient_id=eq." + currentUser.getId();
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);

        Map<String, Object> body = new HashMap<>();
        body.put("is_read", true);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
        } catch (Exception e) {
            logger.warn("[NOTIFICATIONS] Failed to mark notifications read: {}", e.getMessage());
        }
    }

    /**
     * Get Traveler Profile Details
     */
    public TravelerDto getTravelerProfile(String authHeader, String userId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        String targetId = (userId == null || userId.equals("me")) ? currentUser.getId() : userId;

        String url = supabaseUrl + "/rest/v1/profiles?id=eq." + targetId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> list = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            
            TravelerDto dto = new TravelerDto();
            dto.setId(targetId);

            if (list.isEmpty()) {
                if (targetId.equals(currentUser.getId())) {
                    dto.setEmail(currentUser.getEmail());
                    dto.setFullName(currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getEmail().split("@")[0]);
                    dto.setBio("");
                    dto.setAvatarUrl("");
                } else {
                    throw new ResourceNotFoundException("Profile not found.");
                }
            } else {
                Map<String, Object> p = list.get(0);
                dto.setEmail((String) p.get("email"));
                dto.setFullName((String) p.get("full_name"));
                dto.setAvatarUrl((String) p.get("avatar_url"));
                dto.setBio((String) p.get("bio"));
            }

            // Followers count
            String followersUrl = supabaseUrl + "/rest/v1/follows?following_id=eq." + targetId + "&select=follower_id";
            ResponseEntity<String> folResp = restTemplate.exchange(followersUrl, HttpMethod.GET, entity, String.class);
            List<?> folList = objectMapper.readValue(folResp.getBody(), List.class);
            dto.setFollowersCount(folList != null ? folList.size() : 0);

            // Following count
            String followingUrl = supabaseUrl + "/rest/v1/follows?follower_id=eq." + targetId + "&select=following_id";
            ResponseEntity<String> fingResp = restTemplate.exchange(followingUrl, HttpMethod.GET, entity, String.class);
            List<?> fingList = objectMapper.readValue(fingResp.getBody(), List.class);
            dto.setFollowingCount(fingList != null ? fingList.size() : 0);

            // Posts count
            String postsUrl = supabaseUrl + "/rest/v1/posts?user_id=eq." + targetId + "&select=id";
            ResponseEntity<String> postResp = restTemplate.exchange(postsUrl, HttpMethod.GET, entity, String.class);
            List<?> pList = objectMapper.readValue(postResp.getBody(), List.class);
            dto.setPostsCount(pList != null ? pList.size() : 0);

            // Is following
            if (!targetId.equals(currentUser.getId())) {
                List<String> myFollowing = getFollowingUserIds(authHeader, currentUser.getId());
                dto.setFollowing(myFollowing.contains(targetId));
            }

            return dto;
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch traveler profile.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to fetch traveler profile.");
        }
    }

    /**
     * Update Current User Profile
     */
    public TravelerDto updateProfile(String authHeader, ProfileUpdateRequest request) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/profiles";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "resolution=merge-duplicates,return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("id", currentUser.getId());
        body.put("email", currentUser.getEmail());
        if (request != null) {
            if (request.getFullName() != null) body.put("full_name", request.getFullName());
            if (request.getBio() != null) body.put("bio", request.getBio());
            if (request.getAvatarUrl() != null) body.put("avatar_url", request.getAvatarUrl());
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, entity, String.class);
            return getTravelerProfile(authHeader, currentUser.getId());
        } catch (HttpClientErrorException e) {
            logger.error("[PROFILE] Error updating profile: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            handleRestError(e);
            throw new RuntimeException("Failed to update profile.");
        } catch (Exception e) {
            logger.error("[PROFILE] Unexpected error updating profile: {}", e.getMessage(), e);
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to update profile.");
        }
    }

    // Helper functions

    /**
     * Get Single Post By ID (Enriched)
     */
    public PostResponse getPostById(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/posts?id=eq." + postId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            if (list != null && !list.isEmpty()) {
                List<PostResponse> enriched = enrichPosts(authHeader, currentUser.getId(), list);
                return enriched.get(0);
            }
            throw new ResourceNotFoundException("Post not found.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new ResourceNotFoundException("Post not found.");
        } catch (Exception e) {
            if (e instanceof ResourceNotFoundException) throw (ResourceNotFoundException) e;
            throw new ResourceNotFoundException("Post not found.");
        }
    }

    private void createNotification(String authHeader, String recipientId, String actorId, String type, String postId) {
        if (recipientId == null || recipientId.equals(actorId)) return;
        String url = supabaseUrl + "/rest/v1/notifications";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        Map<String, Object> body = new HashMap<>();
        body.put("recipient_id", recipientId);
        body.put("actor_id", actorId);
        body.put("type", type);
        if (postId != null) body.put("post_id", postId);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception ignored) {}
    }

    private List<String> getFollowingUserIds(String authHeader, String userId) {
        String url = supabaseUrl + "/rest/v1/follows?follower_id=eq." + userId + "&select=following_id";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> list = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            return list.stream().map(m -> (String) m.get("following_id")).collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<PostResponse> enrichPosts(String authHeader, String currentUserId, List<PostResponse> posts) {
        if (posts.isEmpty()) return posts;

        Set<String> userIds = posts.stream().map(PostResponse::getUserId).collect(Collectors.toSet());
        Set<String> postIds = posts.stream().map(PostResponse::getId).collect(Collectors.toSet());

        Map<String, UserDto> userMap = fetchUserMap(authHeader, userIds);

        // Fetch likes count and user liked status
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            String postIdList = postIds.stream().collect(Collectors.joining(","));

            // Likes
            String likesUrl = supabaseUrl + "/rest/v1/likes?post_id=in.(" + postIdList + ")&select=post_id,user_id";
            ResponseEntity<String> likesResp = restTemplate.exchange(likesUrl, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> likesList = objectMapper.readValue(likesResp.getBody(), new TypeReference<List<Map<String, Object>>>() {});

            Map<String, Long> likesCountMap = likesList.stream().collect(Collectors.groupingBy(m -> (String) m.get("post_id"), Collectors.counting()));
            Set<String> myLikedPostIds = likesList.stream().filter(m -> currentUserId.equals(m.get("user_id"))).map(m -> (String) m.get("post_id")).collect(Collectors.toSet());

            // Comments count
            String commentsUrl = supabaseUrl + "/rest/v1/comments?post_id=in.(" + postIdList + ")&select=post_id";
            ResponseEntity<String> commentsResp = restTemplate.exchange(commentsUrl, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> commentsList = objectMapper.readValue(commentsResp.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            Map<String, Long> commentsCountMap = commentsList.stream().collect(Collectors.groupingBy(m -> (String) m.get("post_id"), Collectors.counting()));

            // Saved posts
            String savedUrl = supabaseUrl + "/rest/v1/saved_posts?user_id=eq." + currentUserId + "&post_id=in.(" + postIdList + ")&select=post_id";
            ResponseEntity<String> savedResp = restTemplate.exchange(savedUrl, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> savedList = objectMapper.readValue(savedResp.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            Set<String> mySavedPostIds = savedList.stream().map(m -> (String) m.get("post_id")).collect(Collectors.toSet());

            // Multi-image post_media
            Map<String, List<PostMediaDto>> postMediaMap = new HashMap<>();
            try {
                String mediaUrl = supabaseUrl + "/rest/v1/post_media?post_id=in.(" + postIdList + ")&select=*&order=display_order.asc";
                ResponseEntity<String> mediaResp = restTemplate.exchange(mediaUrl, HttpMethod.GET, entity, String.class);
                List<PostMediaDto> allMedia = objectMapper.readValue(mediaResp.getBody(), new TypeReference<List<PostMediaDto>>() {});
                if (allMedia != null) {
                    postMediaMap = allMedia.stream().collect(Collectors.groupingBy(PostMediaDto::getPostId));
                }
            } catch (Exception e) {
                logger.debug("[POST_MEDIA] Non-fatal post_media query error (using fallback): {}", e.getMessage());
            }

            for (PostResponse p : posts) {
                p.setAuthor(userMap.get(p.getUserId()));
                p.setLikesCount(likesCountMap.getOrDefault(p.getId(), 0L).intValue());
                p.setCommentsCount(commentsCountMap.getOrDefault(p.getId(), 0L).intValue());
                p.setLiked(myLikedPostIds.contains(p.getId()));
                p.setSaved(mySavedPostIds.contains(p.getId()));

                // Populate media list (or fallback to image_url JSON array/string)
                List<PostMediaDto> pMedia = postMediaMap.get(p.getId());
                if (pMedia != null && !pMedia.isEmpty()) {
                    p.setMedia(pMedia);
                } else if (p.getImageUrl() != null && !p.getImageUrl().isBlank()) {
                    List<PostMediaDto> fallbackMedia = new ArrayList<>();
                    String imgStr = p.getImageUrl().trim();
                    if (imgStr.startsWith("[") && imgStr.endsWith("]")) {
                        try {
                            List<String> parsedUrls = objectMapper.readValue(imgStr, new TypeReference<List<String>>() {});
                            int order = 0;
                            for (String u : parsedUrls) {
                                fallbackMedia.add(new PostMediaDto(u.trim(), order++));
                            }
                        } catch (Exception ignored) {
                            fallbackMedia.add(new PostMediaDto(imgStr, 0));
                        }
                    } else if (imgStr.contains(",")) {
                        String[] parts = imgStr.split(",");
                        int order = 0;
                        for (String part : parts) {
                            if (!part.trim().isEmpty()) {
                                fallbackMedia.add(new PostMediaDto(part.trim(), order++));
                            }
                        }
                    } else {
                        fallbackMedia.add(new PostMediaDto(imgStr, 0));
                    }
                    p.setMedia(fallbackMedia);
                }
            }
        } catch (Exception e) {
            logger.warn("Error enriching posts metadata: {}", e.getMessage());
        }

        return posts;
    }

    private Map<String, UserDto> fetchUserMap(String authHeader, Set<String> userIds) {
        if (userIds.isEmpty()) return Collections.emptyMap();
        String idList = userIds.stream().collect(Collectors.joining(","));
        String url = supabaseUrl + "/rest/v1/profiles?id=in.(" + idList + ")&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> list = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});
            Map<String, UserDto> map = new HashMap<>();
            for (Map<String, Object> p : list) {
                String id = (String) p.get("id");
                String email = (String) p.get("email");
                String fullName = (String) p.get("full_name");
                String avatarUrl = (String) p.get("avatar_url");
                map.put(id, new UserDto(id, email, fullName, avatarUrl));
            }
            return map;
        } catch (Exception e) {
            return Collections.emptyMap();
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

    /**
     * Unified Global Search: Travelers, Posts, Destinations
     */
    public SearchResultDto searchGlobal(String authHeader, String query, String type, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        String q = (query != null) ? query.trim() : "";
        String searchType = (type != null) ? type.trim().toLowerCase() : "all";

        List<TravelerDto> travelers = new ArrayList<>();
        List<PostResponse> posts = new ArrayList<>();
        List<DestinationDto> destinations = new ArrayList<>();

        if (q.isEmpty()) {
            return new SearchResultDto(travelers, posts, destinations);
        }

        // 1. Search Travelers
        if (searchType.equals("all") || searchType.equals("traveler") || searchType.equals("travelers")) {
            travelers = getTravelers(authHeader, q);
            if (travelers.size() > limit) {
                travelers = travelers.subList(0, Math.min(limit, travelers.size()));
            }
        }

        // 2. Search Posts (by caption or destination)
        if (searchType.equals("all") || searchType.equals("post") || searchType.equals("posts")) {
            try {
                String safeQuery = q.replace(" ", "%");
                String postsUrl = supabaseUrl + "/rest/v1/posts?or=(caption.ilike.*" + safeQuery + "*,destination.ilike.*" + safeQuery + "*)" +
                        "&order=created_at.desc&limit=" + limit + "&offset=" + offset;
                HttpHeaders headers = createAuthenticatedHeaders(authHeader);
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(postsUrl, HttpMethod.GET, entity, String.class);
                List<PostResponse> postList = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
                posts = enrichPosts(authHeader, currentUser.getId(), postList);
            } catch (Exception e) {
                logger.warn("[SEARCH] Error searching posts: {}", e.getMessage());
            }
        }

        // 3. Search Destinations
        if (searchType.equals("all") || searchType.equals("destination") || searchType.equals("destinations")) {
            try {
                String safeQuery = q.replace(" ", "%");
                String destUrl = supabaseUrl + "/rest/v1/posts?destination.ilike.*" + safeQuery + "*&select=destination,image_url,created_at&limit=50";
                HttpHeaders headers = createAuthenticatedHeaders(authHeader);
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(destUrl, HttpMethod.GET, entity, String.class);
                List<Map<String, Object>> raw = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});

                Map<String, List<Map<String, Object>>> grouped = raw.stream()
                        .filter(m -> m.get("destination") != null && !((String) m.get("destination")).isBlank())
                        .collect(Collectors.groupingBy(m -> ((String) m.get("destination")).trim()));

                for (Map.Entry<String, List<Map<String, Object>>> entry : grouped.entrySet()) {
                    String dName = entry.getKey();
                    int count = entry.getValue().size();
                    String sampleImg = (String) entry.getValue().get(0).get("image_url");
                    destinations.add(new DestinationDto(dName, count, sampleImg));
                }
                destinations.sort((a, b) -> Integer.compare(b.getPostCount(), a.getPostCount()));
                if (destinations.size() > limit) {
                    destinations = destinations.subList(0, limit);
                }
            } catch (Exception e) {
                logger.warn("[SEARCH] Error searching destinations: {}", e.getMessage());
            }
        }

        return new SearchResultDto(travelers, posts, destinations);
    }

    /**
     * Get Posts By Destination
     */
    public List<PostResponse> getPostsByDestination(String authHeader, String destination, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        if (destination == null || destination.isBlank()) {
            return Collections.emptyList();
        }

        String safeDest = destination.trim().replace(" ", "%");
        String url = supabaseUrl + "/rest/v1/posts?destination.ilike.*" + safeDest + "*&order=created_at.desc&limit=" + limit + "&offset=" + offset;
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> posts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            return enrichPosts(authHeader, currentUser.getId(), posts);
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to fetch destination posts.");
        } catch (Exception e) {
            throw new RuntimeException("Unable to fetch destination posts.");
        }
    }

    /**
     * Get Trending Posts (Calculated score: likes*3 + comments*2 + recency)
     */
    public List<PostResponse> getTrendingPosts(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        // Fetch recent 50 posts to calculate live trending scores
        String url = supabaseUrl + "/rest/v1/posts?order=created_at.desc&limit=50";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> rawPosts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            List<PostResponse> enriched = enrichPosts(authHeader, currentUser.getId(), rawPosts);

            // Sort by live engagement: likesCount * 3 + commentsCount * 2
            enriched.sort((a, b) -> {
                int scoreA = (a.getLikesCount() * 3) + (a.getCommentsCount() * 2);
                int scoreB = (b.getLikesCount() * 3) + (b.getCommentsCount() * 2);
                return Integer.compare(scoreB, scoreA);
            });

            int fromIndex = Math.min(offset, enriched.size());
            int toIndex = Math.min(fromIndex + limit, enriched.size());
            return enriched.subList(fromIndex, toIndex);
        } catch (Exception e) {
            logger.warn("[TRENDING] Error getting trending posts: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get Trending Destinations from Real Posts
     */
    public List<DestinationDto> getTrendingDestinations(String authHeader, int limit) {
        extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/posts?select=destination,image_url,created_at&limit=100";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<Map<String, Object>> raw = objectMapper.readValue(response.getBody(), new TypeReference<List<Map<String, Object>>>() {});

            Map<String, List<Map<String, Object>>> grouped = raw.stream()
                    .filter(m -> m.get("destination") != null && !((String) m.get("destination")).isBlank())
                    .collect(Collectors.groupingBy(m -> ((String) m.get("destination")).trim()));

            List<DestinationDto> list = new ArrayList<>();
            for (Map.Entry<String, List<Map<String, Object>>> entry : grouped.entrySet()) {
                String dName = entry.getKey();
                int count = entry.getValue().size();
                String sampleImg = (String) entry.getValue().get(0).get("image_url");
                list.add(new DestinationDto(dName, count, sampleImg));
            }

            list.sort((a, b) -> Integer.compare(b.getPostCount(), a.getPostCount()));
            return list.subList(0, Math.min(limit, list.size()));
        } catch (Exception e) {
            logger.warn("[TRENDING] Error getting trending destinations: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get Suggested Travelers (Active users not yet followed, excluding self)
     */
    public List<TravelerDto> getSuggestedTravelers(String authHeader, int limit) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        List<TravelerDto> all = getTravelers(authHeader, "");

        // Filter out self and travelers already followed
        List<TravelerDto> suggestions = all.stream()
                .filter(t -> !t.getId().equals(currentUser.getId()))
                .filter(t -> !t.isFollowing())
                .sorted((a, b) -> Integer.compare(b.getFollowersCount(), a.getFollowersCount()))
                .collect(Collectors.toList());

        return suggestions.subList(0, Math.min(limit, suggestions.size()));
    }
}
