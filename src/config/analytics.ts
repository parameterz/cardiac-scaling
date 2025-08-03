// src/config/analytics.ts

/**
 * Google Analytics 4 Configuration
 * Handles environment detection and analytics initialization
 */

// Replace with your actual GA4 Measurement ID
export const GA_TRACKING_ID = 'G-RC6NCKTYDP'; // Get this from Google Analytics

/**
 * Detect if we're in development environment
 */
export const isDevelopment = (): boolean => {
  // Multiple checks to ensure we catch all development scenarios
  return (
    import.meta.env.DEV || // Vite development mode
    import.meta.env.MODE === 'development' || // Explicit development mode
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('local') ||
    window.location.port !== '' || // Any site with port (like :5173)
    window.location.hostname.includes('192.168.') || // Local network
    window.location.hostname.includes('10.0.') // Local network
  );
};

/**
 * Detect if we're on GitHub Pages production
 */
export const isGitHubPages = (): boolean => {
  return window.location.hostname.includes('github.io');
};

/**
 * Detect if we're on a custom domain
 */
export const isCustomDomain = (): boolean => {
  return !isDevelopment() && !isGitHubPages();
};

/**
 * Should we track analytics events?
 */
export const shouldTrack = (): boolean => {
  return !isDevelopment() && typeof window !== 'undefined';
};

/**
 * Get environment string for logging
 */
export const getEnvironment = (): string => {
  if (isDevelopment()) return 'development';
  if (isGitHubPages()) return 'github-pages';
  if (isCustomDomain()) return 'custom-domain';
  return 'unknown';
};

/**
 * Debug configuration (only in development)
 */
export const DEBUG_ANALYTICS = isDevelopment();

/**
 * Analytics configuration object
 */
export const ANALYTICS_CONFIG = {
  trackingId: GA_TRACKING_ID,
  shouldTrack: shouldTrack(),
  environment: getEnvironment(),
  debug: DEBUG_ANALYTICS,
  
  // GA4 Configuration options
  config: {
    send_page_view: false, // We'll send manually for SPA
    anonymize_ip: true, // Privacy-friendly
    allow_google_signals: false, // Disable advertising features for academic use
    custom_map: {
      'measurement_type': 'custom_parameter_1',
      'scaling_method': 'custom_parameter_2',
    }
  }
} as const;