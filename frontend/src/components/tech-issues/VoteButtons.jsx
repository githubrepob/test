import { useState } from "react";

export default function VoteButtons({ initial = 0 }) {
  const [votes, setVotes] = useState(initial);

  return (
    <div className="flex items-center gap-2 text-xs text-white/70">
      <button
        onClick={() => setVotes(votes + 1)}
        className="hover:text-white transition"
      >
        ▲
      </button>

      <span>{votes}</span>

      <button
        onClick={() => setVotes(votes - 1)}
        className="hover:text-white transition"
      >
        ▼
      </button>
    </div>
  );
}
