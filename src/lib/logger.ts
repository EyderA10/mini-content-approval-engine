/**
 * Conditional logger that only outputs in development mode.
 * Use this instead of console.log/error to avoid leaking information in production.
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
   * Logs errors to console in development mode only.
   */
  error: (...args: LogArgs) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
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
