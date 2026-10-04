import { createMockTarget } from './mock-target-app.js';
const port = Number(process.env.MOCK_TARGET_PORT || 3001);
createMockTarget().listen(port, () => console.info(`Mock target listening on ${port}`));
