// src/utils/analytics.ts

/**
 * Google Analytics 4 Implementation
 * Includes development suppression and comprehensive event tracking
 */

import { 
  GA_TRACKING_ID, 
  shouldTrack, 
  isDevelopment, 
  getEnvironment,
  DEBUG_ANALYTICS,
  ANALYTICS_CONFIG 
} from '../config/analytics';

// Global types for GA4
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Analytics
 * Only loads in production, logs in development
 */
export const initializeAnalytics = (): void => {
  if (!shouldTrack()) {
    if (DEBUG_ANALYTICS) {
      console.log(`🚫 Analytics suppressed in ${getEnvironment()} environment`);
      console.log('📊 Analytics events will be logged to console instead');
    }
    return;
  }

  try {
    // Create and load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', GA_TRACKING_ID, ANALYTICS_CONFIG.config);

    console.log(`📊 Analytics initialized for ${getEnvironment()}`);
    console.log(`🎯 Tracking ID: ${GA_TRACKING_ID}`);
    
  } catch (error) {
    console.error('❌ Analytics initialization failed:', error);
  }
};

/**
 * Track page views for Single Page Application
 */
export const pageview = (url: string, title?: string): void => {
  const pageTitle = title || document.title;
  
  if (!shouldTrack()) {
    if (DEBUG_ANALYTICS) {
      console.log(`📄 [DEV] Page View:`, {
        url,
        title: pageTitle,
        environment: getEnvironment()
      });
    }
    return;
  }

  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: pageTitle,
      page_referrer: document.referrer
    });
  }
};

/**
 * Track custom events
 */
