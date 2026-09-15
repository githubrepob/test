import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import Editor from "@monaco-editor/react";

import TechIssuesLayout from "../../../components/ModuleLayout";
import { createIssue } from "../../../api/techIssuesApi";
import { uploadToCloudinary } from "../../../utils/cloudinary";
import api from "../../../api/axios";

const AskTechIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 🔐 Auth guard
  useEffect(() => {
    const token = localStorage.getItem("campusconnect_token");
    if (!token) navigate("/login");
  }, [navigate]);

  // 🧠 Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [code, setCode] = useState("");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // 🖼️ Upload state
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const checkDuplicate = async (currTitle, currBody) => {
    if (!currTitle || currTitle.length < 10) return;
    try {
      const res = await api.post("/ml/check-duplicate", { title: currTitle, description: currBody });
      if (res.data?.isDuplicate) {
        setDuplicateWarning(res.data.matchedText || "A very similar tech issue already exists.");
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.warn("ML Duplicate check offline fallback:", err);
    }
  };

  /* ---------------- IMAGE UPLOAD (FIXED) ---------------- */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);

    try {
      const uploaded = [];

      for (const file of files) {
        const res = await uploadToCloudinary(file, "image");

        // keep markdown behaviour
        setBody((prev) => `${prev}\n\n![image](${res.url})`);

        uploaded.push({
          url: res.url,
          publicId: res.publicId
        });
      }

      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ---------------- TAGS ---------------- */
  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
    if (!value) return;
    if (tags.includes(value)) return;
    if (tags.length >= 5) return;

    setTags([...tags, value]);
    setTagInput("");
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  /* ---------------- SUBMIT (FIXED) ---------------- */
  const submitQuestion = async () => {
    const newErrors = {};

    if (!title || title.length < 15) {
      newErrors.title = "Title must be at least 15 characters.";
    }

    if (!body || body.length < 220) {
      newErrors.body = "Body must be at least 220 characters.";
    }

    if (tags.length === 0) {
      newErrors.tags = "Please add at least one tag.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);

      // ✅ SINGLE JSON REQUEST (THIS WAS THE BUG FIX)
      await createIssue({
        title,
        description: `${body}\n\n\`\`\`\n${code}\n\`\`\``,
        tags,
        attachments
      });

      navigate("/tech-issues");
    } catch (err) {
      console.error("Submit failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TechIssuesLayout>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ================= LEFT: FORM ================= */}
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold">Ask a question</h1>

          {/* -------- TITLE -------- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-5">
            <label className="font-semibold">
              Title <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-zinc-400 mb-2">
              Be specific and imagine you’re asking another student.
            </p>
            <input
              className="w-full bg-black border border-zinc-700 p-3 rounded"
              placeholder="e.g. Why does useEffect run twice in React 18?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => checkDuplicate(title, body)}
            />
            {duplicateWarning && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center justify-between">
                <span>⚠️ Potential duplicate: "{duplicateWarning.slice(0, 70)}..."</span>
                <button type="button" onClick={() => setDuplicateWarning(null)} className="underline text-amber-200 ml-2">Dismiss</button>
              </div>
            )}
            {errors.title && (
              <p className="text-red-500 text-sm mt-2">{errors.title}</p>
            )}
          </div>

          {/* -------- BODY -------- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-5">
            <label className="font-semibold">
              Body <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-zinc-400 mb-3">
              Include all the information someone would need to answer your question.
            </p>

            <div data-color-mode="dark">
              <MDEditor value={body} onChange={setBody} height={260} />
            </div>

            {errors.body && (
              <p className="text-red-500 text-sm mt-2">{errors.body}</p>
            )}

            {/* CODE */}
            <div className="mt-4">
              <label className="text-sm text-zinc-400 mb-1 block">
                Code (optional)
              </label>
              <Editor
                height="220px"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={code}
                onChange={setCode}
              />
            </div>

            {/* IMAGES */}
            <div className="mt-4">
              <label className="text-sm text-zinc-400 mb-1 block">
                Images are useful in a post, but make sure the post is still clear without them.
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />

              {uploading && (
                <p className="text-sm text-zinc-400 mt-1">Uploading…</p>
              )}

              {attachments.length > 0 && (
                <p className="text-sm text-zinc-400 mt-2">
                  {attachments.length} image(s) added
                </p>
              )}
            </div>
          </div>

          {/* -------- TAGS -------- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded p-5">
            <label className="font-semibold">
              Tags <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-zinc-400 mb-2">
              Add up to 5 tags to describe what your question is about.
            </p>

            <div className="flex gap-2 flex-wrap mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-zinc-800 px-3 py-1 rounded text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              className="w-full bg-black border border-zinc-700 p-2 rounded"
              placeholder="e.g. react, nodejs"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />

            {errors.tags && (
              <p className="text-red-500 text-sm mt-2">{errors.tags}</p>
            )}
          </div>

          {/* -------- SUBMIT -------- */}
          <button
            onClick={submitQuestion}
            disabled={submitting}
            className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-zinc-200 disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post your question"}
          </button>

          <p className="text-xs text-zinc-500">
            User contributions licensed under CC BY-SA.
          </p>
        </div>

        {/* ================= RIGHT: HELPER ================= */}
        <aside className="bg-zinc-900 border border-zinc-800 rounded p-5 h-fit">
          <h3 className="font-semibold mb-3">Writing a good question</h3>
          <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
            <li>Summarize the problem clearly</li>
            <li>Describe expected vs actual results</li>
            <li>Show minimal reproducible code</li>
            <li>Add screenshots only if needed</li>
          </ul>
        </aside>
      </div>
    </TechIssuesLayout>
  );
};

export default AskTechIssue;
