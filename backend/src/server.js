import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const port = process.env.PORT || 5000;

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
