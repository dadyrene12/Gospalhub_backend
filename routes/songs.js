import express from 'express';
import multer from 'multer';
import * as songController from '../controllers/songController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadMedia } from '../middleware/upload.js';

const router = express.Router();

router.get('/featured', songController.getFeatured);
router.get('/', optionalAuth, songController.getSongs);
router.get('/artist/:id', songController.getArtistSongs);
router.get('/user/:id', songController.getUserSongs);
router.get('/:id', optionalAuth, songController.getSongById);

router.post('/', protect, (req, res, next) => {
  uploadMedia.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, songController.createSong);

router.put('/:id', protect, uploadMedia.fields([
  { name: 'media', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), songController.updateSong);
router.delete('/:id', protect, songController.deleteSong);
router.post('/:id/like', protect, songController.toggleLike);
router.post('/:id/play', songController.incrementPlay);
router.post('/:id/comments', protect, songController.addComment);
router.delete('/:id/comments/:commentId', protect, songController.deleteComment);
router.post('/fix-media', songController.fixMediaUrls);

export default router;