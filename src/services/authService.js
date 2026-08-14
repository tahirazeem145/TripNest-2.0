/**
 * Authentication Service (Temporary Mock Adapter)
 * 
 * This is a temporary adapter for Phase 1. In Phase 2, this implementation
 * will be replaced with actual REST API calls (e.g. POST /api/auth/login)
 * connecting to the Spring Boot backend.
 */
export const authService = {
  /**
   * Mock login request.
   * Simulates network latency and returns a promise.
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{ success: boolean, message: string, user?: object }>}
   */
  login: async (email, password) => {
    return new Promise((resolve) => {
      // Simulate network latency of 1.2 seconds
      setTimeout(() => {
        console.log("[Mock AuthService] Received login request for:", email);
        
        // For testing invalid credentials in Phase 1
        if (email.toLowerCase() === "invalid@tripnest.com" || password === "wrongpass") {
          resolve({
            success: false,
            message: "Invalid email or password. Please try again."
          });
        } else {
          resolve({
            success: true,
            message: "Simulated success (Mock adapter). Authenticated via mock provider.",
            user: {
              email,
              name: email.split('@')[0],
              role: "Explorer"
            }
          });
        }
      }, 1200);
    });
  }
};
