package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TravelerDto {
    private String id;
    private String email;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    private String bio;

    @JsonProperty("followers_count")
    private int followersCount;

    @JsonProperty("following_count")
    private int followingCount;

    @JsonProperty("posts_count")
    private int postsCount;

    @JsonProperty("is_following")
    private boolean isFollowing;

    public TravelerDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public int getFollowersCount() { return followersCount; }
    public void setFollowersCount(int followersCount) { this.followersCount = followersCount; }

    public int getFollowingCount() { return followingCount; }
    public void setFollowingCount(int followingCount) { this.followingCount = followingCount; }

    public int getPostsCount() { return postsCount; }
    public void setPostsCount(int postsCount) { this.postsCount = postsCount; }

    public boolean isFollowing() { return isFollowing; }
    public void setFollowing(boolean following) { isFollowing = following; }
}
