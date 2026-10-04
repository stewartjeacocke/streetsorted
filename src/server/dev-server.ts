import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logEvent } from './middleware/logger.js';
import { resolve } from 'node:path';

const config = loadConfig();
const staticDirectory = resolve('src/server/public');
const server = createApp(config, { staticDirectory }).listen(config.PORT, () =>
  logEvent('server_started', { port: config.PORT }),
);

function stop() {
  server.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
