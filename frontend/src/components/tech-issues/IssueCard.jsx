import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const IssueCard = ({ issue }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-5 flex gap-6">
      {/* LEFT: STATS */}
      <div className="text-center text-sm text-zinc-400 min-w-[70px]">
        <div>
          <span className="block font-semibold text-white">
            {issue.voteCount || 0}
          </span>
          votes
        </div>
      </div>

      {/* RIGHT: CONTENT */}
      <div className="flex-1">
        <Link
          to={`/tech-issues/${issue._id}`}
          className="text-lg font-semibold text-blue-400 hover:underline"
        >
          {issue.title}
        </Link>

        <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
          {issue.description?.replace(/[#_*`]/g, "").slice(0, 160)}…
        </p>

        <div className="flex justify-between items-center mt-4">
          {/* TAGS */}
          <div className="flex gap-2 flex-wrap">
            {issue.tags?.map((tag) => (
              <span key={tag} className="bg-zinc-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* META */}
          <div className="text-xs text-zinc-500">
            {issue.status === "closed" && (
              <span className="text-red-400 mr-2">closed</span>
            )}
            asked {dayjs(issue.createdAt).fromNow()} by{" "}
            <span className="text-zinc-300">{issue.author?.name}</span> ·{" "}
            {issue.author?.auraPoints || 0} aura
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
