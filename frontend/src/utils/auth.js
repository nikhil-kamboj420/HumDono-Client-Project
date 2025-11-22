// frontend/src/utils/auth.js

/**
 * Logout utility - clears all auth data and redirects to login
 */
export const logout = () => {
  try {
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect anyway
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    return !!token;
  } catch {
    return false;
  }
};

/**
 * Get current auth token
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};
