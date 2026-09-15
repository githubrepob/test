const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/universe";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ MongoDB Connected successfully");
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed. Running backend in fallback/ML mode:", error.message);
  }
};

module.exports = connectDB;
