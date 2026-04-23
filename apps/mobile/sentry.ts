import * as Sentry from '@sentry/react-native';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn || dsn.trim().length === 0) {
    return;
  }

  Sentry.init({
    dsn,
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
    environment: __DEV__ ? 'development' : 'production',
    release: Application.nativeApplicationVersion ?? 'mobile-unknown',
  });

  initialized = true;
}

export function captureAppError(
  error: unknown,
  context: {
    screen?: string;
    userId?: string;
    isFatal?: boolean;
  },
): void {
  if (!initialized) return;

  Sentry.withScope((scope) => {
    scope.setTag('platform', Platform.OS);
    scope.setTag('fatal', context.isFatal ? 'true' : 'false');
    if (context.screen) scope.setTag('screen', context.screen);
    if (context.userId) scope.setUser({ id: context.userId });
    scope.setLevel(context.isFatal ? 'fatal' : 'error');

    if (error instanceof Error) {
      Sentry.captureException(error);
      return;
    }

    Sentry.captureMessage(typeof error === 'string' ? error : 'Unknown app error');
  });
}
