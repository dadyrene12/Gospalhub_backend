import mongoose from 'mongoose';

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
    enum: ['gospel', 'worship', 'praise', 'contemporary', 'traditional', 'other'],
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
