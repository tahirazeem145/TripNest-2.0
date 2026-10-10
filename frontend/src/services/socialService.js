import config from '../config/env';

const API_BASE_URL = config.apiBaseUrl;
const REQUEST_TIMEOUT_MS = 15000;

async function socialFetch(url, options = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const err = new Error('You are offline. Please check your internet connection.');
    err.code = 'NETWORK_OFFLINE';
    throw err;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.code = 'REQUEST_TIMEOUT';
      throw timeoutError;
    }
    const networkError = new Error('Network error. Unable to connect to server.');
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function safeJson(response, fallbackMsg = 'Request failed') {
  const contentType = response.headers.get('content-type') || '';
  let data = null;
  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || fallbackMsg };
      }
    }
  } catch {
    data = { message: fallbackMsg };
  }

  if (!response.ok) {
    const msg = (data && (data.message || data.error_description || data.error)) || fallbackMsg;
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const socialService = {
  // Real Media Upload
  uploadMedia: async (token, file, type = 'post') => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await socialFetch(`${API_BASE_URL}/media/upload?type=${encodeURIComponent(type)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return await safeJson(response, 'Unable to upload image. Please check format and size.');
  },

  // Feeds with Pagination
  getHomeFeed: async (token, limit = 10, offset = 0) => {
    const response = await socialFetch(`${API_BASE_URL}/feed/home?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch home feed');
  },

  getFollowingFeed: async (token, limit = 10, offset = 0) => {
    const response = await socialFetch(`${API_BASE_URL}/feed/following?limit=${limit}&offset=${offset}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch following feed');
  },

  getSavedPosts: async (token) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/saved`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch saved posts');
  },

  getUserPosts: async (token, userId) => {
    const response = await socialFetch(`${API_BASE_URL}/users/${userId}/posts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch user posts');
  },

  getPostById: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch post');
  },

  // Post Actions
  createPost: async (token, postData) => {
    const response = await socialFetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });
    return await safeJson(response, 'Failed to publish travel moment');
  },

  deletePost: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to delete post');
  },

  likePost: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to like post');
  },

  unlikePost: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to unlike post');
  },

  savePost: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to save post');
  },

  unsavePost: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/save`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to unsave post');
  },

  // Comments
  addComment: async (token, postId, content, parentId = null) => {
    const payload = { content };
    if (parentId) payload.parent_id = parentId;
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await safeJson(response, 'Failed to add comment');
  },

  deleteComment: async (token, commentId) => {
    const response = await socialFetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to delete comment');
  },

  editComment: async (token, commentId, content) => {
    const response = await socialFetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    return await safeJson(response, 'Failed to edit comment');
  },

  getComments: async (token, postId) => {
    const response = await socialFetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch comments');
  },

  // Follows
  followUser: async (token, userId) => {
    const response = await socialFetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to follow user');
  },

  unfollowUser: async (token, userId) => {
    const response = await socialFetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to unfollow user');
  },

  // Travelers Discovery
  getTravelers: async (token, query = '') => {
    const url = query ? `${API_BASE_URL}/travelers?search=${encodeURIComponent(query)}` : `${API_BASE_URL}/travelers`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch travelers');
  },

  // Notifications
  getNotifications: async (token) => {
    const response = await socialFetch(`${API_BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch notifications');
  },

  markNotificationsRead: async (token) => {
    const response = await socialFetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to mark notifications read');
  },

  // Profile
  getProfile: async (token, userId = 'me') => {
    const response = await socialFetch(`${API_BASE_URL}/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch profile');
  },

  updateProfile: async (token, profileData) => {
    const response = await socialFetch(`${API_BASE_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    return await safeJson(response, 'Failed to update profile');
  },

  // Phase 7 Discovery & Global Search
  searchGlobal: async (token, query, type = 'all', limit = 10, offset = 0) => {
    const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}&limit=${limit}&offset=${offset}`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Search failed');
  },

  getPostsByDestination: async (token, destination, limit = 20, offset = 0) => {
    const url = `${API_BASE_URL}/explore/destinations/${encodeURIComponent(destination)}/posts?limit=${limit}&offset=${offset}`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch destination posts');
  },

  getTrendingPosts: async (token, limit = 20, offset = 0) => {
    const url = `${API_BASE_URL}/explore/trending?limit=${limit}&offset=${offset}`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch trending posts');
  },

  getTrendingDestinations: async (token, limit = 10) => {
    const url = `${API_BASE_URL}/explore/trending-destinations?limit=${limit}`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch trending destinations');
  },

  getSuggestedTravelers: async (token, limit = 5) => {
    const url = `${API_BASE_URL}/travelers/suggested?limit=${limit}`;
    const response = await socialFetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await safeJson(response, 'Failed to fetch suggested travelers');
  }
};

export default socialService;
