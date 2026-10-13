import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Groove API listening on ${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start API', err);
      process.exit(1);
    });
}

export default app;
