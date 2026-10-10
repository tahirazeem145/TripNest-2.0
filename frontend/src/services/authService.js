import config from '../config/env';

const API_BASE_URL = config.apiBaseUrl;
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Enhanced fetch with timeout, offline detection, and safe error handling
 */
async function apiFetch(url, options = {}) {
  // Check browser offline status
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('You are currently offline. Please check your internet connection.');
    error.code = 'NETWORK_OFFLINE';
    throw error;
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
      const timeoutError = new Error('Server request timed out after 15 seconds. Please try again.');
      timeoutError.code = 'REQUEST_TIMEOUT';
      throw timeoutError;
    }
    const networkError = new Error('Unable to connect to the server. Please verify your internet connection or server availability.');
    networkError.code = 'NETWORK_ERROR';
    throw networkError;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Safely parse JSON or text from response
 */
async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  } catch {
    return {};
  }
}

/**
 * Classify and format authentication errors for edge cases
 */
function createAuthError(data, status) {
  let message = '';
  let field = null;
  let code = 'AUTH_ERROR';

  const rawMessage = (
    data.message ||
    data.error_description ||
    data.error ||
    data.msg ||
    (data.errors ? Object.values(data.errors).join(', ') : '') ||
    ''
  ).trim();

  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password') ||
    lower.includes('invalid_grant') ||
    lower.includes('invalid password') ||
    lower.includes('wrong password') ||
    lower.includes('incorrect password') ||
    (status === 401 && !lower.includes('expired') && !lower.includes('token'))
  ) {
    message = 'Invalid email or password. Please verify your credentials and try again.';
    field = 'password';
    code = 'INVALID_CREDENTIALS';
  } else if (lower.includes('user not found') || lower.includes('no account found') || lower.includes('user_not_found')) {
    message = 'No account found with this email address. Please check your email or sign up.';
    field = 'email';
    code = 'USER_NOT_FOUND';
  } else if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed') || lower.includes('unverified')) {
    message = 'Your email address has not been confirmed yet. Please check your inbox for the confirmation link.';
    field = 'email';
    code = 'EMAIL_NOT_CONFIRMED';
  } else if (
    lower.includes('already exists') ||
    lower.includes('already registered') ||
    lower.includes('email in use') ||
    status === 409
  ) {
    message = 'An account with this email already exists. Please sign in instead.';
    field = 'email';
    code = 'USER_ALREADY_EXISTS';
  } else if (status === 429 || lower.includes('too many requests') || lower.includes('rate limit') || lower.includes('over_request_rate_limit')) {
    message = 'Too many attempts. For security reasons, please wait a few moments before trying again.';
    code = 'RATE_LIMITED';
  } else if (status >= 500) {
    message = 'The server encountered an issue. Please try again shortly.';
    code = 'SERVER_ERROR';
  } else if (rawMessage) {
    message = rawMessage;
  } else {
    message = status === 401 ? 'Authentication failed. Please check your credentials.' : 'Operation failed. Please try again.';
  }

  const err = new Error(message);
  err.field = field;
  err.code = code;
  err.status = status;
  err.errors = data.errors || null;
  return err;
}

export const authService = {
  /**
   * Register a new user via Spring Boot endpoint
   */
  signup: async (fullName, email, password) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });

    const data = await parseResponseBody(response);
    if (!response.ok || (data && data.success === false)) {
      throw createAuthError(data, response.status);
    }
    return data;
  },

  /**
   * Authenticate user via Spring Boot endpoint
   */
  login: async (email, password) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await parseResponseBody(response);
    if (!response.ok || (data && data.success === false)) {
      throw createAuthError(data, response.status);
    }
    return data;
  },

  /**
   * Retrieve currently authenticated user info
   */
  getCurrentUser: async (token) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await parseResponseBody(response);
    if (!response.ok) {
      const err = new Error(data.message || 'Failed to retrieve user profile');
      err.status = response.status;
      throw err;
    }
    return data;
  }
};

export default authService;
