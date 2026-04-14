import Song from '../models/Song.js';

export const getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: 'active' };

    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.genre) {
      filter.genre = req.query.genre;
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const sort = req.query.sort === 'popular' 
      ? { views: -1 } 
      : { createdAt: -1 };

    const [songs, total] = await Promise.all([
      Song.find(filter)
        .populate('user', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Song.countDocuments(filter)
    ]);

    res.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ message: 'Failed to fetch songs' });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('user', 'name avatar bio')
      .populate('likes', 'name avatar');

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    song.views += 1;
    await song.save();

    res.json({ song });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ message: 'Failed to fetch song' });
  }
};

export const createSong = async (req, res) => {
  try {
    const { title, type, genre, scripture } = req.body;

    console.log('Upload - Body:', req.body);
    console.log('Upload - Files:', req.files);

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let mediaUrl = '';
    let thumbnail = '';
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files?.media) {
      const file = req.files.media[0];
      const folder = file.mimetype.startsWith('audio') ? 'audio' : 'video';
      mediaUrl = `${baseUrl}/uploads/${folder}/${file.filename}`;
      console.log('Media URL:', mediaUrl);
    }
    
    if (req.files?.thumbnail) {
      thumbnail = `${baseUrl}/uploads/images/${req.files.thumbnail[0].filename}`;
    }

    const song = await Song.create({
      title,
      type: type || 'audio',
      genre: genre || 'gospel',
      scripture: scripture || '',
      mediaUrl,
      thumbnail,
      user: req.user._id
    });

    await song.populate('user', 'name avatar');

    res.status(201).json({
      message: 'Song created successfully',
      song
    });
  } catch (error) {
    console.error('Create song error:', error);
    res.status(500).json({ message: 'Failed to create song', error: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (song.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this song' });
    }

    const { title, genre, scripture, status } = req.body;

    if (title) song.title = title;
    if (genre) song.genre = genre;
    if (scripture !== undefined) song.scripture = scripture;
    if (status && req.user.role === 'admin') song.status = status;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files?.media) {
      const file = req.files.media[0];
      song.mediaUrl = `${baseUrl}/uploads/${file.mimetype.startsWith('audio') ? 'audio' : 'video'}/${file.filename}`;
    }
    
    if (req.files?.thumbnail) {
      song.thumbnail = `${baseUrl}/uploads/images/${req.files.thumbnail[0].filename}`;
    }

    await song.save();
    await song.populate('user', 'name avatar');

    res.json({
      message: 'Song updated successfully',
      song
    });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({ message: 'Failed to update song' });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (song.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this song' });
    }

    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ message: 'Failed to delete song' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const userId = req.user._id;
    const likeIndex = song.likes.indexOf(userId);

    if (likeIndex > -1) {
      song.likes.splice(likeIndex, 1);
    } else {
      song.likes.push(userId);
    }

    await song.save();
    await song.populate('likes', 'name avatar');

    res.json({
      liked: likeIndex === -1,
      likesCount: song.likes.length,
      likes: song.likes
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

export const getUserSongs = async (req, res) => {
  try {
    const songs = await Song.find({ user: req.params.id, status: 'active' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ songs });
  } catch (error) {
    console.error('Get user songs error:', error);
    res.status(500).json({ message: 'Failed to fetch user songs' });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const songs = await Song.find({ status: 'active' })
      .populate('user', 'name avatar')
      .sort({ views: -1, likes: -1 })
      .limit(10);

    res.json({ songs });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ message: 'Failed to fetch featured songs' });
  }
};

export const fixMediaUrls = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const songs = await Song.find({ 
      $or: [
        { mediaUrl: { $exists: false } },
        { mediaUrl: '' },
        { mediaUrl: null }
      ]
    });
    
    const videoFiles = [
      '026e920a-ef43-4ea0-bb1b-68d71ac9bac0.mp4',
      '0de8d594-2527-4dd3-a344-4ba13d6f475c.mp4',
      '2dcc20d9-9686-498e-b404-0aa40dc8ca49.mp4',
      '2e16ce7d-c0f9-4a54-a3d1-285d03cde4f9.mp4',
      '69cb467f-1177-4a27-ba26-e1b48de822b1.mp4'
    ];
    
    const updatedSongs = [];
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (song.type === 'video' && i < videoFiles.length) {
        song.mediaUrl = `${baseUrl}/uploads/video/${videoFiles[i]}`;
        await song.save();
        updatedSongs.push({ id: song._id, title: song.title, mediaUrl: song.mediaUrl });
      }
    }
    
    res.json({ message: `Fixed ${updatedSongs.length} songs`, songs: updatedSongs });
  } catch (error) {
    console.error('Fix media error:', error);
    res.status(500).json({ message: 'Failed to fix media URLs', error: error.message });
  }
};