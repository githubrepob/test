import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function PostCard({ post }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
      <div className="flex gap-3 items-center">
        <img
          src={post.avatar}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium text-sm">{post.author}</p>
          <p className="text-xs text-gray-400">{post.time}</p>
        </div>
      </div>

      <p className="mt-3 text-sm">{post.content}</p>

      <div className="flex gap-6 mt-4 text-gray-400 text-sm">
        <span className="flex gap-1 items-center cursor-pointer hover:text-red-400">
          <Heart size={16} /> {post.likes}
        </span>
        <span className="flex gap-1 items-center cursor-pointer hover:text-blue-400">
          <MessageCircle size={16} /> {post.comments}
        </span>
        <span className="flex gap-1 items-center cursor-pointer">
          <Share2 size={16} />
        </span>
      </div>
    </div>
  );
}
