package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CommentDto {
    private String id;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("post_id")
    private String postId;

    private String content;

    @JsonProperty("created_at")
    private String createdAt;

    private UserDto author;

    public CommentDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public UserDto getAuthor() { return author; }
    public void setAuthor(UserDto author) { this.author = author; }
}
