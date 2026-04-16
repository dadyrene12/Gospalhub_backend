import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['verification', 'reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

tokenSchema.index({ token: 1 });

tokenSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 100) {
    console.log('TTL index background build in progress, document saved');
    next();
  } else {
    next(error);
  }
});

export default mongoose.model('Token', tokenSchema);
