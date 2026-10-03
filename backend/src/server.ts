import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logEvent } from './middleware/logger.js';

const config = loadConfig();
createApp(config).listen(config.PORT, () => logEvent('server_started', { port: config.PORT }));
