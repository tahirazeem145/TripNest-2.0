import config from '../config/env';

const API_BASE_URL = config.apiBaseUrl;

export const authService = {
  /**
   * Register a new user via Spring Boot endpoint
   */
  signup: async (fullName, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || (data.errors ? Object.values(data.errors).join(', ') : 'Registration failed'));
    }
    return data;
  },

  /**
   * Authenticate user via Spring Boot endpoint
   */
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password');
    }
    return data;
  },

  /**
   * Retrieve currently authenticated user info
   */
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve user profile');
    }
    return await response.json();
  }
};
