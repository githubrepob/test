import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { getMyApplications } from "../../../api/internshipsApi";
import {
  ArrowLeft, Building2, MapPin, Clock, IndianRupee,
  Eye, MessageCircle, ChevronRight, Briefcase, ExternalLink
} from "lucide-react";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filteredApps = filter
    ? applications.filter((a) => a.application.status === filter)
    : applications;

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: "⏳", label: "Under Review" },
      viewed: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: "👀", label: "Viewed" },
      shortlisted: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: "⭐", label: "Shortlisted" },
      accepted: { bg: "bg-green-500/15 text-green-400 border-green-500/20", icon: "🎉", label: "Accepted" },
      rejected: { bg: "bg-red-500/15 text-red-400 border-red-500/20", icon: "❌", label: "Not Selected" },
    };
    return map[status] || map.pending;
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.application.status === "pending").length,
    viewed: applications.filter((a) => a.application.status === "viewed").length,
    shortlisted: applications.filter((a) => a.application.status === "shortlisted").length,
    accepted: applications.filter((a) => a.application.status === "accepted").length,
    rejected: applications.filter((a) => a.application.status === "rejected").length,
  };

  return (
    <ModuleLayout title="MY APPLICATIONS" subtitle="Track the status of all your internship applications">
      <button
        onClick={() => navigate("/careers/internships")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Internships
      </button>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { label: "All", value: "", count: statusCounts.all },
          { label: "⏳ Pending", value: "pending", count: statusCounts.pending },
          { label: "👀 Viewed", value: "viewed", count: statusCounts.viewed },
          { label: "⭐ Shortlisted", value: "shortlisted", count: statusCounts.shortlisted },
          { label: "🎉 Accepted", value: "accepted", count: statusCounts.accepted },
          { label: "❌ Rejected", value: "rejected", count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition ${
              filter === tab.value
                ? "bg-purple-600 border-purple-500 text-white"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Applications */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading...</div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-400 text-lg">
            {filter ? "No applications with this status" : "You haven't applied to any internships yet"}
          </p>
          <button
            onClick={() => navigate("/careers/internships")}
            className="mt-4 text-purple-400 text-sm hover:text-purple-300"
          >
            Browse Internships →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, idx) => {
            const status = getStatusBadge(app.application.status);
            return (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                    {app.internship.companyLogo ? (
                      <img src={app.internship.companyLogo} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Building2 size={20} className="text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{app.internship.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${status.bg}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 mb-2">{app.internship.company}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={11} /> {app.internship.location}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={11} /> {app.internship.stipend}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {app.internship.duration}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        app.internship.source === "campus"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-blue-500/15 text-blue-400"
                      }`}>
                        {app.internship.source === "campus" ? "Campus" : "External"}
                      </span>
                    </div>

                    {app.application.posterNote && (
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400 mb-3">
                        <span className="text-zinc-500 font-medium">Note from poster: </span>
                        {app.application.posterNote}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-zinc-600">
                      <span>Applied {new Date(app.application.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {(app.application.status === "shortlisted" || app.application.status === "accepted") && app.internship.source !== "external" && (
                        <button
                          onClick={() => navigate("/careers/chat")}
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition"
                        >
                          <MessageCircle size={12} /> Chat with poster
                        </button>
                      )}
                      {app.internship.source === "external" && (app.internship.applyLink || app.internship.sourceUrl) && (
                        <a
                          href={app.internship.applyLink || app.internship.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/15"
                        >
                          <ExternalLink size={11} /> Apply on {app.internship.sourcePlatform || "site"}
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/careers/internships/${app.internship._id}`)}
                    className="text-zinc-600 hover:text-purple-400 transition p-2"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ModuleLayout>
  );
}