export const event = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number,
  customParameters?: Record<string, any>
): void => {
  if (!shouldTrack()) {
    if (DEBUG_ANALYTICS) {
      console.log(`🎯 [DEV] Event:`, {
        action,
        category,
        label,
        value,
        customParameters,
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters
    });
  }
};

// =============================================================================
// CARDIAC SCALING SPECIFIC TRACKING FUNCTIONS
// =============================================================================

/**
 * Track navigation between tabs
 */
export const trackTabNavigation = (tab: string, previousTab?: string): void => {
  const url = `${window.location.origin}${window.location.pathname}#${tab}`;
  const title = `Cardiac Scaling Analysis - ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
  
  // Track page view
  pageview(url, title);
  
  // Track navigation event
  event('tab_change', 'navigation', tab, undefined, {
    previous_tab: previousTab,
    tab_sequence: `${previousTab || 'initial'}_to_${tab}`
  });
};

/**
 * Track measurement selection and analysis
 */
export const trackMeasurementAnalysis = (
  measurementId: string, 
  measurementName: string,
  measurementType: string,
  categoryContext?: string
): void => {
  event('measurement_selected', 'research_interaction', measurementId, undefined, {
    measurement_name: measurementName,
    measurement_type: measurementType,
    category_context: categoryContext,
    custom_parameter_1: measurementType, // Maps to measurement_type in GA4
  });
};

/**
 * Track formula selection changes
 */
export const trackFormulaSelection = (
  formulaType: 'bsa' | 'lbm', 
  formulaName: string,
  currentSelection: {
    bsaFormula: string;
    lbmFormula: string;
    ethnicity?: string;
    age?: number;
  }
): void => {
  event('formula_change', 'methodology', `${formulaType}_${formulaName}`, undefined, {
    formula_type: formulaType,
    formula_name: formulaName,
    bsa_formula: currentSelection.bsaFormula,
    lbm_formula: currentSelection.lbmFormula,
    ethnicity: currentSelection.ethnicity,
    age: currentSelection.age
  });
};

/**
 * Track scaling approach toggles
 */
export const trackScalingToggle = (
  configId: string, 
  configName: string,
  sex: 'male' | 'female', 
  enabled: boolean,
  measurementContext?: string
): void => {
  event('scaling_toggle', 'visualization', `${configId}_${sex}`, enabled ? 1 : 0, {
    config_id: configId,
    config_name: configName,
    sex: sex,
    enabled: enabled,
    measurement_context: measurementContext,
    custom_parameter_2: configId, // Maps to scaling_method in GA4
  });
};

/**
 * Track data exports
 */
export const trackDataExport = (
  exportType: 'csv' | 'clipboard',
  dataType: 'coefficients' | 'population' | 'chart',
  measurementId: string,
  measurementType: string
): void => {
  event('data_export', 'research_output', `${exportType}_${dataType}`, undefined, {
    export_type: exportType,
    data_type: dataType,
    measurement_id: measurementId,
    measurement_type: measurementType,
    export_timestamp: new Date().toISOString()
  });
};

/**
 * Track advanced controls usage
 */
export const trackAdvancedControls = (
  action: 'formula_panel_open' | 'formula_panel_close' | 'data_panel_open' | 'data_panel_close',
  context?: string
): void => {
  event('advanced_controls', 'interface_interaction', action, undefined, {
    action: action,
    context: context
  });
};

/**
 * Track research workflow patterns
 */
export const trackResearchWorkflow = (
  workflowStep: 'measurement_compare' | 'formula_adjust' | 'data_export' | 'method_switch',
  sequence: string[],
  sessionDuration?: number
): void => {
  event('research_workflow', 'academic_usage', workflowStep, sessionDuration, {
    workflow_step: workflowStep,
    sequence: sequence.join(' -> '),
    step_count: sequence.length
  });
};

/**
 * Track performance metrics
 */
export const trackPerformance = (
  metric: 'load_time' | 'analysis_generation' | 'chart_render',
  duration: number,
  context?: string
): void => {
  event('performance', 'technical', metric, Math.round(duration), {
    metric: metric,
    duration_ms: duration,
    context: context
  });
};

/**
 * Track errors for debugging
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  component?: string,
  additionalContext?: Record<string, any>
): void => {
  event('error', 'technical', errorType, undefined, {
    error_type: errorType,
    error_message: errorMessage.substring(0, 100), // Limit length
    component: component,
    user_agent: navigator.userAgent,
    ...additionalContext
  });
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Track page load performance
 */
export const trackPageLoad = (): void => {
  if (typeof window !== 'undefined' && window.performance) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    if (loadTime > 0) {
      trackPerformance('load_time', loadTime, 'initial_page_load');
    }
  }
};

/**
 * Track session data when user leaves
 */
export const trackSessionEnd = (): void => {
  const sessionDuration = Date.now() - (window.performance?.timing?.navigationStart || Date.now());
  
  event('session_end', 'engagement', 'session_complete', Math.round(sessionDuration / 1000), {
    session_duration_ms: sessionDuration,
    pages_viewed: window.history.length
  });
};

/**
 * Initialize session tracking
 */
export const initializeSessionTracking = (): void => {
  // Track when user leaves the page
  window.addEventListener('beforeunload', trackSessionEnd);
  
  // Track initial page load performance
  if (document.readyState === 'complete') {
    trackPageLoad();
  } else {
    window.addEventListener('load', trackPageLoad);
  }
};

/**
 * Get analytics debug info
 */
export const getAnalyticsDebugInfo = () => {
  return {
    environment: getEnvironment(),
    shouldTrack: shouldTrack(),
    trackingId: GA_TRACKING_ID,
    debug: DEBUG_ANALYTICS,
    isInitialized: typeof window !== 'undefined' && !!window.gtag
  };
};

// Export everything for easy imports
export default {
  initializeAnalytics,
  pageview,
  event,
  trackTabNavigation,
  trackMeasurementAnalysis,
  trackFormulaSelection,
  trackScalingToggle,
  trackDataExport,
  trackAdvancedControls,
  trackResearchWorkflow,
  trackPerformance,
  trackError,
  initializeSessionTracking,
  getAnalyticsDebugInfo
};