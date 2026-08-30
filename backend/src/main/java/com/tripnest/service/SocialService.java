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

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;

@Service
@SuppressWarnings("null")
public class SocialService {

    private static final Logger logger = LoggerFactory.getLogger(SocialService.class);

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.anon-key:}")
    private String supabaseAnonKey;

    private final AuthService authService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory fallback state
    private final List<PostResponse> inMemoryPosts = new CopyOnWriteArrayList<>();
    private final Map<String, Set<String>> postLikes = new ConcurrentHashMap<>(); // postId -> Set of userIds
    private final Map<String, Set<String>> userSaves = new ConcurrentHashMap<>(); // userId -> Set of postIds
    private final Map<String, List<CommentDto>> inMemoryComments = new ConcurrentHashMap<>(); // postId -> List of comments
    private final Map<String, Set<String>> userFollowers = new ConcurrentHashMap<>(); // userId -> Set of follower userIds
    private final Map<String, Set<String>> userFollowing = new ConcurrentHashMap<>(); // userId -> Set of following userIds
    private final Map<String, TravelerDto> userProfiles = new ConcurrentHashMap<>(); // userId -> TravelerDto
    private final Map<String, List<NotificationDto>> userNotifications = new ConcurrentHashMap<>(); // userId -> List of notifications

    @PostConstruct
    public void init() {
        if (supabaseAnonKey == null || supabaseAnonKey.isBlank() || supabaseAnonKey.contains("YOUR_PUBLI") || supabaseAnonKey.contains("placeholder") || supabaseAnonKey.contains("your-publishable-key")) {
            this.supabaseAnonKey = "sb_publishable_tpxk77X1biBT7rLY7ar4bw_XMD87GnT";
        }
        seedInMemoryData();
    }

    public SocialService(AuthService authService, RestTemplate restTemplate) {
        this.authService = authService;
        this.restTemplate = restTemplate;
    }

    private void seedInMemoryData() {
        // Seed travelers
        createSeedProfile("user-test-01", "test@gmail.com", "Alex Traveler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "Wanderer & photographer. Exploring the world one hidden gem at a time. 🌍📸", 1240, 312, 18);
        createSeedProfile("user-yuva-02", "yuva@gmail.com", "Yuva Explorer", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "Alpine climber & landscape storyteller. Currently chasing sunrises across Europe. 🏔️", 890, 245, 12);
        createSeedProfile("user-sofia-03", "sofia.rossi@travel.io", "Sofia Rossi", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "Mediterranean lover & food adventurer. Living for sunsets in Positano & Santorini. 🍝✨", 2150, 480, 34);
        createSeedProfile("user-kai-04", "kai.tanaka@tokyo.jp", "Kai Tanaka", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "Kyoto native sharing timeless temples, matcha cafes, and hidden bamboo paths. ⛩️🍵", 1680, 190, 26);
        createSeedProfile("user-maya-05", "maya.lin@nomad.com", "Maya Lin", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "Digital nomad discovering tranquil islands, coral reefs, and ocean horizons. 🏝️🌊", 940, 310, 15);

        // Seed default following relationships
        addFollowRel("user-test-01", "user-sofia-03");
        addFollowRel("user-test-01", "user-kai-04");
        addFollowRel("user-yuva-02", "user-test-01");
        addFollowRel("user-sofia-03", "user-test-01");

        // Seed posts
        addSeedPost("post-demo-01", "user-sofia-03", "Santorini, Greece",
                "Golden hour over the caldera in Oia ✨ The blue domes and Aegean sea breeze never get old! Where is your dream sunset spot? 🌅🇬🇷",
                List.of(
                        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200",
                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200"
                ), 42, 5, "2026-08-30T10:15:00Z");

        addSeedPost("post-demo-02", "user-test-01", "Amalfi Coast, Italy",
                "Cliffside roads, lemon groves, and pastel houses stacked above the Tyrrhenian Sea 🍋🛵 Italy in the summer is unmatched!",
                List.of(
                        "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200",
                        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200"
                ), 38, 3, "2026-08-30T08:30:00Z");

        addSeedPost("post-demo-03", "user-kai-04", "Kyoto, Japan",
                "Walking through the thousands of vermilion Torii gates at Fushimi Inari Taisha early morning before the crowds arrive. Pure peace ⛩️🌿",
                List.of(
                        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200",
                        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200"
                ), 65, 8, "2026-08-29T18:45:00Z");

        addSeedPost("post-demo-04", "user-yuva-02", "Zermatt, Switzerland",
                "First morning light hitting the iconic peak of the Matterhorn 🏔️❄️ 3,000 meters above sea level and breathing the freshest alpine air.",
                List.of(
                        "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200",
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200"
                ), 51, 4, "2026-08-28T14:20:00Z");

        addSeedPost("post-demo-05", "user-maya-05", "Ubud, Bali",
                "Sunrise over the Tegalalang Rice Terraces 🌴🌾 The morning mist and golden sunbeams through the palm trees are sheer magic.",
                List.of(
                        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200",
                        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200"
                ), 29, 2, "2026-08-27T11:00:00Z");

        // Seed comments
        addSeedComment("post-demo-01", "user-test-01", "Alex Traveler", "Incredible shots Sofia! Adding this to my bucket list for next spring ✈️");
        addSeedComment("post-demo-01", "user-yuva-02", "Yuva Explorer", "The blue hour tones are breathtaking! What camera setup did you use?");
        addSeedComment("post-demo-02", "user-sofia-03", "Sofia Rossi", "Welcome to Italy Alex! Make sure to grab the gelato at Positano harbor 🍨");
        addSeedComment("post-demo-03", "user-maya-05", "Maya Lin", "Kyoto in the morning is truly magical! Beautiful framing Kai 🌸");

        // Seed user likes & saves
        setPostLiked("post-demo-01", "user-test-01");
        setPostSaved("post-demo-01", "user-test-01");
        setPostLiked("post-demo-03", "user-test-01");
    }

    private void createSeedProfile(String id, String email, String name, String avatar, String bio, int followers, int following, int posts) {
        TravelerDto t = new TravelerDto();
        t.setId(id);
        t.setEmail(email);
        t.setFullName(name);
        t.setAvatarUrl(avatar);
        t.setBio(bio);
        t.setFollowersCount(followers);
        t.setFollowingCount(following);
        t.setPostsCount(posts);
        userProfiles.put(id, t);
        authService.registerDemoUser(id, email, "123456", name, avatar);
    }

    private void addFollowRel(String followerId, String followingId) {
        userFollowing.computeIfAbsent(followerId, k -> ConcurrentHashMap.newKeySet()).add(followingId);
        userFollowers.computeIfAbsent(followingId, k -> ConcurrentHashMap.newKeySet()).add(followerId);
    }

    private void addSeedPost(String id, String userId, String destination, String caption, List<String> imageUrls, int likes, int comments, String createdAt) {
        PostResponse post = new PostResponse();
        post.setId(id);
        post.setUserId(userId);
        post.setDestination(destination);
        post.setCaption(caption);
        post.setImageUrl(imageUrls.get(0));
        post.setCreatedAt(createdAt);
        post.setUpdatedAt(createdAt);

        List<PostMediaDto> mediaList = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            mediaList.add(new PostMediaDto(imageUrls.get(i), i));
        }
        post.setMedia(mediaList);
        post.setLikesCount(likes);
        post.setCommentsCount(comments);

        TravelerDto authorProfile = userProfiles.get(userId);
        if (authorProfile != null) {
            post.setAuthor(new UserDto(authorProfile.getId(), authorProfile.getEmail(), authorProfile.getFullName(), authorProfile.getAvatarUrl()));
        } else {
            post.setAuthor(new UserDto(userId, "traveler@tripnest.com", "Traveler", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"));
        }

        inMemoryPosts.add(post);
    }

    private void addSeedComment(String postId, String userId, String userName, String text) {
        CommentDto comment = new CommentDto();
        comment.setId("comment-" + UUID.randomUUID().toString().substring(0, 8));
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(text);
        comment.setCreatedAt(Instant.now().toString());

        TravelerDto authorProfile = userProfiles.get(userId);
        String avatar = (authorProfile != null) ? authorProfile.getAvatarUrl() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        comment.setAuthor(new UserDto(userId, (authorProfile != null) ? authorProfile.getEmail() : "user@tripnest.com", userName, avatar));

        inMemoryComments.computeIfAbsent(postId, k -> new CopyOnWriteArrayList<>()).add(comment);
    }

    private void setPostLiked(String postId, String userId) {
        postLikes.computeIfAbsent(postId, k -> ConcurrentHashMap.newKeySet()).add(userId);
    }

    private void setPostSaved(String postId, String userId) {
        userSaves.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(postId);
    }

    private boolean isSupabaseConfigured() {
        return supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("placeholder")
                && !supabaseUrl.contains("wukcqzekqryhnmhncipv");
    }

    /**
     * Create a new post
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

        // Try Supabase if configured
        if (isSupabaseConfigured()) {
            try {
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
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                List<PostResponse> list = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
                if (list != null && !list.isEmpty()) {
                    PostResponse created = list.get(0);
                    created.setAuthor(user);
                    return created;
                }
            } catch (Exception e) {
                logger.warn("[POSTS] Supabase save failed ({}), saving to in-memory store...", e.getMessage());
            }
        }

        // In-memory fallback
        PostResponse localPost = new PostResponse();
        localPost.setId("post-" + UUID.randomUUID().toString().substring(0, 8));
        localPost.setUserId(user.getId());
        localPost.setDestination(request.getDestination());
        localPost.setCaption(request.getCaption());
        localPost.setImageUrl(imageUrls.get(0));
        localPost.setCreatedAt(Instant.now().toString());
        localPost.setUpdatedAt(Instant.now().toString());

        List<PostMediaDto> mediaList = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            mediaList.add(new PostMediaDto(imageUrls.get(i), i));
        }
        localPost.setMedia(mediaList);
        localPost.setAuthor(user);
        localPost.setLikesCount(0);
        localPost.setCommentsCount(0);
        localPost.setLiked(false);
        localPost.setSaved(false);

        inMemoryPosts.add(0, localPost);

        // Update author posts count
        TravelerDto prof = userProfiles.get(user.getId());
        if (prof != null) {
            prof.setPostsCount(prof.getPostsCount() + 1);
        }

        return localPost;
    }

    /**
     * Get Discovery Home Feed
     */
    public List<PostResponse> getHomeFeed(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        int safeLimit = (limit > 0 && limit <= 50) ? limit : 10;
        int safeOffset = Math.max(0, offset);

        if (isSupabaseConfigured()) {
            try {
                String url = supabaseUrl + "/rest/v1/posts?select=*&order=created_at.desc&limit=" + safeLimit + "&offset=" + safeOffset;
                HttpHeaders headers = createAuthenticatedHeaders(authHeader);
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                List<PostResponse> posts = objectMapper.readValue(response.getBody(), new TypeReference<List<PostResponse>>() {});
                return enrichPosts(authHeader, currentUser.getId(), posts);
            } catch (Exception e) {
                logger.warn("[FEED] Supabase feed fetch failed ({}), returning in-memory posts...", e.getMessage());
            }
        }

        // Return enriched in-memory posts
        List<PostResponse> enriched = inMemoryPosts.stream()
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());

        int fromIndex = Math.min(safeOffset, enriched.size());
        int toIndex = Math.min(fromIndex + safeLimit, enriched.size());
        return enriched.subList(fromIndex, toIndex);
    }

    /**
     * Get Following Feed
     */
    public List<PostResponse> getFollowingFeed(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        int safeLimit = (limit > 0 && limit <= 50) ? limit : 10;
        int safeOffset = Math.max(0, offset);

        Set<String> following = userFollowing.getOrDefault(currentUser.getId(), Collections.emptySet());
        List<PostResponse> filtered = inMemoryPosts.stream()
                .filter(p -> following.contains(p.getUserId()))
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());

        int fromIndex = Math.min(safeOffset, filtered.size());
        int toIndex = Math.min(fromIndex + safeLimit, filtered.size());
        return filtered.subList(fromIndex, toIndex);
    }

    /**
     * Get Saved Posts
     */
    public List<PostResponse> getSavedPosts(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        Set<String> savedIds = userSaves.getOrDefault(currentUser.getId(), Collections.emptySet());

        return inMemoryPosts.stream()
                .filter(p -> savedIds.contains(p.getId()))
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());
    }

    /**
     * Get User Profile Posts
     */
    public List<PostResponse> getUserPosts(String authHeader, String userId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        return inMemoryPosts.stream()
                .filter(p -> p.getUserId().equals(userId))
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());
    }

    /**
     * Get Post by ID
     */
    public PostResponse getPostById(String authHeader, String id) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        for (PostResponse p : inMemoryPosts) {
            if (p.getId().equals(id)) {
                return cloneAndEnrichLocalPost(currentUser.getId(), p);
            }
        }
        throw new ResourceNotFoundException("Post not found: " + id);
    }

    /**
     * Delete Post
     */
    public void deletePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        PostResponse post = getPostById(authHeader, postId);
        if (!post.getUserId().equals(currentUser.getId())) {
            throw new ForbiddenException("You cannot delete another traveler's post.");
        }
        inMemoryPosts.removeIf(p -> p.getId().equals(postId));
        postLikes.remove(postId);
        inMemoryComments.remove(postId);
    }

    /**
     * Like a Post
     */
    public void likePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        setPostLiked(postId, currentUser.getId());

        // Update post likes count
        for (PostResponse p : inMemoryPosts) {
            if (p.getId().equals(postId)) {
                Set<String> likes = postLikes.getOrDefault(postId, Collections.emptySet());
                p.setLikesCount(likes.size());
                break;
            }
        }
    }

    /**
     * Unlike a Post
     */
    public void unlikePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        Set<String> likes = postLikes.get(postId);
        if (likes != null) {
            likes.remove(currentUser.getId());
        }

        for (PostResponse p : inMemoryPosts) {
            if (p.getId().equals(postId)) {
                Set<String> currentLikes = postLikes.getOrDefault(postId, Collections.emptySet());
                p.setLikesCount(currentLikes.size());
                break;
            }
        }
    }

    /**
     * Save a Post
     */
    public void savePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        setPostSaved(postId, currentUser.getId());
    }

    /**
     * Unsave a Post
     */
    public void unsavePost(String authHeader, String postId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        Set<String> saves = userSaves.get(currentUser.getId());
        if (saves != null) {
            saves.remove(postId);
        }
    }

    /**
     * Add Comment to Post
     */
    public CommentDto addComment(String authHeader, String postId, String content) {
        return addComment(authHeader, postId, content, null);
    }

    public CommentDto addComment(String authHeader, String postId, String content, String parentId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        CommentDto comment = new CommentDto();
        comment.setId("comment-" + UUID.randomUUID().toString().substring(0, 8));
        comment.setPostId(postId);
        comment.setUserId(currentUser.getId());
        comment.setContent(content);
        comment.setParentId(parentId);
        comment.setCreatedAt(Instant.now().toString());
        comment.setAuthor(currentUser);

        inMemoryComments.computeIfAbsent(postId, k -> new CopyOnWriteArrayList<>()).add(comment);

        // Update post comment count
        for (PostResponse p : inMemoryPosts) {
            if (p.getId().equals(postId)) {
                p.setCommentsCount(inMemoryComments.getOrDefault(postId, Collections.emptyList()).size());
                break;
            }
        }

        return comment;
    }

    /**
     * Get Comments for Post
     */
    public List<CommentDto> getPostComments(String authHeader, String postId) {
        extractAuthenticatedUser(authHeader);
        return inMemoryComments.getOrDefault(postId, Collections.emptyList());
    }

    /**
     * Delete Comment
     */
    public void deleteComment(String authHeader, String commentId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        for (Map.Entry<String, List<CommentDto>> entry : inMemoryComments.entrySet()) {
            List<CommentDto> list = entry.getValue();
            for (CommentDto c : list) {
                if (c.getId().equals(commentId)) {
                    if (!c.getUserId().equals(currentUser.getId())) {
                        throw new ForbiddenException("You can only delete your own comments.");
                    }
                    list.remove(c);
                    return;
                }
            }
        }
    }

    /**
     * Update Comment
     */
    public CommentDto updateComment(String authHeader, String commentId, String content) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        for (Map.Entry<String, List<CommentDto>> entry : inMemoryComments.entrySet()) {
            for (CommentDto c : entry.getValue()) {
                if (c.getId().equals(commentId)) {
                    if (!c.getUserId().equals(currentUser.getId())) {
                        throw new ForbiddenException("You can only edit your own comments.");
                    }
                    c.setContent(content.trim());
                    return c;
                }
            }
        }
        throw new ResourceNotFoundException("Comment not found.");
    }

    /**
     * Follow a User
     */
    public void followUser(String authHeader, String followingId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        if (currentUser.getId().equals(followingId)) {
            throw new RuntimeException("You cannot follow yourself.");
        }

        addFollowRel(currentUser.getId(), followingId);

        // Update profile follower/following counts
        TravelerDto target = userProfiles.get(followingId);
        if (target != null) {
            target.setFollowersCount(userFollowers.getOrDefault(followingId, Collections.emptySet()).size());
        }
        TravelerDto current = userProfiles.get(currentUser.getId());
        if (current != null) {
            current.setFollowingCount(userFollowing.getOrDefault(currentUser.getId(), Collections.emptySet()).size());
        }
    }

    /**
     * Unfollow a User
     */
    public void unfollowUser(String authHeader, String followingId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        Set<String> following = userFollowing.get(currentUser.getId());
        if (following != null) {
            following.remove(followingId);
        }
        Set<String> followers = userFollowers.get(followingId);
        if (followers != null) {
            followers.remove(currentUser.getId());
        }

        TravelerDto target = userProfiles.get(followingId);
        if (target != null) {
            target.setFollowersCount(userFollowers.getOrDefault(followingId, Collections.emptySet()).size());
        }
        TravelerDto current = userProfiles.get(currentUser.getId());
        if (current != null) {
            current.setFollowingCount(userFollowing.getOrDefault(currentUser.getId(), Collections.emptySet()).size());
        }
    }

    /**
     * Get Travelers List
     */
    public List<TravelerDto> getTravelers(String authHeader, String query) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        String q = (query != null) ? query.trim().toLowerCase() : "";

        Set<String> myFollowing = userFollowing.getOrDefault(currentUser.getId(), Collections.emptySet());

        return userProfiles.values().stream()
                .filter(t -> q.isEmpty() || t.getFullName().toLowerCase().contains(q) || (t.getBio() != null && t.getBio().toLowerCase().contains(q)))
                .map(t -> {
                    TravelerDto dto = new TravelerDto();
                    dto.setId(t.getId());
                    dto.setEmail(t.getEmail());
                    dto.setFullName(t.getFullName());
                    dto.setAvatarUrl(t.getAvatarUrl());
                    dto.setBio(t.getBio());
                    dto.setFollowersCount(userFollowers.getOrDefault(t.getId(), Collections.emptySet()).size());
                    dto.setFollowingCount(userFollowing.getOrDefault(t.getId(), Collections.emptySet()).size());
                    dto.setPostsCount(t.getPostsCount());
                    dto.setFollowing(myFollowing.contains(t.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get Traveler Profile
     */
    public TravelerDto getTravelerProfile(String authHeader, String userId) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        TravelerDto profile = userProfiles.get(userId);
        if (profile == null) {
            profile = new TravelerDto();
            profile.setId(userId);
            profile.setEmail("traveler@tripnest.com");
            profile.setFullName("Traveler");
            profile.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
            profile.setBio("Passionate globetrotter discovering new trails and stories.");
            profile.setFollowersCount(15);
            profile.setFollowingCount(8);
            profile.setPostsCount(1);
        }

        Set<String> myFollowing = userFollowing.getOrDefault(currentUser.getId(), Collections.emptySet());
        TravelerDto copy = new TravelerDto();
        copy.setId(profile.getId());
        copy.setEmail(profile.getEmail());
        copy.setFullName(profile.getFullName());
        copy.setAvatarUrl(profile.getAvatarUrl());
        copy.setBio(profile.getBio());
        copy.setFollowersCount(userFollowers.getOrDefault(profile.getId(), Collections.emptySet()).size());
        copy.setFollowingCount(userFollowing.getOrDefault(profile.getId(), Collections.emptySet()).size());
        copy.setPostsCount(profile.getPostsCount());
        copy.setFollowing(myFollowing.contains(profile.getId()));
        return copy;
    }

    /**
     * Update Current User Profile
     */
    public TravelerDto updateProfile(String authHeader, ProfileUpdateRequest updates) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        TravelerDto profile = userProfiles.computeIfAbsent(currentUser.getId(), k -> {
            TravelerDto t = new TravelerDto();
            t.setId(currentUser.getId());
            t.setEmail(currentUser.getEmail());
            t.setFullName(currentUser.getFullName());
            t.setAvatarUrl(currentUser.getAvatarUrl());
            return t;
        });

        if (updates.getFullName() != null && !updates.getFullName().isBlank()) {
            profile.setFullName(updates.getFullName().trim());
            currentUser.setFullName(updates.getFullName().trim());
        }
        if (updates.getBio() != null) {
            profile.setBio(updates.getBio().trim());
        }
        if (updates.getAvatarUrl() != null && !updates.getAvatarUrl().isBlank()) {
            profile.setAvatarUrl(updates.getAvatarUrl().trim());
            currentUser.setAvatarUrl(updates.getAvatarUrl().trim());
        }

        return profile;
    }

    /**
     * Get Notifications
     */
    public List<NotificationDto> getNotifications(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        return userNotifications.getOrDefault(currentUser.getId(), Collections.emptyList());
    }

    /**
     * Mark Notifications Read
     */
    public void markNotificationsRead(String authHeader) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        List<NotificationDto> notifs = userNotifications.get(currentUser.getId());
        if (notifs != null) {
            notifs.forEach(n -> n.setRead(true));
        }
    }

    /**
     * Global Search
     */
    public SearchResultDto searchGlobal(String authHeader, String query, String type, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        String q = (query != null) ? query.trim().toLowerCase() : "";

        List<TravelerDto> travelers = getTravelers(authHeader, q);
        List<PostResponse> posts = inMemoryPosts.stream()
                .filter(p -> q.isEmpty() || (p.getCaption() != null && p.getCaption().toLowerCase().contains(q)) || (p.getDestination() != null && p.getDestination().toLowerCase().contains(q)))
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());

        List<DestinationDto> destinations = getTrendingDestinations(authHeader, 10).stream()
                .filter(d -> q.isEmpty() || d.getName().toLowerCase().contains(q))
                .collect(Collectors.toList());

        return new SearchResultDto(travelers, posts, destinations);
    }

    /**
     * Get Posts By Destination
     */
    public List<PostResponse> getPostsByDestination(String authHeader, String destination, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        String dest = (destination != null) ? destination.trim().toLowerCase() : "";

        return inMemoryPosts.stream()
                .filter(p -> p.getDestination() != null && p.getDestination().toLowerCase().contains(dest))
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .collect(Collectors.toList());
    }

    /**
     * Get Trending Posts
     */
    public List<PostResponse> getTrendingPosts(String authHeader, int limit, int offset) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);

        List<PostResponse> list = inMemoryPosts.stream()
                .map(p -> cloneAndEnrichLocalPost(currentUser.getId(), p))
                .sorted((a, b) -> {
                    int scoreA = (a.getLikesCount() * 3) + (a.getCommentsCount() * 2);
                    int scoreB = (b.getLikesCount() * 3) + (b.getCommentsCount() * 2);
                    return Integer.compare(scoreB, scoreA);
                })
                .collect(Collectors.toList());

        int fromIndex = Math.min(offset, list.size());
        int toIndex = Math.min(fromIndex + limit, list.size());
        return list.subList(fromIndex, toIndex);
    }

    /**
     * Get Trending Destinations
     */
    public List<DestinationDto> getTrendingDestinations(String authHeader, int limit) {
        extractAuthenticatedUser(authHeader);

        Map<String, List<PostResponse>> grouped = inMemoryPosts.stream()
                .filter(p -> p.getDestination() != null && !p.getDestination().isBlank())
                .collect(Collectors.groupingBy(p -> p.getDestination().trim()));

        List<DestinationDto> destinations = new ArrayList<>();
        for (Map.Entry<String, List<PostResponse>> entry : grouped.entrySet()) {
            String name = entry.getKey();
            int count = entry.getValue().size();
            String sampleImg = entry.getValue().get(0).getImageUrl();
            destinations.add(new DestinationDto(name, count, sampleImg));
        }

        destinations.sort((a, b) -> Integer.compare(b.getPostCount(), a.getPostCount()));
        return destinations.subList(0, Math.min(limit, destinations.size()));
    }

    /**
     * Get Suggested Travelers
     */
    public List<TravelerDto> getSuggestedTravelers(String authHeader, int limit) {
        UserDto currentUser = extractAuthenticatedUser(authHeader);
        List<TravelerDto> all = getTravelers(authHeader, "");

        List<TravelerDto> suggestions = all.stream()
                .filter(t -> !t.getId().equals(currentUser.getId()))
                .filter(t -> !t.isFollowing())
                .sorted((a, b) -> Integer.compare(b.getFollowersCount(), a.getFollowersCount()))
                .collect(Collectors.toList());

        return suggestions.subList(0, Math.min(limit, suggestions.size()));
    }

    private PostResponse cloneAndEnrichLocalPost(String currentUserId, PostResponse src) {
        PostResponse p = new PostResponse();
        p.setId(src.getId());
        p.setUserId(src.getUserId());
        p.setImageUrl(src.getImageUrl());
        p.setCaption(src.getCaption());
        p.setDestination(src.getDestination());
        p.setMedia(new ArrayList<>(src.getMedia()));
        p.setCreatedAt(src.getCreatedAt());
        p.setUpdatedAt(src.getUpdatedAt());
        p.setAuthor(src.getAuthor());

        Set<String> likes = postLikes.getOrDefault(src.getId(), Collections.emptySet());
        p.setLikesCount(Math.max(src.getLikesCount(), likes.size()));
        p.setLiked(likes.contains(currentUserId));

        Set<String> saves = userSaves.getOrDefault(currentUserId, Collections.emptySet());
        p.setSaved(saves.contains(src.getId()));

        List<CommentDto> comments = inMemoryComments.getOrDefault(src.getId(), Collections.emptyList());
        p.setCommentsCount(Math.max(src.getCommentsCount(), comments.size()));

        return p;
    }

    private List<PostResponse> enrichPosts(String authHeader, String currentUserId, List<PostResponse> posts) {
        if (posts == null || posts.isEmpty()) {
            return Collections.emptyList();
        }
        return posts.stream().map(p -> cloneAndEnrichLocalPost(currentUserId, p)).collect(Collectors.toList());
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
}
