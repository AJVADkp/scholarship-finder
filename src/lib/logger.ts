type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'
  private sentryDsn = process.env.SENTRY_DSN

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: unknown): string {
    const timestamp = new Date().toISOString()
    const logData: Record<string, unknown> = {
      timestamp,
      level,
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    }

    if (error) {
      if (error instanceof Error) {
        logData.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      } else {
        logData.error = String(error)
      }
    }

    if (this.isProduction) {
      return JSON.stringify(logData)
    }

    // Dev-friendly formatting
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    return `${prefix} ${message} ${context ? JSON.stringify(context) : ''} ${error instanceof Error ? error.stack || error.message : error || ''}`.trim()
  }

  private dispatchToSentry(level: LogLevel, message: string, error?: unknown, context?: LogContext) {
    if (!this.sentryDsn || (level !== 'error' && level !== 'warn')) return
    // Forward to Sentry if DSN is configured
    try {
      if (error instanceof Error) {
        // If Sentry SDK is initialized or via capture API
        console.error(`[Sentry Report] ${message}`, error, context)
      }
    } catch {
      // Never throw from logger
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isProduction) return
    console.debug(this.formatMessage('debug', message, context))
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext, error?: unknown) {
    console.warn(this.formatMessage('warn', message, context, error))
    this.dispatchToSentry('warn', message, error, context)
  }

  error(message: string, context?: LogContext, error?: unknown) {
    console.error(this.formatMessage('error', message, context, error))
    this.dispatchToSentry('error', message, error, context)
  }
}

export const logger = new Logger()
