package com.tripnest.dto;

public class PostRequest {
    private String imageUrl;
    private String caption;
    private String destination;
    private String journeyId;

    public PostRequest() {}

    public PostRequest(String imageUrl, String caption, String destination, String journeyId) {
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.destination = destination;
        this.journeyId = journeyId;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getJourneyId() { return journeyId; }
    public void setJourneyId(String journeyId) { this.journeyId = journeyId; }
}
