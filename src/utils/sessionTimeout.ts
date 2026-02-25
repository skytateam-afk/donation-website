/**
 * Session Timeout Utility
 * 
 * Manages automatic session timeout for inactive users.
 * After 5 minutes of inactivity, the user's session will expire
 * and they will be automatically logged out.
 * 
 * Features:
 * - Tracks user activity (mouse, keyboard, touch events)
 * - Warns user before timeout
 * - Automatically logs out on timeout
 * - Configurable timeout duration
 * - Activity event listeners
 * 
 * @module utils/sessionTimeout
 */

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Session timeout duration in milliseconds (5 minutes)
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Warning time before timeout (1 minute before)
const WARNING_TIME = 4 * 60 * 1000; // 4 minutes

// Activity events to monitor
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];

class SessionTimeoutManager {
  private timeoutId: number | null = null;
  private warningTimeoutId: number | null = null;
  private router: any = null;
  private authStore: any = null;
  private isActive: boolean = false;
  private onWarningCallback: (() => void) | null = null;
  private onTimeoutCallback: (() => void) | null = null;

  /**
   * Initialize the session timeout manager
   * 
   * @param router - Vue Router instance
   * @param authStore - Auth store instance
   */
  initialize(router: any, authStore: any) {
    this.router = router;
    this.authStore = authStore;
  }

  /**
   * Start monitoring user activity and session timeout
   */
  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.resetTimer();
    this.attachEventListeners();

    console.log('[SessionTimeout] Session timeout monitoring started (5 minutes)');
  }

  /**
   * Stop monitoring user activity
   */
  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.clearTimers();
    this.detachEventListeners();

    console.log('[SessionTimeout] Session timeout monitoring stopped');
  }

  /**
   * Reset the inactivity timer
   * Called whenever user activity is detected
   */
  private resetTimer() {
    this.clearTimers();

    // Set warning timer (1 minute before timeout)
    this.warningTimeoutId = window.setTimeout(() => {
      this.handleWarning();
    }, WARNING_TIME);

    // Set timeout timer (5 minutes)
    this.timeoutId = window.setTimeout(() => {
      this.handleTimeout();
    }, SESSION_TIMEOUT);
  }

  /**
   * Clear all active timers
   */
  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  /**
   * Handle activity event
   * Resets the timer when user activity is detected
   */
  private handleActivity = () => {
    if (this.isActive) {
      this.resetTimer();
    }
  };

  /**
   * Attach event listeners for user activity
   */
  private attachEventListeners() {
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, this.handleActivity, true);
    });
  }

  /**
   * Detach event listeners
   */
  private detachEventListeners() {
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, this.handleActivity, true);
    });
  }

  /**
   * Handle warning before timeout
   * Shows a warning to the user that their session is about to expire
   */
  private handleWarning() {
    console.warn('[SessionTimeout] Session will expire in 1 minute due to inactivity');

    // Call warning callback if provided
    if (this.onWarningCallback) {
      this.onWarningCallback();
    }

    // You can show a toast notification here
    // Example: toast.warning('Your session will expire in 1 minute due to inactivity');
  }

  /**
   * Handle session timeout
   * Logs out the user and redirects to login page
   */
  private handleTimeout() {
    console.warn('[SessionTimeout] Session expired due to inactivity');

    // Call timeout callback if provided
    if (this.onTimeoutCallback) {
      this.onTimeoutCallback();
    }

    // Stop monitoring
    this.stop();

    // Log out the user
    if (this.authStore) {
      this.authStore.logout();
    }

    // Redirect to login page
    if (this.router) {
      this.router.push({
        name: 'login',
        query: { reason: 'session_timeout' },
      });
    }

    // You can show a toast notification here
    // Example: toast.error('Your session has expired due to inactivity. Please log in again.');
  }

  /**
   * Set callback for warning event
   * 
   * @param callback - Function to call when warning is triggered
   */
  onWarning(callback: () => void) {
    this.onWarningCallback = callback;
  }

  /**
   * Set callback for timeout event
   * 
   * @param callback - Function to call when timeout occurs
   */
  onTimeout(callback: () => void) {
    this.onTimeoutCallback = callback;
  }

  /**
   * Get remaining time until timeout
   * 
   * @returns Remaining time in milliseconds
   */
  getRemainingTime(): number {
    // This is a simplified version
    // In a real implementation, you'd track the actual remaining time
    return SESSION_TIMEOUT;
  }

  /**
   * Check if session timeout is active
   * 
   * @returns True if monitoring is active
   */
  isMonitoring(): boolean {
    return this.isActive;
  }
}

// Export singleton instance
export const sessionTimeout = new SessionTimeoutManager();

// Export constants for external use
export { SESSION_TIMEOUT, WARNING_TIME };
