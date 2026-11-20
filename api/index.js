import { createApp } from '../server/app.js';

const dbPath = process.env.DB_PATH || (process.env.VERCEL ? '/tmp/flippy.db' : './data/flippy.db');
const { app } = createApp({ dbPath });

export default app;
