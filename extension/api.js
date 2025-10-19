// AWS Tutor API Integration
import { API_BASE, ENDPOINTS, DEFAULT_HEADERS, TIMEOUTS } from '../config/env.js';

/**
 * Make API request with error handling and timeout
 */
async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || TIMEOUTS.DEFAULT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Health check - verify API is accessible
 */
export async function pingHealth() {
  try {
    const result = await apiRequest(ENDPOINTS.HEALTH, { timeout: TIMEOUTS.HEALTH_CHECK });
    console.log('✅ API Health check successful:', result);
    return result;
  } catch (error) {
    console.error('❌ API Health check failed:', error);
    throw error;
  }
}

/**
 * Generate a plan for the given goal
 */
export async function requestPlan(goal, service = 'bedrock') {
  try {
    const result = await apiRequest(ENDPOINTS.PLAN, {
      method: 'POST',
      body: JSON.stringify({ 
        service, 
        goal 
      })
    });
    console.log('📋 Plan generated:', result);
    return result;
  } catch (error) {
    console.error('❌ Plan generation failed:', error);
    throw error;
  }
}

/**
 * Explain a UI element
 */
export async function explainElement(type, label, service = 'bedrock') {
  try {
    const result = await apiRequest(ENDPOINTS.EXPLAIN_ELEMENT, {
      method: 'POST',
      body: JSON.stringify({ 
        service, 
        element: { 
          type, 
          label 
        }
      }),
      timeout: TIMEOUTS.EXPLAIN
    });
    console.log('💡 Element explanation:', result);
    return result;
  } catch (error) {
    console.error('❌ Element explanation failed:', error);
    throw error;
  }
}

/**
 * Get help for an error
 */
export async function errorHelp(errorText, service = 'bedrock') {
  try {
    const result = await apiRequest(ENDPOINTS.ERROR_HELP, {
      method: 'POST',
      body: JSON.stringify({ 
        service, 
        error: errorText 
      })
    });
    console.log('Error help:', result);
    return result;
  } catch (error) {
    console.error('❌ Error help failed:', error);
    throw error;
  }
}

/**
 * Show explanation tooltip for hovered element
 */
export function showExplanationTooltip(element, explanation) {
  // Remove existing tooltip
  const existingTooltip = document.getElementById('aws-tutor-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  const tooltip = document.createElement('div');
  tooltip.id = 'aws-tutor-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: #1a1a1a;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 300px;
    z-index: 1000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    pointer-events: none;
  `;
  
  tooltip.innerHTML = `
    <div style="font-weight: 600; color: #4CAF50; margin-bottom: 8px;">${explanation.title}</div>
    <div style="margin-bottom: 6px;"><strong>What:</strong> ${explanation.what}</div>
    <div style="margin-bottom: 6px;"><strong>Why:</strong> ${explanation.why}</div>
    <div style="color: #ff9800;"><strong>⚠️ Watch out:</strong> ${explanation.pitfalls}</div>
  `;
  
  // Position tooltip near element
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.right + 10}px`;
  tooltip.style.top = `${rect.top}px`;
  
  document.body.appendChild(tooltip);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.remove();
    }
  }, 5000);
}

/**
 * Show error help tooltip
 */
export function showErrorTooltip(element, errorHelp) {
  // Remove existing tooltip
  const existingTooltip = document.getElementById('aws-tutor-error-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  const tooltip = document.createElement('div');
  tooltip.id = 'aws-tutor-error-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: #d32f2f;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 350px;
    z-index: 1000000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    pointer-events: none;
  `;
  
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 8px;">🚨 ${errorHelp.title}</div>
    <div style="margin-bottom: 6px;"><strong>Cause:</strong> ${errorHelp.cause}</div>
    <div style="margin-bottom: 6px;"><strong>Solution:</strong> ${errorHelp.solution}</div>
    <div style="color: #ffeb3b;"><strong>Prevention:</strong> ${errorHelp.prevention}</div>
  `;
  
  // Position tooltip near element
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 10}px`;
  
  document.body.appendChild(tooltip);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.remove();
    }
  }, 8000);
}
