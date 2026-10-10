import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { redact, requestLogger } from '../../../src/server/middleware/logger.js';

describe('redact', () => {
  it('removes report content, coordinates, cookies, and tokens', () => {
    assert.deepEqual(
      redact({
        description: 'private waste details',
        latitude: 51.5,
        longitude: -0.1,
        cookie: 'secret',
        token: 'secret',
        csrf: 'secret',
        sessionId: 'secret',
        status: 200,
      }),
      {
        description: '[REDACTED]',
        latitude: '[REDACTED]',
        longitude: '[REDACTED]',
        cookie: '[REDACTED]',
        token: '[REDACTED]',
        csrf: '[REDACTED]',
        sessionId: '[REDACTED]',
        status: 200,
      },
    );
  });

  it('removes API keys, secrets, passwords, credentials, and signatures', () => {
    assert.deepEqual(
      redact({
        'x-api-key': 'secret',
        clientSecret: 'secret',
        password: 'secret',
        credential: 'secret',
        signature: 'secret',
      }),
      {
        'x-api-key': '[REDACTED]',
        clientSecret: '[REDACTED]',
        password: '[REDACTED]',
        credential: '[REDACTED]',
        signature: '[REDACTED]',
      },
    );
  });
});

describe('requestLogger', () => {
  it('logs all request headers while redacting secret-bearing values', () => {
    let onFinish: (() => void) | undefined;
    const request = {
      method: 'POST',
      path: '/api/reports',
      headers: {
        accept: 'application/json',
        'user-agent': 'test-client',
        authorization: 'Bearer secret',
        cookie: 'session=secret',
        'x-api-key': 'secret',
      },
    };
    const response = {
      statusCode: 201,
      on(event: string, listener: () => void) {
        if (event === 'finish') onFinish = listener;
        return this;
      },
    };
    const originalInfo = console.info;
    const messages: string[] = [];
    console.info = (message: string) => messages.push(message);
    try {
      requestLogger(request as never, response as never, () => undefined);
      assert.ok(onFinish, 'expected a finish listener');
      onFinish();
    } finally {
      console.info = originalInfo;
    }

    assert.equal(messages.length, 1);
    const { durationMs, ...event } = JSON.parse(messages[0]);
    assert.deepEqual(event, {
      event: 'request_complete',
      method: 'POST',
      path: '/api/reports',
      headers: {
        accept: 'application/json',
        'user-agent': 'test-client',
        authorization: '[REDACTED]',
        cookie: '[REDACTED]',
        'x-api-key': '[REDACTED]',
      },
      status: 201,
    });
    assert.equal(typeof durationMs, 'number');
  });
});
