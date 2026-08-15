package com.tripnest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchResultDto {
    private List<TravelerDto> travelers;
    private List<PostResponse> posts;
    private List<DestinationDto> destinations;

    public SearchResultDto() {}

    public SearchResultDto(List<TravelerDto> travelers, List<PostResponse> posts, List<DestinationDto> destinations) {
        this.travelers = travelers;
        this.posts = posts;
        this.destinations = destinations;
    }

    public List<TravelerDto> getTravelers() { return travelers; }
    public void setTravelers(List<TravelerDto> travelers) { this.travelers = travelers; }

    public List<PostResponse> getPosts() { return posts; }
    public void setPosts(List<PostResponse> posts) { this.posts = posts; }

    public List<DestinationDto> getDestinations() { return destinations; }
    public void setDestinations(List<DestinationDto> destinations) { this.destinations = destinations; }
}
