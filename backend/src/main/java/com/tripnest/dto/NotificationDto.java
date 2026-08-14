package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NotificationDto {
    private String id;

    @JsonProperty("recipient_id")
    private String recipientId;

    @JsonProperty("actor_id")
    private String actorId;

    private String type;

    @JsonProperty("post_id")
    private String postId;

    @JsonProperty("is_read")
    private boolean isRead;

    @JsonProperty("created_at")
    private String createdAt;

    private UserDto actor;

    public NotificationDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }

    public String getActorId() { return actorId; }
    public void setActorId(String actorId) { this.actorId = actorId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public UserDto getActor() { return actor; }
    public void setActor(UserDto actor) { this.actor = actor; }
}
