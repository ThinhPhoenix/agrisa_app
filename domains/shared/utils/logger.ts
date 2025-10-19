/**
 * Logger Utility với timestamp và color coding
 * Hỗ trợ các log levels: debug, info, warn, error, success
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "success";

interface LogContext {
  module?: string;
  action?: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private enabledInProduction = false;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Format timestamp cho log
   */
  private getTimestamp(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  /**
   * Format log message với timestamp và emoji
   */
  private formatMessage(
    level: LogLevel,
    module: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = this.getTimestamp();
    const emoji = this.getEmoji(level);

    let formattedMessage = `${emoji} [${timestamp}] [${module}] ${message}`;

    if (context?.action) {
      formattedMessage += ` | Action: ${context.action}`;
    }

    return formattedMessage;
  }

  /**
   * Get emoji cho từng log level
   */
  private getEmoji(level: LogLevel): string {
    const emojiMap: Record<LogLevel, string> = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
      success: "✅",
    };
    return emojiMap[level];
  }

  /**
   * Check nếu nên log (chỉ log trong development mode)
   */
  private shouldLog(): boolean {
    return __DEV__ || this.enabledInProduction;
  }

  /**
   * Debug log - Chi tiết kỹ thuật
   */
  debug(module: string, message: string, context?: LogContext) {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage(
      "debug",
      module,
      message,
      context
    );
    console.debug(formattedMessage);

    if (context?.data) {
      console.debug("  ↳ Data:", context.data);
    }
  }

  /**
   * Info log - Thông tin chung
   */
  info(module: string, message: string, context?: LogContext) {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage(
      "info",
      module,
      message,
      context
    );
    console.log(formattedMessage);

    if (context?.data) {
      console.log("  ↳ Data:", context.data);
    }
  }

  /**
   * Warn log - Cảnh báo
   */
  warn(module: string, message: string, context?: LogContext) {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage(
      "warn",
      module,
      message,
      context
    );
    console.warn(formattedMessage);

    if (context?.data) {
      console.warn("  ↳ Data:", context.data);
    }
  }

  /**
   * Error log - Lỗi
   */
  error(module: string, message: string, context?: LogContext) {
    // Luôn log error (kể cả production)
    const formattedMessage = this.formatMessage(
      "error",
      module,
      message,
      context
    );
    console.error(formattedMessage);

    if (context?.data) {
      console.error("  ↳ Error Details:", context.data);
    }
  }

  /**
   * Success log - Thành công
   */
  success(module: string, message: string, context?: LogContext) {
    if (!this.shouldLog()) return;

    const formattedMessage = this.formatMessage(
      "success",
      module,
      message,
      context
    );
    console.log(formattedMessage);

    if (context?.data) {
      console.log("  ↳ Data:", context.data);
    }
  }

  /**
   * Auth-specific logs
   */
  auth = {
    login: (message: string, data?: any) => {
      this.info("Auth", message, { action: "LOGIN", data });
    },
    logout: (message: string, data?: any) => {
      this.info("Auth", message, { action: "LOGOUT", data });
    },
    tokenCheck: (message: string, data?: any) => {
      this.debug("Auth", message, { action: "TOKEN_CHECK", data });
    },
    tokenExpired: (message: string, data?: any) => {
      this.warn("Auth", message, { action: "TOKEN_EXPIRED", data });
    },
    authError: (message: string, error?: any) => {
      this.error("Auth", message, { action: "AUTH_ERROR", data: error });
    },
    authSuccess: (message: string, data?: any) => {
      this.success("Auth", message, { action: "AUTH_SUCCESS", data });
    },
  };

  /**
   * Network-specific logs
   */
  network = {
    request: (url: string, method: string, hasAuth: boolean) => {
      this.debug("Network", `${method.toUpperCase()} ${url}`, {
        action: "REQUEST",
        data: { hasAuth },
      });
    },
    response: (url: string, status: number, duration?: number) => {
      this.success("Network", `Response from ${url}`, {
        action: "RESPONSE",
        data: { status, duration: duration ? `${duration}ms` : "N/A" },
      });
    },
    error: (url: string, error: any) => {
      this.error("Network", `Failed to fetch ${url}`, {
        action: "NETWORK_ERROR",
        data: error,
      });
    },
  };
}

// Export singleton instance
export const logger = Logger.getInstance();
