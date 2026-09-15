const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: Object,
      required: true,
    },

    tags: [String],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    votes: {
      up: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      down: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },

    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
