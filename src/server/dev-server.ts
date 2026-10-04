import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { copyStaticAssets, staticDirectory } from './dev/static-assets.js';
import { logEvent } from './middleware/logger.js';

const config = loadConfig();
await copyStaticAssets();
const server = createApp(config, { staticDirectory }).listen(config.PORT, () =>
  logEvent('server_started', { port: config.PORT }),
);

function stop() {
  server.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
