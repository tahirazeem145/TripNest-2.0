/**
 * Application Environment Configuration
 * Centralized, validated environment variable accessor.
 */

const getEnvVariable = (key, defaultValue = '') => {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
};

export const config = {
  apiBaseUrl: getEnvVariable('VITE_API_BASE_URL', 'http://localhost:8080/api'),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  mode: import.meta.env.MODE,
};

export default config;
