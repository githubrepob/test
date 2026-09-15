export default function CommentSection() {
  return (
    <div>
      <h4 className="text-sm mb-4">Comments</h4>

      <div className="space-y-4 mb-6">
        <div className="text-sm text-white/70">
          <b>Riya · 3rd Year</b>
          <p>Try removing the dependency array reference.</p>
        </div>
      </div>

      <textarea
        className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm"
        placeholder="Add a comment..."
      />
    </div>
  );
}
