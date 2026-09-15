import { useState, useEffect } from "react";
import ModuleLayout from "../../components/ModuleLayout";
import { getNotes, downloadNote, deleteNote } from "../../api/notesApi";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  FileText, Download, Star, Search, Filter,
  Upload, BookOpen, GraduationCap, Trash2, Eye
} from "lucide-react";
import { getToken, getUser } from "../../utils/auth";

import AIResearchSummarizerModal from "../../components/notes/AIResearchSummarizerModal";
import { Sparkles } from "lucide-react";

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    fetchNotes();
  }, [category, semester, branch]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (search.trim()) {
        try {
          const mlRes = await api.get(`/ml/search/notes?q=${encodeURIComponent(search)}`);
          if (Array.isArray(mlRes.data) && mlRes.data.length > 0) {
            setNotes(mlRes.data);
            setTotal(mlRes.data.length);
            setLoading(false);
            return;
          }
        } catch (mlErr) {
          console.warn("Semantic search fallback to standard note search:", mlErr);
        }
      }
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (semester) params.semester = semester;
      if (branch) params.branch = branch;
      const res = await getNotes(params);
      setNotes(res.data.notes);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotes();
  };

  const handleDownload = async (note) => {
    if (!getToken()) {
      alert("Please login to download notes");
      return navigate("/login");
    }
    try {
      const res = await downloadNote(note._id);
      window.open(res.data.fileUrl, "_blank");
      // Refresh user aura points in localStorage
      const u = getUser();
      if (u && note.uploadedBy?._id !== u._id) {
        u.auraPoints = (u.auraPoints || 0) - 5;
        localStorage.setItem("campusconnect_user", JSON.stringify(u));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Download failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "AI/ML", "Other"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <ModuleLayout
      title="NOTES"
      subtitle="Upload, discover, and download high-quality notes. Earn Aura Points by sharing!"
    >
      {/* Top Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search notes by title, subject, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-indigo-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-sm transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            <Sparkles size={16} /> AI Research Explainer
          </button>

          <button
            onClick={() => navigate("/notes/upload")}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-500/20 text-white"
          >
            <Upload size={16} /> Upload Notes
          </button>
        </div>
      </div>

      <AIResearchSummarizerModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Academic", value: "academic", icon: BookOpen },
            { label: "Placement", value: "placement", icon: GraduationCap },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition ${
                category === cat.value
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {cat.icon && <cat.icon size={14} />}
              {cat.label}
            </button>
          ))}
        </div>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-300 outline-none"
        >
          <option value="">All Semesters</option>
          {semesters.map((s) => (
            <option key={s} value={s}>Sem {s}</option>
          ))}
        </select>

        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-sm text-zinc-300 outline-none"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{total}</p>
          <p className="text-xs text-zinc-500 mt-1">Total Notes</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {notes.reduce((sum, n) => sum + n.downloads, 0)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Downloads</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">🔥 {user?.auraPoints || 0}</p>
          <p className="text-xs text-zinc-500 mt-1">Your Aura</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {notes.filter((n) => n.uploadedBy?._id === user?._id).length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Your Uploads</p>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-lg">No notes found</p>
          <p className="text-zinc-600 text-sm mt-1">Be the first to share notes!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note._id}
              className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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

              {/* Title */}
              <h3 className="text-lg font-semibold mb-1 group-hover:text-indigo-300 transition">
                {note.title}
              </h3>
              <p className="text-sm text-zinc-500 mb-3">{note.subject}</p>

              {/* Tags */}
              {note.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <span className="flex items-center gap-1">
                  <Download size={12} /> {note.downloads}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-500" />{" "}
                  {note.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span>By {note.uploadedBy?.name || "Anonymous"}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/notes/${note._id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-sm transition"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleDownload(note)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-sm transition"
                >
                  <Download size={14} /> Download
                </button>
                {user?._id === note.uploadedBy?._id && (
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleLayout>
  );
}
