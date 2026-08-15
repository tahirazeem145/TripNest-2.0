/**
 * Social API Service
 * 
 * Handles discovery feeds, real media upload, posts, likes, saves, comments, follows, notifications, and profiles.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const socialService = {
  // Real Media Upload
  uploadMedia: async (token, file, type = 'post') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/media/upload?type=${encodeURIComponent(type)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Unable to upload image. Please try again.');
    }
    return await response.json();
  },

  // Feeds with Pagination
  getHomeFeed: async (token, limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/feed/home?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch home feed');
    return await response.json();
  },

  getFollowingFeed: async (token, limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/feed/following?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch following feed');
    return await response.json();
  },

  getSavedPosts: async (token) => {
    const response = await fetch(`${API_BASE_URL}/posts/saved`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch saved posts');
    return await response.json();
  },

  getUserPosts: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch user posts');
    return await response.json();
  },

  getPostById: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch post');
    return await response.json();
  },

  // Post Actions
  createPost: async (token, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create post');
    }
    return await response.json();
  },

  deletePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete post');
  },

  likePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to like post');
  },

  unlikePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to unlike post');
  },

  savePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to save post');
  },

  unsavePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to unsave post');
  },

  // Comments
  addComment: async (token, postId, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return await response.json();
  },

  getComments: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
  },

  // Follows
  followUser: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to follow user');
  },

  unfollowUser: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to unfollow user');
  },

  // Travelers Discovery
  getTravelers: async (token, query = '') => {
    const url = query ? `${API_BASE_URL}/travelers?search=${encodeURIComponent(query)}` : `${API_BASE_URL}/travelers`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch travelers');
    return await response.json();
  },

  // Notifications
  getNotifications: async (token) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  },

  markNotificationsRead: async (token) => {
    await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Profile
  getProfile: async (token, userId = 'me') => {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  },

  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },

  // Phase 7 Discovery & Global Search
  searchGlobal: async (token, query, type = 'all', limit = 10, offset = 0) => {
    const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  },

  getPostsByDestination: async (token, destination, limit = 20, offset = 0) => {
    const url = `${API_BASE_URL}/explore/destinations/${encodeURIComponent(destination)}/posts?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch destination posts');
    return await response.json();
  },

  getTrendingPosts: async (token, limit = 20, offset = 0) => {
    const url = `${API_BASE_URL}/explore/trending?limit=${limit}&offset=${offset}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trending posts');
    return await response.json();
  },

  getTrendingDestinations: async (token, limit = 10) => {
    const url = `${API_BASE_URL}/explore/trending-destinations?limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch trending destinations');
    return await response.json();
  },

  getSuggestedTravelers: async (token, limit = 5) => {
    const url = `${API_BASE_URL}/travelers/suggested?limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch suggested travelers');
    return await response.json();
  }
};
