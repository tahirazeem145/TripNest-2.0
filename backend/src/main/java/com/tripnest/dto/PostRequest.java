package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostRequest {
    private String imageUrl;
    private String caption;
    private String destination;
    private List<PostMediaDto> media;

    public PostRequest() {}

    public PostRequest(String imageUrl, String caption, String destination) {
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.destination = destination;
    }

    public PostRequest(String imageUrl, String caption, String destination, List<PostMediaDto> media) {
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.destination = destination;
        this.media = media;
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public List<PostMediaDto> getMedia() { return media; }
    public void setMedia(List<PostMediaDto> media) { this.media = media; }
}
