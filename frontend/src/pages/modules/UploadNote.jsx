import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { createNote } from "../../api/notesApi";
import api from "../../api/axios";
import { Upload, FileText, X } from "lucide-react";

export default function UploadNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    semester: "",
    branch: "",
    category: "academic",
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT", "AI/ML", "Other"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      setUploadProgress(30);

      const uploadRes = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadProgress(70);

      // Create note with file URL
      const noteData = {
        ...form,
        fileUrl: uploadRes.data.url,
        filePublicId: uploadRes.data.publicId,
        fileName: file.name,
        fileSize: file.size,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      await createNote(noteData);

      setUploadProgress(100);

      // Update aura points
      const user = JSON.parse(localStorage.getItem("campusconnect_user") || "{}");
      if (user._id) {
        user.auraPoints = (user.auraPoints || 0) + 10;
        localStorage.setItem("campusconnect_user", JSON.stringify(user));
      }

      alert("Note uploaded! +10 Aura Points 🔥");
      navigate("/notes");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    }
    setUploading(false);
  };

  return (
    <ModuleLayout title="UPLOAD NOTE" subtitle="Share your knowledge and earn Aura Points!">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Data Structures — Complete Notes"
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Subject *</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Category *</label>
            <div className="flex gap-3">
              {[
                { label: "📚 Academic", value: "academic" },
                { label: "💼 Placement", value: "placement" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`flex-1 py-3 rounded-xl text-sm border transition ${
                    form.category === cat.value
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semester & Branch */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Semester *</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Branch *</label>
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
              >
                <option value="">Select</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief overview of what's covered..."
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none resize-none transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. DSA, Trees, Graphs, Sorting"
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">File *</label>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                file
                  ? "border-indigo-500 bg-indigo-500/5"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={20} className="text-indigo-400" />
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-zinc-500 hover:text-red-400 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload size={32} className="mx-auto text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    PDF, DOC, PPT, images (max 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
          >
            {uploading ? "Uploading..." : "Upload Note (+10 Aura Points)"}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-medium mb-2">📌 Aura Points System</h3>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• Upload a note: <span className="text-emerald-400">+10 points</span></li>
            <li>• Each download by others: <span className="text-emerald-400">+2 points</span></li>
            <li>• Download a note: <span className="text-red-400">-5 points</span></li>
            <li>• Your own notes: <span className="text-indigo-400">Free download</span></li>
          </ul>
        </div>
      </div>
    </ModuleLayout>
  );
}
