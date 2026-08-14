package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ProfileUpdateRequest {
    @JsonProperty("fullName")
    private String fullName;

    @JsonProperty("full_name")
    private String fullNameSnake;

    private String bio;

    @JsonProperty("avatarUrl")
    private String avatarUrl;

    @JsonProperty("avatar_url")
    private String avatarUrlSnake;

    public ProfileUpdateRequest() {}

    public String getFullName() {
        return (fullName != null && !fullName.isBlank()) ? fullName : fullNameSnake;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFullNameSnake() {
        return fullNameSnake;
    }

    public void setFullNameSnake(String fullNameSnake) {
        this.fullNameSnake = fullNameSnake;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return (avatarUrl != null && !avatarUrl.isBlank()) ? avatarUrl : avatarUrlSnake;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAvatarUrlSnake() {
        return avatarUrlSnake;
    }

    public void setAvatarUrlSnake(String avatarUrlSnake) {
        this.avatarUrlSnake = avatarUrlSnake;
    }
}
