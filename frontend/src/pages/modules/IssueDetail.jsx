import { useParams } from "react-router-dom";
import CommentSection from "../../components/tech-issues/CommentSection";

export default function TechIssueDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h2 className="text-2xl mb-2">
        React useEffect causing infinite loop
      </h2>

      <p className="text-white/60 mb-6">
        My component keeps re-rendering endlessly.
      </p>

      <button className="text-xs mb-10 px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition">
        Close Issue
      </button>

      <CommentSection />
    </div>
  );
}
