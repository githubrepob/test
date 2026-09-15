const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { content, images, group, tags, type, pollOptions } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const postData = {
      author: req.user._id,
      content,
      images: images || [],
      group: group || null,
      tags: tags || [],
      type: type || "text",
    };

    if (type === "poll" && pollOptions) {
      postData.pollOptions = pollOptions.map((opt) => ({
        text: opt,
        votes: [],
      }));
    }

    const post = await Post.create(postData);

    // Award aura points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { auraPoints: 3 },
    });

    const populated = await Post.findById(post._id)
      .populate("author", "name profileImage department");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET FEED POSTS
const getFeedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, group } = req.query;

    const filter = {};
    if (group) {
      filter.group = group;
    } else {
      filter.group = null; // general feed
    }

    const posts = await Post.find(filter)
      .populate("author", "name profileImage department")
      .populate("comments.author", "name profileImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Feed Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// TOGGLE LIKE
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: liked ? "Unliked" : "Liked",
      likesCount: post.likes.length,
      isLiked: !liked,
    });
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user._id,
      content,
    });

    await post.save();

    const updated = await Post.findById(post._id)
      .populate("comments.author", "name profileImage");

    res.json(updated.comments);
  } catch (error) {
    console.error("Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// VOTE ON POLL
const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.type !== "poll") {
      return res.status(400).json({ message: "Not a poll post" });
    }

    // Remove existing vote
    post.pollOptions.forEach((opt) => {
      opt.votes.pull(req.user._id);
    });

    // Add vote
    if (optionIndex >= 0 && optionIndex < post.pollOptions.length) {
      post.pollOptions[optionIndex].votes.push(req.user._id);
    }

    await post.save();

    res.json(post.pollOptions);
  } catch (error) {
    console.error("Vote Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  toggleLike,
  addComment,
  votePoll,
  deletePost,
};
