/**
 * Social API Service
 * 
 * Handles discovery feeds, posts, likes, saves, comments, follows, notifications, and profiles.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const socialService = {
  // Feeds
  getHomeFeed: async (token) => {
    const response = await fetch(`${API_BASE_URL}/feed/home`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch home feed');
    return await response.json();
  },

  getFollowingFeed: async (token) => {
    const response = await fetch(`${API_BASE_URL}/feed/following`, {
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
    if (!response.ok) throw new Error('Failed to create post');
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
    await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  unlikePost: async (token, postId) => {
    await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  savePost: async (token, postId) => {
    await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  unsavePost: async (token, postId) => {
    await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
    await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  unfollowUser: async (token, userId) => {
    await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  // Travelers Discovery
  getTravelers: async (token, query = '') => {
    const url = query ? `${API_BASE_URL}/travelers?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/travelers`;
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
  }
};
