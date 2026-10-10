import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Server } from 'node:http';
import { gracefulShutdown, shutdownTimeoutMs } from '../../../src/server/shutdown.js';

type CloseCallback = (error?: Error) => void;

function fakeServer() {
  let callback: CloseCallback | undefined;
  let closeCalls = 0;
  let closeAllConnectionsCalls = 0;
  return {
    server: {
      close(next: CloseCallback) {
        closeCalls += 1;
        callback = next;
        return this;
      },
      closeAllConnections() {
        closeAllConnectionsCalls += 1;
      },
    } as unknown as Server,
    close: (error?: Error) => callback?.(error),
    closeAllConnectionsCalls: () => closeAllConnectionsCalls,
    closeCalls: () => closeCalls,
  };
}

describe('gracefulShutdown', () => {
  it('drains once and exits successfully when the server closes', () => {
    const fake = fakeServer();
    const events: Array<{ event: string; fields: Record<string, unknown> }> = [];
    const exitCodes: number[] = [];
    const cancelled: unknown[] = [];
    const timer = {} as NodeJS.Timeout;
    const shutdown = gracefulShutdown(fake.server, {
      log: (event, fields = {}) => events.push({ event, fields }),
      exit: (code) => exitCodes.push(code),
      schedule: (callback, delay) => {
        assert.equal(delay, shutdownTimeoutMs);
        assert.equal(typeof callback, 'function');
        return timer;
      },
      cancel: (value) => cancelled.push(value),
    });

    shutdown();
    shutdown();
    fake.close();

    assert.equal(fake.closeCalls(), 1);
    assert.deepEqual(events, [
      { event: 'server_shutdown_started', fields: { signal: 'SIGTERM', timeoutMs: 30_000 } },
      { event: 'server_shutdown_complete', fields: { signal: 'SIGTERM' } },
    ]);
    assert.deepEqual(cancelled, [timer]);
    assert.deepEqual(exitCodes, [0]);
  });

  it('forcibly closes connections when draining exceeds the fixed timeout', () => {
    const fake = fakeServer();
    const events: Array<{ event: string; fields: Record<string, unknown> }> = [];
    const exitCodes: number[] = [];
    let forceShutdown: (() => void) | undefined;
    const shutdown = gracefulShutdown(fake.server, {
      log: (event, fields = {}) => events.push({ event, fields }),
      exit: (code) => exitCodes.push(code),
      schedule: (callback) => {
        forceShutdown = callback;
        return {} as NodeJS.Timeout;
      },
    });

    shutdown();
    assert.ok(forceShutdown, 'expected a forced-shutdown timer');
    forceShutdown();

    assert.equal(fake.closeAllConnectionsCalls(), 1);
    assert.deepEqual(events, [
      { event: 'server_shutdown_started', fields: { signal: 'SIGTERM', timeoutMs: 30_000 } },
      { event: 'server_shutdown_forced', fields: { signal: 'SIGTERM', timeoutMs: 30_000 } },
    ]);
    assert.deepEqual(exitCodes, [1]);
  });
});
