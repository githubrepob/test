import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { getNoteById, downloadNote, generateSummary, rateNote } from "../../api/notesApi";
import { Download, Star, FileText, User, Calendar, BookOpen, ArrowLeft, Sparkles } from "lucide-react";
import { getToken, getUser } from "../../utils/auth";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const user = getUser();

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await getNoteById(id);
      setNote(res.data);
      // Check if user already rated
      const existing = res.data.ratings?.find(
        (r) => r.user === user?._id
      );
      if (existing) setUserRating(existing.score);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await generateSummary(id);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    }
    setLoadingSummary(false);
  };

  const handleDownload = async () => {
    if (!getToken()) {
      alert("Please login to download");
      return navigate("/login");
    }
    try {
      const res = await downloadNote(id);
      window.open(res.data.fileUrl, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Download failed");
    }
  };

  const handleRate = async (score) => {
    if (!getToken()) {
      alert("Login to rate");
      return;
    }
    try {
      const res = await rateNote(id, score);
      setUserRating(score);
      setNote({ ...note, averageRating: res.data.averageRating });
    } catch (err) {
      console.error(err);
    }
  };

  if (!note) {
    return (
      <ModuleLayout title="Loading...">
        <div className="text-center py-20 text-zinc-500">Loading note details...</div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout title="" subtitle="">
      <button
        onClick={() => navigate("/notes")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Notes
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  note.category === "academic"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
                }`}
              >
                {note.category === "academic" ? "📚 Academic" : "💼 Placement"}
              </span>
              <span className="text-xs text-zinc-600">
                Sem {note.semester} • {note.branch}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
            <p className="text-zinc-400">{note.subject}</p>

            {note.description && (
              <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
                {note.description}
              </p>
            )}

            {/* Tags */}
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-400" />
                Note Summary
              </h2>
              {!summary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={loadingSummary}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loadingSummary ? "Generating..." : "✨ Generate Summary"}
                </button>
              )}
            </div>

            {summary ? (
              <div className="bg-zinc-800/50 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm">
                Click "Generate Summary" to get an AI-powered summary of this note.
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Rate this Note</h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleRate(score)}
                  onMouseEnter={() => setHoverRating(score)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`${
                      score <= (hoverRating || userRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-700"
                    } transition`}
                  />
                </button>
              ))}
              <span className="text-sm text-zinc-500 ml-3">
                {note.averageRating?.toFixed(1)}/5 ({note.ratings?.length || 0} ratings)
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Download Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6">
            <FileText size={32} className="text-indigo-400 mb-3" />
            <p className="text-sm text-zinc-400 mb-1">{note.fileName || "File"}</p>
            <p className="text-xs text-zinc-600 mb-4">
              {note.fileSize ? `${(note.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
            </p>
            <button
              onClick={handleDownload}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download (-5 Aura)
            </button>
            <p className="text-xs text-zinc-600 text-center mt-2">
              {note.downloads} downloads
            </p>
          </div>

          {/* Uploader */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-medium mb-3">Uploaded By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
                {note.uploadedBy?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-sm font-medium">{note.uploadedBy?.name || "Anonymous"}</p>
                <p className="text-xs text-zinc-500">{note.uploadedBy?.department || ""}</p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-medium mb-3">Details</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <div className="flex justify-between">
                <span>Subject</span>
                <span className="text-zinc-300">{note.subject}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester</span>
                <span className="text-zinc-300">{note.semester}</span>
              </div>
              <div className="flex justify-between">
                <span>Branch</span>
                <span className="text-zinc-300">{note.branch}</span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <span className="text-zinc-300 capitalize">{note.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded</span>
                <span className="text-zinc-300">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
