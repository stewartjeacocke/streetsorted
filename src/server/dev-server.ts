import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { copyServerAssets, serverPublicDirectory } from './dev/server-assets.js';
import { logEvent } from './middleware/logger.js';

const config = loadConfig();
await copyServerAssets();
const server = createApp(config, { staticDirectory: serverPublicDirectory }).listen(
  config.PORT,
  () => logEvent('server_started', { port: config.PORT }),
);

function stop() {
  server.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
