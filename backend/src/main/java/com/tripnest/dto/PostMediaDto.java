package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostMediaDto {
    private String id;

    @JsonProperty("post_id")
    private String postId;

    @JsonProperty("media_url")
    private String mediaUrl;

    @JsonProperty("media_type")
    private String mediaType = "image";

    @JsonProperty("display_order")
    private int displayOrder = 0;

    @JsonProperty("created_at")
    private String createdAt;

    public PostMediaDto() {}

    public PostMediaDto(String mediaUrl, int displayOrder) {
        this.mediaUrl = mediaUrl;
        this.displayOrder = displayOrder;
        this.mediaType = "image";
    }

    public PostMediaDto(String id, String postId, String mediaUrl, String mediaType, int displayOrder, String createdAt) {
        this.id = id;
        this.postId = postId;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.displayOrder = displayOrder;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
