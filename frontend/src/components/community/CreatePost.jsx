export default function CreatePost() {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
      <textarea
        placeholder="What's happening in the community?"
        className="w-full bg-transparent outline-none resize-none text-sm"
        rows={3}
      />

      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-4 text-gray-400 text-xs">
          <span className="cursor-pointer">📷 Image</span>
          <span className="cursor-pointer">💻 Code</span>
          <span className="cursor-pointer">📊 Poll</span>
        </div>

        <button className="bg-blue-600 hover:bg-blue-500 px-5 py-1.5 rounded-full text-sm">
          Post
        </button>
      </div>
    </div>
  );
}
