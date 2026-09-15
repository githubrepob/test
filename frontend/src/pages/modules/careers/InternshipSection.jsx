// src/modules/careers/InternshipSection.jsx

import { useState, useEffect } from "react";
import AddInternshipModal from "./AddInternshipModal";
import { getInternships, applyToInternship } from "../../../api/internshipsApi";

const InternshipSection = ({ user }) => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInternships();
      const data = res.data?.internships || res.data || [];
      setInternships(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load internships:", err);
      setError("Failed to load internships. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = internships.filter((i) => {
    const domainStr = i.domain || i.category || i.title || i.role || "";
    return domainStr.toLowerCase().includes(filter.toLowerCase());
  });

  const handleApply = async (id) => {
    try {
      await applyToInternship(id, { resumeUrl: "submitted" });
      setInternships(prev =>
        prev.map(i => {
          if ((i._id || i.id) === id) {
            const count = typeof i.applicants === "number" ? i.applicants + 1 : (i.applicants?.length || 0) + 1;
            return { ...i, applicants: count, hasApplied: true };
          }
          return i;
        })
      );
    } catch (err) {
      console.error("Failed to apply:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Internships</h2>
        {user?.year >= 3 && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Post Opportunity
          </button>
        )}
      </div>

      <input
        placeholder="Filter by domain..."
        className="w-full bg-zinc-800 border border-zinc-700 p-2.5 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        onChange={(e) => setFilter(e.target.value)}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 animate-pulse space-y-3">
              <div className="h-5 bg-zinc-800 rounded w-2/3"></div>
              <div className="h-4 bg-zinc-800/60 rounded w-1/2"></div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-zinc-800/40 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-800/40 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-zinc-800 rounded w-24 mt-4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-zinc-900/40 rounded-xl border border-zinc-800 text-red-400 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
          <p className="text-gray-400 text-sm font-medium">No internships posted yet</p>
          <p className="text-xs text-gray-500 mt-1">Check back later or post a new opportunity above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((internship) => {
            const id = internship._id || internship.id;
            const applicantCount = Array.isArray(internship.applicants)
              ? internship.applicants.length
              : (internship.applicants || 0);

            return (
              <div
                key={id}
                className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-white">{internship.role || internship.title}</h3>
                  <p className="text-sm text-gray-400">{internship.company}</p>

                  <div className="text-sm mt-3 space-y-1 text-gray-300">
                    <p>💰 {internship.stipend || "Unpaid / Disclosed on interview"}</p>
                    <p>⏱️ {internship.duration || "Flexible"}</p>
                    <p>📍 {internship.location || "Remote"}</p>
                  </div>

                  {internship.ppo && (
                    <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-1 rounded-full inline-block mt-3 font-medium">
                      PPO Offered
                    </span>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Applicants: {applicantCount}
                  </p>
                </div>

                <button
                  onClick={() => handleApply(id)}
                  disabled={internship.hasApplied}
                  className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    internship.hasApplied
                      ? "bg-zinc-800 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-500 text-white"
                  }`}
                >
                  {internship.hasApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddInternshipModal
          onClose={() => setShowModal(false)}
          onAdd={(newInternship) =>
            setInternships((prev) => [newInternship, ...prev])
          }
        />
      )}
    </div>
  );
};

export default InternshipSection;