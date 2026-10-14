import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { ImageFile } from '../models/ImageFile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, '../../uploads');

if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function fileFilter(_req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
}

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 5 },
});

export async function persistUploads(files = []) {
  const paths = [];
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase() || '.img';
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    await ImageFile.create({
      filename,
      mime: file.mimetype || 'application/octet-stream',
      data: file.buffer,
    });
    paths.push(`/uploads/${filename}`);
  }
  return paths;
}
