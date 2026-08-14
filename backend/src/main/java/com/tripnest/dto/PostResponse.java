package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostResponse {
    private String id;
    
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("journey_id")
    private String journeyId;

    @JsonProperty("image_url")
    private String imageUrl;

    private String caption;
    private String destination;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    // Social enrichment fields
    private UserDto author;
    
    @JsonProperty("likes_count")
    private int likesCount;

    @JsonProperty("comments_count")
    private int commentsCount;

    @JsonProperty("is_liked")
    private boolean isLiked;

    @JsonProperty("is_saved")
    private boolean isSaved;

    public PostResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getJourneyId() { return journeyId; }
    public void setJourneyId(String journeyId) { this.journeyId = journeyId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }

    public boolean isLiked() { return isLiked; }
    public void setLiked(boolean liked) { isLiked = liked; }

    public boolean isSaved() { return isSaved; }
    public void setSaved(boolean saved) { isSaved = saved; }
}
