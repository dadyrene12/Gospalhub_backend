import express from 'express';
import { body } from 'express-validator';
import * as playlistController from '../controllers/playlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, playlistController.getPlaylists);

router.get('/:id', playlistController.getPlaylistById);

router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Playlist name is required')
], playlistController.createPlaylist);

router.put('/:id', protect, playlistController.updatePlaylist);

router.delete('/:id', protect, playlistController.deletePlaylist);

router.post('/:songId/songs', protect, playlistController.addSongToPlaylist);

router.delete('/:playlistId/songs/:songId', protect, playlistController.removeSongFromPlaylist);

export default router;
