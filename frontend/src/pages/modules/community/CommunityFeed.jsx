import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import {
  getFeedPosts, createPost, toggleLike, addComment, deletePost,
  getGroups, seedGroups
} from "../../../api/communityApi";
import api from "../../../api/axios";
import { getToken, getUser } from "../../../utils/auth";
import {
  Heart, MessageCircle, Share2, Send, Image, Code,
  BarChart2, Trash2, Users, ChevronRight, Plus, X
} from "lucide-react";

export default function CommunityFeed() {
  const navigate = useNavigate();
  const user = getUser();
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
    fetchGroups();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getFeedPosts();
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchGroups = async () => {
    try {
      const res = await getGroups();
      if (res.data.length === 0) {
        // Seed groups
        if (getToken()) {
          await seedGroups();
          const res2 = await getGroups();
          setGroups(res2.data);
        }
      } else {
        setGroups(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!getToken()) return alert("Login to post");
    setPosting(true);
    try {
      let images = [];

      // Upload images if any
      for (const file of newImages) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        images.push({ url: res.data.url, public_id: res.data.publicId });
      }

      await createPost({
        content: newPost,
        images,
        type: images.length > 0 ? "image" : "text",
      });

      setNewPost("");
      setNewImages([]);
      fetchPosts();
    } catch (err) {
      alert("Failed to post");
    }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    if (!getToken()) return alert("Login to like");
    try {
      const res = await toggleLike(postId);
      setPosts(posts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: res.data.isLiked
                ? [...p.likes, user?._id]
                : p.likes.filter((id) => id !== user?._id),
            }
          : p
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    if (!getToken()) return alert("Login to comment");
    try {
      const res = await addComment(postId, content);
      setPosts(posts.map((p) =>
        p._id === postId ? { ...p, comments: res.data } : p
      ));
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "department": return "bg-blue-500/20 text-blue-400";
      case "club": return "bg-emerald-500/20 text-emerald-400";
      case "interest": return "bg-purple-500/20 text-purple-400";
      case "batch": return "bg-orange-500/20 text-orange-400";
      default: return "bg-zinc-500/20 text-zinc-400";
    }
  };

  return (
    <ModuleLayout
      title="COMMUNITY"
      subtitle="Connect with fellow students, share ideas, and stay updated with campus happenings."
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR - Groups */}
          <aside className="hidden xl:block col-span-3 space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Campus Groups</h3>
                <button
                  onClick={() => navigate("/community/groups")}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  See All
                </button>
              </div>
              <div className="space-y-2">
                {groups.slice(0, 8).map((group) => (
                  <button
                    key={group._id}
                    onClick={() => navigate(`/community/groups/${group._id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {group.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{group.name}</p>
                      <p className="text-xs text-zinc-600">{group.members?.length || 0} members</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {["department", "club", "interest", "batch", "other"].map((cat) => (
                  <span key={cat} className={`px-3 py-1 rounded-full text-xs capitalize ${getCategoryColor(cat)}`}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* FEED */}
          <main className="col-span-12 xl:col-span-6 space-y-4">
            {/* Create Post */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's happening on campus? 🎓"
                    className="w-full bg-transparent outline-none resize-none text-sm"
                    rows={3}
                  />

                  {/* Image previews */}
                  {newImages.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {newImages.map((file, i) => (
                        <div key={i} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <button
                            onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-800">
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition">
                    <Image size={16} /> Photo
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])}
                    />
                  </label>
                  <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition">
                    <Code size={16} /> Code
                  </button>
                  <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition">
                    <BarChart2 size={16} /> Poll
                  </button>
                </div>
                <button
                  onClick={handlePost}
                  disabled={posting || !newPost.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 px-5 py-1.5 rounded-full text-sm transition disabled:opacity-50"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-10 text-zinc-500">Loading feed...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-zinc-500">
                <MessageCircle size={32} className="mx-auto mb-2 text-zinc-700" />
                <p>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                  {/* Author */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold">
                        {post.author?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{post.author?.name}</p>
                        <p className="text-xs text-zinc-500">
                          {post.author?.department} • {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    {user?._id === post.author?._id && (
                      <button onClick={() => handleDelete(post._id)} className="text-zinc-600 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-relaxed mb-3">{post.content}</p>

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {post.images.map((img, i) => (
                        <img key={i} src={img.url} alt="" className="rounded-xl w-full object-cover max-h-80" />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-6 text-zinc-500 text-sm border-t border-zinc-800 pt-3">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition ${
                        post.likes?.includes(user?._id)
                          ? "text-red-400"
                          : "hover:text-red-400"
                      }`}
                    >
                      <Heart size={16} className={post.likes?.includes(user?._id) ? "fill-red-400" : ""} />
                      {post.likes?.length || 0}
                    </button>
                    <button
                      onClick={() => setExpandedComments({
                        ...expandedComments,
                        [post._id]: !expandedComments[post._id],
                      })}
                      className="flex items-center gap-1.5 hover:text-blue-400 transition"
                    >
                      <MessageCircle size={16} /> {post.comments?.length || 0}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-emerald-400 transition">
                      <Share2 size={16} /> Share
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post._id] && (
                    <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3">
                      {post.comments?.map((c) => (
                        <div key={c._id} className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs shrink-0">
                            {c.author?.name?.charAt(0) || "U"}
                          </div>
                          <div className="bg-zinc-800 rounded-xl px-3 py-2 text-sm">
                            <p className="text-xs text-zinc-400 font-medium">{c.author?.name}</p>
                            <p className="text-zinc-300">{c.content}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2 mt-2">
                        <input
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
                          onKeyDown={(e) => e.key === "Enter" && handleComment(post._id)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleComment(post._id)}
                          className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-xl transition"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block col-span-3 space-y-4">
            {/* Trending */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">🔥 Trending</h3>
              <div className="space-y-3">
                {["Placement Season 2026", "Hackathon Winners", "New Coding Lab", "Sports Week"].map((topic, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-600 font-mono text-xs">#{i + 1}</span>
                    <p className="text-zinc-300">{topic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">Suggested Groups</h3>
              <div className="space-y-2">
                {groups.slice(0, 4).map((group) => (
                  <div key={group._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xs font-bold">
                        {group.name.charAt(0)}
                      </div>
                      <span className="text-xs">{group.name}</span>
                    </div>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">Join</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3">Your Activity</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Posts</span>
                  <span className="text-zinc-300">{posts.filter((p) => p.author?._id === user?._id).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aura Points</span>
                  <span className="text-orange-400">🔥 {user?.auraPoints || 0}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ModuleLayout>
  );
}
