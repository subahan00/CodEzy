import mongoose from 'mongoose';
const duelSchema = new mongoose.Schema({
  // Participants
  player1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Challenge
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  
  // Timing
  startTime: Date,
  endTime: Date,
  durationLimit: {
    type: Number,
    default: 1800000 // 30 minutes in milliseconds
  },
  
  // Player 1 Details
  player1Details: {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    submitTime: Date,
    score: {
      type: Number,
      default: 0
    },
    testsPassed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['coding', 'submitted', 'accepted', 'failed'],
      default: 'coding'
    }
  },
  
  // Player 2 Details
  player2Details: {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission'
    },
    submitTime: Date,
    score: {
      type: Number,
      default: 0
    },
    testsPassed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['coding', 'submitted', 'accepted', 'failed'],
      default: 'coding'
    }
  },
  
  // Winner
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winReason: {
    type: String,
    enum: ['score', 'time', 'forfeit', 'draw'],
    default: null
  },
  
  // Elo Changes
  eloChanges: {
    player1Change: {
      type: Number,
      default: 0
    },
    player2Change: {
      type: Number,
      default: 0
    }
  },
  
  // Metadata
  roomId: {
    type: String,
    unique: true,
    required: true
  },
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Chat History (optional)
  chatEnabled: {
    type: Boolean,
    default: false
  },
  chatHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for matchmaking
duelSchema.index({ status: 1, createdAt: -1 });

const Duel = mongoose.model('Duel', duelSchema);
export default Duel;