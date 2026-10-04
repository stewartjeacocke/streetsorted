import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logEvent } from './middleware/logger.js';

const config = loadConfig();
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const clientDirectory = resolve(currentDirectory, '../client');
createApp(config, { clientDirectory }).listen(config.PORT, () =>
  logEvent('server_started', { port: config.PORT }),
);
