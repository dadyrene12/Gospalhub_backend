import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, { timestamps: true });

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['audio', 'video'],
    required: [true, 'Type is required']
  },
  genre: {
    type: String,
    enum: ['gospel', 'worship', 'praise', 'contemporary', 'traditional', 'choral', 'hymn', 'other'],
    default: 'gospel'
  },
  scripture: {
    type: String,
    trim: true,
    maxlength: [200, 'Scripture reference cannot exceed 200 characters'],
    default: ''
  },
  mediaUrl: {
    type: String,
    required: false,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'active', 'rejected'],
    default: 'active'
  }
}, {
  timestamps: true
});

songSchema.index({ title: 'text' });
songSchema.index({ type: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ user: 1 });
songSchema.index({ createdAt: -1 });

export default mongoose.model('Song', songSchema);
