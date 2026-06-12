// src/middleware/upload.ts
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Destination folder (ensured by server.ts as well)
const uploadDir = path.resolve('public', 'uploads');

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = crypto.randomBytes(6).toString('hex');
    const filename = `avatar-${Date.now()}-${unique}${ext}`;
    cb(null, filename);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
