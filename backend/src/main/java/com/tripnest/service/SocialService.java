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

@Service
public class SocialService {

    private static final Logger logger = LoggerFactory.getLogger(SocialService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    private final AuthService authService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SocialService(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Create a new post
     */
    public PostResponse createPost(String authHeader, PostRequest request) {
        UserDto user = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/posts";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", user.getId());
        body.put("image_url", request.getImageUrl());
        body.put("caption", request.getCaption());
        body.put("destination", request.getDestination());
        if (request.getJourneyId() != null && !request.getJourneyId().isBlank()) {
            body.put("journey_id", request.getJourneyId());
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            if (list != null && !list.isEmpty()) {
                PostResponse created = list.get(0);
                created.setAuthor(user);
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
     * Get Discovery Home Feed
     */
    public List<PostResponse> getHomeFeed(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/posts?select=*&order=created_at.desc&limit=50";
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
     * Get Following Feed
     */
    public List<PostResponse> getFollowingFeed(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        // 1. Get following IDs
        List<String> followingIds = getFollowingUserIds(authHeader, currentUser.getId());
        if (followingIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. Fetch posts from those following IDs
        String idList = followingIds.stream().collect(Collectors.joining(","));
        String url = supabaseUrl + "/rest/v1/posts?user_id=in.(" + idList + ")&select=*&order=created_at.desc&limit=50";
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
     * Add Comment to Post
     */
    public CommentDto addComment(String authHeader, String postId, String content) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/comments";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", currentUser.getId());
        body.put("post_id", postId);
        body.put("content", content);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            List<CommentDto> list = objectMapper.readValue(response.getBody(), new TypeReference<List<CommentDto>>() {});
            if (list != null && !list.isEmpty()) {
                CommentDto comment = list.get(0);
                comment.setAuthor(currentUser);

                // Notify post owner
                PostResponse post = getPostById(authHeader, postId);
                if (!post.getUserId().equals(currentUser.getId())) {
                    createNotification(authHeader, post.getUserId(), currentUser.getId(), "comment", postId);
                }

                return comment;
            }
            throw new RuntimeException("Failed to add comment.");
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to add comment.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to add comment.");
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
            handleRestError(e);
            throw new RuntimeException("Failed to fetch comments.");
        } catch (Exception e) {
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
        } catch (Exception ignored) {}
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
            if (list.isEmpty()) {
                throw new ResourceNotFoundException("Profile not found.");
            }

            Map<String, Object> p = list.get(0);
            TravelerDto dto = new TravelerDto();
            dto.setId(targetId);
            dto.setEmail((String) p.get("email"));
            dto.setFullName((String) p.get("full_name"));
            dto.setAvatarUrl((String) p.get("avatar_url"));
            dto.setBio((String) p.get("bio"));

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
    public TravelerDto updateProfile(String authHeader, Map<String, String> updates) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        String url = supabaseUrl + "/rest/v1/profiles?id=eq." + currentUser.getId();
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        headers.set("Prefer", "return=representation");

        Map<String, Object> body = new HashMap<>();
        if (updates.containsKey("fullName")) body.put("full_name", updates.get("fullName"));
        if (updates.containsKey("bio")) body.put("bio", updates.get("bio"));
        if (updates.containsKey("avatarUrl")) body.put("avatar_url", updates.get("avatarUrl"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
            return getTravelerProfile(authHeader, currentUser.getId());
        } catch (HttpClientErrorException e) {
            handleRestError(e);
            throw new RuntimeException("Failed to update profile.");
        } catch (Exception e) {
            if (e instanceof RuntimeException && !(e instanceof HttpClientErrorException)) {
                throw (RuntimeException) e;
            }
            throw new RuntimeException("Unable to update profile.");
        }
    }

    // Helper functions

    private PostResponse getPostById(String authHeader, String postId) {
        String url = supabaseUrl + "/rest/v1/posts?id=eq." + postId + "&select=*";
        HttpHeaders headers = createAuthenticatedHeaders(authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
            if (list != null && !list.isEmpty()) return list.get(0);
            throw new ResourceNotFoundException("Post not found.");
        } catch (Exception e) {
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

            for (PostResponse p : posts) {
                p.setAuthor(userMap.get(p.getUserId()));
                p.setLikesCount(likesCountMap.getOrDefault(p.getId(), 0L).intValue());
                p.setCommentsCount(commentsCountMap.getOrDefault(p.getId(), 0L).intValue());
                p.setLiked(myLikedPostIds.contains(p.getId()));
                p.setSaved(mySavedPostIds.contains(p.getId()));
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
}
