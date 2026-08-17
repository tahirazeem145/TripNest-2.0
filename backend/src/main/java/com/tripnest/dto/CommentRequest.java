package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CommentRequest {
    private String content;

    @JsonProperty("parent_id")
    private String parentId;

    public CommentRequest() {}

    public CommentRequest(String content) {
        this.content = content;
    }

    public CommentRequest(String content, String parentId) {
        this.content = content;
        this.parentId = parentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}
