import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { getInternshipById, updateApplicantStatus } from "../../../api/internshipsApi";
import {
  ArrowLeft, User, Eye, Star, Check, X, MessageCircle,
  Clock, ChevronDown
} from "lucide-react";

export default function ManageApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [filter, setFilter] = useState("");
  const [noteInputs, setNoteInputs] = useState({});
  const [processing, setProcessing] = useState("");

  useEffect(() => {
    fetchInternship();
    // eslint-disable-next-line
  }, [id]);

  const fetchInternship = async () => {
    try {
      const res = await getInternshipById(id);
      setInternship(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (applicantId, status) => {
    setProcessing(applicantId);
    try {
      await updateApplicantStatus(id, {
        applicantId,
        status,
        note: noteInputs[applicantId] || "",
      });
      fetchInternship();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
    setProcessing("");
  };

  if (!internship) {
    return (
      <ModuleLayout title="Loading...">
        <div className="text-center py-20 text-zinc-500">Loading...</div>
      </ModuleLayout>
    );
  }

  const applicants = internship.applicants || [];
  const filtered = filter
    ? applicants.filter((a) => a.status === filter)
    : applicants;

  const statusColors = {
    pending: "text-yellow-400",
    viewed: "text-blue-400",
    shortlisted: "text-emerald-400",
    accepted: "text-green-400",
    rejected: "text-red-400",
  };

  return (
    <ModuleLayout title="" subtitle="">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h1 className="text-xl font-bold mb-1">Manage Applicants</h1>
          <p className="text-zinc-400">{internship.title} at {internship.company}</p>
          <p className="text-xs text-zinc-500 mt-2">{applicants.length} total applicants</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { label: "All", value: "", count: applicants.length },
            { label: "⏳ Pending", value: "pending" },
            { label: "👀 Viewed", value: "viewed" },
            { label: "⭐ Shortlisted", value: "shortlisted" },
            { label: "✅ Accepted", value: "accepted" },
            { label: "❌ Rejected", value: "rejected" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                filter === tab.value
                  ? "bg-purple-600 border-purple-500"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </div>

        {/* Applicants List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <User size={40} className="mx-auto text-zinc-700 mb-3" />
            <p>No applicants found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <div key={app._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg font-bold shrink-0">
                    {app.user?.name?.charAt(0) || "U"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + Status */}
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{app.user?.name || "Unknown"}</h3>
                      <span className={`text-xs font-medium capitalize ${statusColors[app.status]}`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mb-3">
                      {app.user?.department && <span>{app.user.department}</span>}
                      {app.user?.yearOfStudy && <span>Year {app.user.yearOfStudy}</span>}
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        Applied {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>

                    {/* Skills */}
                    {app.user?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {app.user.skills.slice(0, 6).map((s) => (
                          <span key={s} className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400 mb-3">
                        <p className="text-xs text-zinc-500 mb-1 font-medium">Cover Letter:</p>
                        {app.coverLetter}
                      </div>
                    )}

                    {/* Poster Note */}
                    <div className="mb-3">
                      <input
                        value={noteInputs[app.user?._id] || app.posterNote || ""}
                        onChange={(e) => setNoteInputs({ ...noteInputs, [app.user?._id]: e.target.value })}
                        placeholder="Add a note for this applicant..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "viewed")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-blue-600/30 transition"
                          >
                            <Eye size={12} /> Mark Viewed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "shortlisted")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600/30 transition"
                          >
                            <Star size={12} /> Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "rejected")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-red-600/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-red-600/20 transition"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {app.status === "viewed" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "shortlisted")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-600/30 transition"
                          >
                            <Star size={12} /> Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "rejected")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs hover:bg-red-600/20 transition"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {app.status === "shortlisted" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "accepted")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-green-600/20 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-green-600/30 transition"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => navigate("/careers/chat")}
                            className="flex items-center gap-1 bg-purple-600/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-purple-600/30 transition"
                          >
                            <MessageCircle size={12} /> Chat
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.user?._id, "rejected")}
                            disabled={processing === app.user?._id}
                            className="flex items-center gap-1 bg-red-600/10 text-red-400 px-3 py-1.5 rounded-lg text-xs hover:bg-red-600/20 transition"
                          >
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {app.status === "accepted" && (
                        <button
                          onClick={() => navigate("/careers/chat")}
                          className="flex items-center gap-1 bg-purple-600/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs hover:bg-purple-600/30 transition"
                        >
                          <MessageCircle size={12} /> Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
