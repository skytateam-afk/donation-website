/**
 * Frontend Audit Logger
 * 
 * Logs user actions on the frontend for security auditing and analytics.
 * This complements the backend audit logging by capturing client-side events.
 * 
 * Features:
 * - Logs user actions to console and optionally to backend
 * - Captures navigation events
 * - Records form submissions
 * - Tracks button clicks and interactions
 * - Includes user context and timestamps
 * 
 * @module utils/auditLogger
 */

interface AuditLogEntry {
  timestamp: string;
  action: string;
  category: 'navigation' | 'interaction' | 'data' | 'auth' | 'error';
  details?: Record<string, any>;
  user?: string;
  path?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs: number = 1000; // Keep last 1000 logs in memory
  private enabled: boolean = true;
  private sendToBackend: boolean = false; // Set to true to send logs to backend

  /**
   * Initialize the audit logger
   * 
   * @param options - Configuration options
   */
  initialize(options?: { maxLogs?: number; sendToBackend?: boolean }) {
    if (options?.maxLogs) {
      this.maxLogs = options.maxLogs;
    }
    if (options?.sendToBackend !== undefined) {
      this.sendToBackend = options.sendToBackend;
    }

    console.log('[AuditLogger] Initialized with options:', {
      maxLogs: this.maxLogs,
      sendToBackend: this.sendToBackend,
    });
  }

  /**
   * Log a user action
   * 
   * @param action - Action description
   * @param category - Action category
   * @param details - Additional details
   */
  log(
    action: string,
    category: AuditLogEntry['category'],
    details?: Record<string, any>
  ) {
    if (!this.enabled) {
      return;
    }

    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      category,
      details: this.sanitizeDetails(details),
      user: this.getCurrentUser(),
      path: window.location.pathname,
    };

    // Add to in-memory logs
    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Audit]', entry);
    }

    // Optionally send to backend
    if (this.sendToBackend) {
      this.sendLogToBackend(entry);
    }
  }

  /**
   * Log navigation event
   * 
   * @param from - Previous route
   * @param to - New route
   */
  logNavigation(from: string, to: string) {
    this.log('Navigation', 'navigation', {
      from,
      to,
    });
  }

  /**
   * Log authentication event
   * 
   * @param event - Auth event type (login, logout, etc.)
   * @param success - Whether the event was successful
   * @param details - Additional details
   */
  logAuth(event: string, success: boolean, details?: Record<string, any>) {
    this.log(`Auth: ${event}`, 'auth', {
      success,
      ...details,
    });
  }

  /**
   * Log data operation
   * 
   * @param operation - Operation type (create, read, update, delete)
   * @param resource - Resource type (loan, transfer, etc.)
   * @param details - Additional details
   */
  logDataOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    details?: Record<string, any>
  ) {
    this.log(`${operation.toUpperCase()} ${resource}`, 'data', details);
  }

  /**
   * Log user interaction
   * 
   * @param interaction - Interaction description
   * @param details - Additional details
   */
  logInteraction(interaction: string, details?: Record<string, any>) {
    this.log(interaction, 'interaction', details);
  }

  /**
   * Log error event
   * 
   * @param error - Error message or object
   * @param details - Additional details
   */
  logError(error: string | Error, details?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.log(`Error: ${errorMessage}`, 'error', {
      ...details,
      stack: errorStack,
    });
  }

  /**
   * Get current user from localStorage or auth store
   * 
   * @returns Current username or 'anonymous'
   */
  private getCurrentUser(): string {
    try {
      // Try to get user from localStorage
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.name || 'anonymous';
      }
    } catch (error) {
      console.error('[AuditLogger] Error getting current user:', error);
    }
    return 'anonymous';
  }

  /**
   * Sanitize details to remove sensitive information
   * 
   * @param details - Details object
   * @returns Sanitized details
   */
  private sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details) {
      return undefined;
    }

    const sanitized = { ...details };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***MASKED***';
      }
    }

    return sanitized;
  }

  /**
   * Send log entry to backend
   * 
   * @param entry - Log entry to send
   */
  private async sendLogToBackend(entry: AuditLogEntry) {
    try {
      // This is a placeholder - implement actual backend endpoint
      // await fetch('/api/audit-logs', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${getToken()}`,
      //   },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      console.error('[AuditLogger] Error sending log to backend:', error);
    }
  }

  /**
   * Get all logs
   * 
   * @returns Array of log entries
   */
  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by category
   * 
   * @param category - Category to filter by
   * @returns Filtered log entries
   */
  getLogsByCategory(category: AuditLogEntry['category']): AuditLogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    console.log('[AuditLogger] Logs cleared');
  }

  /**
   * Export logs as JSON
   * 
   * @returns JSON string of logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as a file
   */
  downloadLogs() {
    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Enable audit logging
   */
  enable() {
    this.enabled = true;
    console.log('[AuditLogger] Enabled');
  }

  /**
   * Disable audit logging
   */
  disable() {
    this.enabled = false;
    console.log('[AuditLogger] Disabled');
  }

  /**
   * Check if audit logging is enabled
   * 
   * @returns True if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Export type for external use
export type { AuditLogEntry };
