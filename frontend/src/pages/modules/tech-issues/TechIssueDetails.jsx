import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import TechIssuesLayout from "../../../components/ModuleLayout";
import api from "../../../api/axios";

dayjs.extend(relativeTime);

const isValidObjectId = (val) => /^[a-f\d]{24}$/i.test(val);

/* ================= COMMENT ITEM ================= */
const CommentItem = ({
  comment,
  level = 0,
  issue,
  isOwner,
  onVote,
  onAccept,
  onReply
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  const replies = comment.replies || [];
  const visibleReplies = showReplies ? replies : replies.slice(0, 5);

  const isAccepted =
    issue.acceptedAnswer && issue.acceptedAnswer === comment._id;

  return (
    <div
      className={`border rounded p-5 bg-zinc-900 ${
        isAccepted ? "border-green-600" : "border-zinc-800"
      }`}
      style={{ marginLeft: level * 24 }}
    >
      <p>{comment.content}</p>

      <div className="flex justify-between items-center mt-3 text-sm text-zinc-400">
        <div>
          by{" "}
          <span className="text-zinc-300">{comment.author?.name}</span>{" "}
          · 🔥 {comment.author?.auraPoints || 0}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onVote(comment._id, "upvote", "comment")}
          >
            ▲
          </button>

          <span>{comment.voteCount ?? 0}</span>

          <button
            type="button"
            onClick={() => onVote(comment._id, "downvote", "comment")}
          >
            ▼
          </button>

          <button
            type="button"
            className="text-blue-400"
            onClick={() => setShowReplies(true)}
          >
            Reply
          </button>

          {isOwner && issue.status !== "closed" && (
            <button
              type="button"
              className="text-green-400"
              onClick={() => onAccept(comment._id)}
            >
              Accept
            </button>
          )}

          {isAccepted && (
            <span className="text-green-400">✓ Accepted</span>
          )}
        </div>
      </div>

      {/* REPLY BOX */}
      {showReplies && (
        <div className="mt-4">
          <textarea
            className="w-full bg-zinc-800 border border-zinc-700 p-2 rounded"
            rows={3}
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex gap-3 mt-2">
            <button
              className="bg-blue-500 px-3 py-1 rounded"
              onClick={() => {
                onReply(comment._id, replyText);
                setReplyText("");
                setShowReplies(false);
              }}
            >
              Reply
            </button>
            <button
              className="text-zinc-400"
              onClick={() => setShowReplies(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* NESTED REPLIES */}
      {visibleReplies.length > 0 && (
        <div className="mt-4 space-y-4">
          {visibleReplies.map((r) => (
            <CommentItem
              key={r._id}
              comment={r}
              level={level + 1}
              issue={issue}
              isOwner={isOwner}
              onVote={onVote}
              onAccept={onAccept}
              onReply={onReply}
            />
          ))}
        </div>
      )}

      {replies.length > 5 && !showReplies && (
        <button
          className="text-blue-400 text-sm mt-2"
          onClick={() => setShowReplies(true)}
        >
          Show more replies
        </button>
      )}
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const TechIssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [aiBugLoading, setAiBugLoading] = useState(false);
  const [aiBugData, setAiBugData] = useState(null);

  const user = JSON.parse(localStorage.getItem("campusconnect_user"));

  useEffect(() => {
    if (!isValidObjectId(id)) {
      navigate("/tech-issues");
      return;
    }
    loadInitial();
  }, [id]);

  const loadInitial = async () => {
    setLoading(true);
    const [issueRes, commentRes] = await Promise.all([
      api.get(`/tech-issues/${id}`),
      api.get(`/tech-issues/${id}/comments`)
    ]);
    setIssue(issueRes.data.data);
    setComments(commentRes.data.data);
    setLoading(false);
  };

  /* ================= VOTING ================= */
  const vote = async (targetId, voteType, targetType) => {
    await api.post(
      `/tech-issues/${targetId}/vote?targetType=${targetType}`,
      { voteType }
    );

    if (targetType === "issue") {
      const res = await api.get(`/tech-issues/${id}`);
      setIssue(res.data.data);
    } else {
      const res = await api.get(`/tech-issues/${id}/comments`);
      setComments(res.data.data);
    }
  };

  /* ================= ANSWERS ================= */
  const postAnswer = async () => {
    if (!answerText.trim()) return;
    await api.post(`/tech-issues/${id}/comments`, {
      content: answerText
    });
    setAnswerText("");
    const res = await api.get(`/tech-issues/${id}/comments`);
    setComments(res.data.data);
  };

  const postReply = async (parentId, text) => {
    if (!text.trim()) return;
    await api.post(`/tech-issues/${id}/comments`, {
      content: text,
      parentComment: parentId
    });
    const res = await api.get(`/tech-issues/${id}/comments`);
    setComments(res.data.data);
  };

  /* ================= ACCEPT ANSWER ================= */
  const acceptAnswer = async (commentId) => {
    await api.patch(`/tech-issues/${id}/accept/${commentId}`);
    const [issueRes, commentRes] = await Promise.all([
      api.get(`/tech-issues/${id}`),
      api.get(`/tech-issues/${id}/comments`)
    ]);
    setIssue(issueRes.data.data);
    setComments(commentRes.data.data);
  };

  if (loading || !issue) {
    return (
      <TechIssuesLayout>
        <div className="p-10 text-zinc-400">Loading…</div>
      </TechIssuesLayout>
    );
  }

  const isOwner = user && issue.author && user._id === issue.author._id;

  return (
    <TechIssuesLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/tech-issues" className="text-zinc-400">
            ← Back to issues
          </Link>
          <Link
            to="/tech-issues/create"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Ask Question
          </Link>
        </div>

        {/* ISSUE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-6 mb-8">
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Asked {dayjs(issue.createdAt).fromNow()} by{" "}
            <span className="text-zinc-300">{issue.author?.name}</span>{" "}
            · 🔥 {issue.author?.auraPoints || 0}
          </p>

          {/* ISSUE BODY */}
<div className="mt-6" data-color-mode="dark">
  <MDEditor.Markdown source={issue.description} />
</div>
{console.log("ISSUE ATTACHMENTS:", issue.attachments)}
{/* ISSUE ATTACHMENTS (OUTSIDE MARKDOWN) */}
{/* ISSUE ATTACHMENTS (OUTSIDE MARKDOWN) */}
{Array.isArray(issue.attachments) && issue.attachments.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
    {issue.attachments.map((img, index) => (
      <img
        key={img.publicId || index}
        src={img.url}
        alt="attachment"
        loading="lazy"
        className="rounded border border-zinc-700 cursor-pointer hover:opacity-90"
      />
    ))}
  </div>
)}




          <div className="flex items-center gap-4 mt-6">
            <button onClick={() => vote(issue._id, "upvote", "issue")}>▲</button>
            <span>{issue.voteCount ?? 0}</span>
            <button onClick={() => vote(issue._id, "downvote", "issue")}>▼</button>

            {issue.status === "closed" && (
              <span className="text-green-400 ml-4">✓ Solved</span>
            )}

            <button
              onClick={async () => {
                setAiBugLoading(true);
                try {
                  const res = await api.post("/ml/code/explain-bug", { code: issue.description });
                  setAiBugData(res.data);
                } catch (e) {
                  console.error(e);
                } finally {
                  setAiBugLoading(false);
                }
              }}
              className="ml-auto flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition shadow-lg shadow-cyan-500/10"
            >
              🤖 {aiBugLoading ? "Analyzing Bug..." : "AI Code Doctor"}
            </button>
          </div>

          {/* AI BUG DOCTOR RESULTS */}
          {aiBugData && (
            <div className="mt-6 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-bold text-cyan-400">🤖 AI Code Doctor Diagnosis</span>
                <button onClick={() => setAiBugData(null)} className="text-xs text-slate-500 hover:text-white">Close</button>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-400">🐞 Identified Bug & Exception Summary</h4>
                <p className="text-xs text-slate-300">{aiBugData.bugSummary}</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-400">🛠️ AI Fixed Code</h4>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded text-xs text-cyan-300 font-mono overflow-x-auto">
                  {aiBugData.fixedCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ANSWERS */}
        <h2 className="text-xl font-semibold mb-4">Answers</h2>
        <div className="space-y-6">
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              issue={issue}
              isOwner={isOwner}
              onVote={vote}
              onAccept={acceptAnswer}
              onReply={postReply}
            />
          ))}
        </div>

        {/* ADD ANSWER */}
        {issue.status !== "closed" && (
          <div className="mt-10">
            <textarea
              className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded"
              rows={4}
              placeholder="Write your answer…"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <button
              onClick={postAnswer}
              className="mt-3 bg-blue-500 text-white px-5 py-2 rounded"
            >
              Post Answer
            </button>
          </div>
        )}
      </div>
    </TechIssuesLayout>
  );
};

export default TechIssueDetails;
