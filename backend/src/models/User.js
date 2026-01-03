import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't return password by default
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Role & Profile
  role: {
    type: String,
    enum: ['learner', 'admin'],
    default: 'learner'
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // Statistics & Gamification
  statistics: {
    totalScore: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    duelsWon: {
      type: Number,
      default: 0
    },
    duelsLost: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    eloRating: {
      type: Number,
      default: 1200
    }
  },
  
  // Progress Tracking
  learningProgress: {
    completedTutorials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }],
    completedQuizzes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }],
    completedChallenges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    }],
    topicProficiency: [{
      topic: String,
      proficiencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Achievements
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  
  // Account Management
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  lastActivityDate: Date,
  
  // Preferences
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    duelInvites: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    programmingLanguage: {
      type: String,
      default: 'javascript'
    }
  }
}, {
  timestamps: true
});
// Hash password before saving

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;