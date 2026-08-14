package com.tripnest.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String accessToken;
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message, String accessToken, UserDto user) {
        this.success = success;
        this.message = message;
        this.accessToken = accessToken;
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
