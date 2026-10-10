import type { Server } from 'node:http';
import { logEvent } from './middleware/logger.js';

export const shutdownTimeoutMs = 30_000;

type ShutdownTimer = ReturnType<NonNullable<ShutdownDependencies['schedule']>>;

type ShutdownDependencies = {
  cancel?: (timeout: ShutdownTimer) => void;
  exit?: (code: number) => void;
  log?: (event: string, fields?: Record<string, unknown>) => void;
  schedule?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
};

export function gracefulShutdown(server: Server, dependencies: ShutdownDependencies = {}) {
  const cancel = dependencies.cancel ?? clearTimeout;
  const exit = dependencies.exit ?? ((code) => process.exit(code));
  const log = dependencies.log ?? logEvent;
  const schedule: NonNullable<ShutdownDependencies['schedule']> =
    dependencies.schedule ?? ((callback, delay) => setTimeout(callback, delay));
  let shuttingDown = false;
  let timeout: ShutdownTimer | undefined;

  return function shutdown(signal = 'SIGTERM') {
    if (shuttingDown) return;
    shuttingDown = true;
    log('server_shutdown_started', { signal, timeoutMs: shutdownTimeoutMs });
    timeout = schedule(() => {
      log('server_shutdown_forced', { signal, timeoutMs: shutdownTimeoutMs });
      server.closeAllConnections();
      exit(1);
    }, shutdownTimeoutMs);
    server.close((error) => {
      if (timeout) cancel(timeout);
      if (error) {
        log('server_shutdown_failed', { signal, message: error.message });
        exit(1);
        return;
      }
      log('server_shutdown_complete', { signal });
      exit(0);
    });
  };
}
