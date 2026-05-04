/**
 * Conditional logger that provides full output in development
 * and error-level output in production for observability.
 * Use this instead of console.log/error directly.
 */

type LogArgs = unknown[]

export const logger = {
  /**
   * Logs to console in development mode only.
   */
  log: (...args: LogArgs) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },

  /**
   * Logs errors to console in all environments.
   * In production, errors are logged for cloud platform observability.
   */
  error: (...args: LogArgs) => {
    console.error(...args)
  },

  /**
   * Logs warnings to console in development mode only.
   */
  warn: (...args: LogArgs) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },

  /**
   * Logs info to console in development mode only.
   */
  info: (...args: LogArgs) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  },
}
