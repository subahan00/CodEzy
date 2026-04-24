import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema(
  {
    input: String,
    output: String,
    explanation: String
  },
  { _id: false }
);

const starterCodeSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema(
  {
    // =====================
    // Core Problem Info
    // =====================
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: true
    },

    contentType: {
      type: String,
      enum: ['challenge', 'tutorial', 'quiz'],
      default: 'challenge'
    },

    // =====================
    // Classification
    // =====================
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    tags: {
      type: [String],
      index: true
    },

    // =====================
    // Challenge (Problem)
    // =====================
    problemStatement: {
      type: String,
      required: function () {
        return this.contentType === 'challenge';
      }
    },
    inputFormat: String,
    outputFormat: String,
    constraints: [String],

    examples: [exampleSchema],

    starterCode: [starterCodeSchema],

    timeLimit: {
      type: Number,
      default: 2000 // ms
    },
    memoryLimit: {
      type: Number,
      default: 256 // MB
    },

    // =====================
    // Statistics (problem-level only)
    // =====================
    stats: {
      totalSubmissions: {
        type: Number,
        default: 0
      },
      acceptedCount: {
        type: Number,
        default: 0
      }
    },

    // =====================
    // Meta
    // =====================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    skillWeight: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },

    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// =====================
// Slug Generator
// =====================
// ─── FIX #11: pre('save') hook must call next() or be declared async ──────────
// In Mongoose < 7, omitting next() in a synchronous pre-hook causes saves to
// hang indefinitely. Using async form avoids the issue entirely.
contentSchema.pre('save', async function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

const Content = mongoose.model('Content', contentSchema);
export default Content;