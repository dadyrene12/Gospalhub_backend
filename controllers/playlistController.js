import { validationResult } from 'express-validator';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate('songs')
      .sort({ createdAt: -1 });

    res.json({ playlists });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ message: 'Failed to fetch playlists' });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'songs',
        populate: { path: 'user', select: 'name avatar' }
      })
      .populate('user', 'name avatar');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (!playlist.isPublic && playlist.user._id.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'This playlist is private' });
    }

    res.json({ playlist });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ message: 'Failed to fetch playlist' });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.create({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      user: req.user._id
    });

    res.status(201).json({
      message: 'Playlist created',
      playlist
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ message: 'Failed to create playlist' });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, coverImage, isPublic } = req.body;

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (coverImage !== undefined) playlist.coverImage = coverImage;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({
      message: 'Playlist updated',
      playlist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ message: 'Failed to update playlist' });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ message: 'Failed to delete playlist' });
  }
};

export const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.params;
    const { playlistId } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();
    }

    await playlist.populate('songs');

    res.json({
      message: 'Song added to playlist',
      playlist
    });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ message: 'Failed to add song to playlist' });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();
    await playlist.populate('songs');

    res.json({
      message: 'Song removed from playlist',
      playlist
    });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ message: 'Failed to remove song from playlist' });
  }
};
