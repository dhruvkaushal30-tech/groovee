import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/db');
fs.mkdirSync(dataDir, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: {
    port: 27017,
    dbName: 'veld',
    dbPath: dataDir,
    storageEngine: 'wiredTiger',
    launchTimeout: 60000,
  },
});

console.log(`Local MongoDB ready at ${mongod.getUri()}`);
console.log('In Compass, connect to mongodb://127.0.0.1:27017 and open the veld database.');

process.on('SIGINT', async () => {
  await mongod.stop();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await mongod.stop();
  process.exit(0);
});
