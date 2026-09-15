import { useState } from "react";

const InternshipCard = ({ internship, onApply }) => {

  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (!applied) {
      onApply(internship.id);
      setApplied(true);
      alert("Application submitted successfully 🚀");
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">

      <h3 className="text-lg font-semibold">
        {internship.role}
      </h3>

      <p className="text-sm text-gray-400">
        {internship.company}
      </p>

      <div className="mt-3 text-sm text-gray-300">
        <p>{internship.stipend}</p>
        <p>{internship.duration}</p>
        <p>{internship.location}</p>
      </div>

      {internship.ppo && (
        <span className="bg-purple-600 text-xs px-2 py-1 rounded inline-block mt-3">
          PPO Offered
        </span>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-500">
          Applicants: {internship.applicants}
        </span>

        <button
          onClick={handleApply}
          disabled={applied}
          className={`px-3 py-1 rounded text-sm ${
            applied
              ? "bg-green-600"
              : "bg-purple-600"
          }`}
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>

    </div>
  );
};

export default InternshipCard;