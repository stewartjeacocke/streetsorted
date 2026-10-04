import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { clientDirectory, watchClient } from './dev/client-build.js';
import { logEvent } from './middleware/logger.js';

const config = loadConfig();
const clientBuild = await watchClient();
const server = createApp(config, { clientDirectory }).listen(config.PORT, () =>
  logEvent('server_started', { port: config.PORT }),
);

async function stop() {
  await clientBuild.dispose();
  server.close();
}

process.once('SIGINT', () => void stop());
process.once('SIGTERM', () => void stop());
