// services/error.service.ts
import { Alert } from 'react-native';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface ErrorLog {
  message: string;
  severity: ErrorSeverity;
  context?: any;
  timestamp: Date;
  userId?: string;
}

export class ErrorService {
  private static logs: ErrorLog[] = [];
  private static readonly MAX_LOGS = 100;

  /**
   * Registra un error en el log interno
   */
  static log(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: any
  ): void {
    const log: ErrorLog = {
      message,
      severity,
      context,
      timestamp: new Date()
    };

    this.logs.push(log);
    
    // Mantener solo los últimos MAX_LOGS
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Log en consola
    const method = severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL
      ? console.error
      : console.warn;
    
    method(`[${severity.toUpperCase()}] ${message}`, context || '');

    // Para errores críticos, podrías enviar a un servicio de monitoreo
    if (severity === ErrorSeverity.CRITICAL) {
      this.reportToCrashlytics(log);
    }
  }

  /**
   * Muestra un error al usuario con Alert
   */
  static showUserError(message: string, title: string = 'Error'): void {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  /**
   * Muestra un mensaje de éxito al usuario
   */
  static showSuccess(message: string, title: string = 'Éxito'): void {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  /**
   * Placeholder para integración futura con servicios de crash reporting
   * (Sentry, Firebase Crashlytics, etc.)
   */
  private static async reportToCrashlytics(log: ErrorLog): Promise<void> {
    // TODO: Integrar con Sentry/Firebase Crashlytics cuando estés listo
    console.error('[CRITICAL ERROR]', log);
  }

  /**
   * Obtiene el historial de logs (útil para debugging)
   */
  static getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  static clearLogs(): void {
    this.logs = [];
  }
}