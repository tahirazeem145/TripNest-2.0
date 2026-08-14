/**
 * Journey API Service
 * 
 * Interacts with Spring Boot backend endpoints (/api/journeys/*).
 * All requests pass the authenticated Supabase access token in the Authorization header.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const journeyService = {
  /**
   * Create a new journey for the authenticated user
   */
  createJourney: async (token, journeyData) => {
    const response = await fetch(`${API_BASE_URL}/journeys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(journeyData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create journey.');
    }
    return data;
  },

  /**
   * Fetch journeys belonging to the authenticated user
   */
  getMyJourneys: async (token) => {
    const response = await fetch(`${API_BASE_URL}/journeys/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve your journeys.');
    }
    return data;
  },

  /**
   * Fetch a single journey by ID
   */
  getJourney: async (token, id) => {
    const response = await fetch(`${API_BASE_URL}/journeys/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to retrieve journey details.');
    }
    return data;
  }
};
