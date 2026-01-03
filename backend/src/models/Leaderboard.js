import mongoose from 'mongoose';
const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['global', 'weekly', 'monthly', 'beginner', 'intermediate', 'advanced'],
    required: true
  },
  rankings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rank: Number,
    score: Number,
    problemsSolved: Number,
    duelsWon: Number,
    eloRating: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);   
export default Leaderboard;