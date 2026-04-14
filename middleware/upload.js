import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist
const uploadDirs = ['audio', 'video', 'images', 'misc'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', 'uploads', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    if (file.mimetype.startsWith('audio')) {
      folder = 'audio';
    } else if (file.mimetype.startsWith('video')) {
      folder = 'video';
    } else if (file.mimetype.startsWith('image')) {
      folder = 'images';
    }
    cb(null, path.join(__dirname, '..', 'uploads', folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File mime type:', file.mimetype);
  cb(null, true);
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024,
    files: 1
  }
});

export const uploadThumbnail = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});
