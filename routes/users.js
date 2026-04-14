import express from 'express';
import * as authController from '../controllers/authController.js';
import * as songController from '../controllers/songController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authController.getUserById);

router.get('/:id/songs', songController.getUserSongs);

router.post('/:id/follow', protect, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const userToFollow = await User.findById(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    if (req.user.following.includes(req.params.id)) {
      req.user.following = req.user.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      req.user.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await req.user.save();
    await userToFollow.save();

    res.json({ 
      following: !req.user.following.includes(req.params.id),
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Failed to follow/unfollow user' });
  }
});

export default router;
