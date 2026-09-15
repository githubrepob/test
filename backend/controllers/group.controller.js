const Group = require("../models/Group");

// CREATE GROUP
const createGroup = async (req, res) => {
  try {
    const { name, description, category, isPrivate, rules } = req.body;

    if (!name) return res.status(400).json({ message: "Group name is required" });

    const group = await Group.create({
      name,
      description,
      category: category || "other",
      isPrivate: isPrivate || false,
      rules: rules || "",
      createdBy: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Create Group Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL GROUPS
const getGroups = async (req, res) => {
  try {
    const { category, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const groups = await Group.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error("Get Groups Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET GROUP BY ID
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "name profileImage department")
      .populate("admins", "name profileImage")
      .populate("createdBy", "name");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (error) {
    console.error("Get Group Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// JOIN GROUP
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: "Joined group", membersCount: group.members.length });
  } catch (error) {
    console.error("Join Group Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LEAVE GROUP
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members.pull(req.user._id);
    await group.save();

    res.json({ message: "Left group" });
  } catch (error) {
    console.error("Leave Group Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// SEED DEFAULT GROUPS
const seedGroups = async (req, res) => {
  try {
    const count = await Group.countDocuments();
    if (count > 0) return res.json({ message: "Groups already exist" });

    const groups = [
      { name: "Computer Science", description: "CS department discussions, resources, and updates", category: "department" },
      { name: "Mechanical Engineering", description: "Mech dept community", category: "department" },
      { name: "Electronics & Communication", description: "ECE department hub", category: "department" },
      { name: "Coding Club", description: "Competitive programming, DSA, and dev projects", category: "club" },
      { name: "Robotics Club", description: "Robotics, IoT and embedded systems", category: "club" },
      { name: "Photography Club", description: "Campus life through the lens", category: "club" },
      { name: "AI/ML Enthusiasts", description: "Machine learning, deep learning, and AI projects", category: "interest" },
      { name: "Web3 & Blockchain", description: "Crypto, DeFi, and blockchain development", category: "interest" },
      { name: "Placement Prep", description: "DSA, aptitude, interview experiences", category: "interest" },
      { name: "Batch of 2026", description: "Connect with your batchmates", category: "batch" },
      { name: "Campus Memes", description: "The official meme page 😂", category: "other" },
      { name: "Sports & Fitness", description: "Cricket, football, gym, and more", category: "other" },
    ];

    // Using a dummy user id for seeding — in production these would be real
    const defaultGroups = groups.map((g) => ({
      ...g,
      createdBy: req.user?._id || "000000000000000000000000",
      admins: req.user?._id ? [req.user._id] : [],
      members: req.user?._id ? [req.user._id] : [],
    }));

    await Group.insertMany(defaultGroups);

    res.json({ message: `Seeded ${defaultGroups.length} groups` });
  } catch (error) {
    console.error("Seed Groups Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  seedGroups,
};
