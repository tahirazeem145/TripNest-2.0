package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DestinationDto {
    private String name;
    private int postCount;
    private String sampleImageUrl;

    public DestinationDto() {}

    public DestinationDto(String name, int postCount, String sampleImageUrl) {
        this.name = name;
        this.postCount = postCount;
        this.sampleImageUrl = sampleImageUrl;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPostCount() { return postCount; }
    public void setPostCount(int postCount) { this.postCount = postCount; }

    public String getSampleImageUrl() { return sampleImageUrl; }
    public void setSampleImageUrl(String sampleImageUrl) { this.sampleImageUrl = sampleImageUrl; }
}
