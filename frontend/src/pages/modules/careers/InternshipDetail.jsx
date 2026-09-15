import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { getInternshipById, applyToInternship, applyExternally } from "../../../api/internshipsApi";
import { getToken, getUser } from "../../../utils/auth";
import {
  ArrowLeft, Building2, MapPin, Clock, IndianRupee,
  Users, Award, ExternalLink, Briefcase,
  Check, Send, Star, Globe, Home, Share2, Bookmark,
  GraduationCap, Shield, MessageCircle
} from "lucide-react";

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [internship, setInternship] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [myStatus, setMyStatus] = useState("");
  const [applyingExternally, setApplyingExternally] = useState(false);

  useEffect(() => {
    fetchInternship();
    // eslint-disable-next-line
  }, [id]);

  const fetchInternship = async () => {
    try {
      const res = await getInternshipById(id);
      setInternship(res.data);
      const myApp = res.data.applicants?.find(
        (a) => a.user?._id === user?._id || a.user === user?._id
      );
      if (myApp) {
        setHasApplied(true);
        setMyStatus(myApp.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (!getToken()) return alert("Login to apply");
    setApplying(true);
    try {
      await applyToInternship(id, { coverLetter });
      setHasApplied(true);
      setMyStatus("pending");
      setShowApply(false);
      fetchInternship();
    } catch (err) {
      alert(err.response?.data?.message || "Application failed");
    }
    setApplying(false);
  };

  const handleApplyExternally = async () => {
    if (!getToken()) return alert("Login to track applications");
    setApplyingExternally(true);
    try {
      const res = await applyExternally(id);
      setHasApplied(true);
      setMyStatus("pending");

      // Open external link in new tab
      const link = res.data.applyLink || internship.applyLink || internship.sourceUrl;
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
      fetchInternship();
    } catch (err) {
      // If already tracked, still open the link
      const link = internship.applyLink || internship.sourceUrl;
      if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    }
    setApplyingExternally(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", icon: "⏳", label: "Under Review" },
      viewed: { bg: "bg-blue-500/15 text-blue-400 border-blue-500/20", icon: "👀", label: "Application Viewed" },
      shortlisted: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", icon: "⭐", label: "Shortlisted!" },
      accepted: { bg: "bg-green-500/15 text-green-400 border-green-500/20", icon: "🎉", label: "Accepted!" },
      rejected: { bg: "bg-red-500/15 text-red-400 border-red-500/20", icon: "❌", label: "Not Selected" },
    };
    return map[status] || map.pending;
  };

  if (!internship) {
    return (
      <ModuleLayout title="">
        <div className="max-w-4xl mx-auto py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-2/3"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
            <div className="h-40 bg-zinc-800 rounded-2xl"></div>
          </div>
        </div>
      </ModuleLayout>
    );
  }

  const statusInfo = hasApplied ? getStatusBadge(myStatus) : null;

  return (
    <ModuleLayout title="" subtitle="">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/careers/internships")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={16} /> Back to Internships
        </button>

        {/* ═══ HEADER CARD (Internshala-style) ═══ */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700">
              {internship.companyLogo ? (
                <img src={internship.companyLogo} alt={internship.company} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={28} className="text-zinc-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium ${
                  internship.source === "campus"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                }`}>
                  {internship.source === "campus" ? "🎓 Campus" : `🌐 ${internship.sourcePlatform || "External"}`}
                </span>
                {internship.isVerified && (
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <Shield size={10} /> Verified
                  </span>
                )}
                {internship.ppo && (
                  <span className="bg-purple-500/15 text-purple-400 text-xs px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                    PPO
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-1">{internship.title}</h1>
              <p className="text-zinc-400 text-lg">{internship.company}</p>
            </div>

            {/* Share/Bookmark */}
            <div className="flex gap-2">
              <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition text-zinc-400">
                <Share2 size={16} />
              </button>
              <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition text-zinc-400">
                <Bookmark size={16} />
              </button>
            </div>
          </div>

          {/* Key Details Bar (Internshala-style) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                {internship.location === "Remote" ? <Home size={12} /> : <MapPin size={12} />}
                LOCATION
              </p>
              <p className="text-sm font-medium">
                {internship.location}
                {internship.city ? ` • ${internship.city}` : ""}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                <IndianRupee size={12} /> STIPEND
              </p>
              <p className="text-sm font-medium">{internship.stipend}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                <Clock size={12} /> DURATION
              </p>
              <p className="text-sm font-medium">{internship.duration}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                <Users size={12} /> APPLICANTS
              </p>
              <p className="text-sm font-medium">{internship.applicationCount || 0}</p>
            </div>
          </div>

          {/* Extra info */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-zinc-500">
            {internship.openings && (
              <span className="flex items-center gap-1">
                <Briefcase size={11} /> {internship.openings} openings
              </span>
            )}
            {internship.startDate && (
              <span>Starts: {new Date(internship.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            )}
            {internship.deadline && (
              <span className="text-orange-400">
                Apply by: {new Date(internship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
            <span>Posted: {new Date(internship.postedAt || internship.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ═══ MAIN CONTENT ═══ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status Banner */}
            {hasApplied && statusInfo && (
              <div className={`${statusInfo.bg} border rounded-2xl p-5 flex items-center gap-4`}>
                <span className="text-2xl">{statusInfo.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{statusInfo.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {internship.source === "external"
                      ? "Your interest has been tracked. Apply on the external platform to complete your application."
                      : myStatus === "shortlisted" || myStatus === "accepted"
                      ? "Check your messages — the poster may want to chat!"
                      : "You'll be notified when the status changes."}
                  </p>
                </div>
                {(myStatus === "shortlisted" || myStatus === "accepted") && internship.source !== "external" && (
                  <button
                    onClick={() => navigate("/careers/chat")}
                    className="ml-auto bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs transition flex items-center gap-1"
                  >
                    <MessageCircle size={12} /> Open Chat
                  </button>
                )}
              </div>
            )}

            {/* About */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">About the Internship</h2>
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {internship.description}
              </div>
            </div>

            {/* Requirements */}
            {internship.requirements && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">Who Can Apply</h2>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{internship.requirements}</p>
                {internship.whoCanApply && (
                  <div className="mt-3 bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400">
                    <GraduationCap size={14} className="inline mr-1 text-purple-400" />
                    {internship.whoCanApply}
                  </div>
                )}
              </div>
            )}

            {/* Responsibilities */}
            {internship.responsibilities && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">Responsibilities</h2>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{internship.responsibilities}</p>
              </div>
            )}

            {/* Skills */}
            {internship.skills?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill) => (
                    <span key={skill} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {internship.perks?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" /> Perks & Benefits
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {internship.perks.map((perk) => (
                    <span key={perk} className="bg-yellow-500/5 border border-yellow-500/10 text-zinc-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                      <Check size={14} className="text-yellow-400 shrink-0" /> {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Description */}
            {internship.companyDescription && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">About {internship.company}</h2>
                <p className="text-sm text-zinc-300 leading-relaxed">{internship.companyDescription}</p>
              </div>
            )}
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className="space-y-5">
            {/* Apply Card */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 sticky top-20">
              {hasApplied ? (
                <div className="text-center py-2">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${statusInfo.bg} border`}>
                    <span>{statusInfo.icon}</span> {statusInfo.label}
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    {internship.source === "external"
                      ? "Application tracked"
                      : `Applied ${internship.applicants?.find(a => (a.user?._id || a.user) === user?._id)?.appliedAt
                        ? new Date(internship.applicants.find(a => (a.user?._id || a.user) === user?._id).appliedAt).toLocaleDateString()
                        : "recently"}`}
                  </p>
                  {/* Still show external link even after tracking */}
                  {internship.source === "external" && (internship.applyLink || internship.sourceUrl) && (
                    <a
                      href={internship.applyLink || internship.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition border border-blue-500/20"
                    >
                      <ExternalLink size={14} /> Open on {internship.sourcePlatform || "Website"}
                    </a>
                  )}
                </div>
              ) : internship.source === "external" ? (
                <>
                  <button
                    onClick={handleApplyExternally}
                    disabled={applyingExternally}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <ExternalLink size={16} />
                    {applyingExternally ? "Redirecting..." : `Apply on ${internship.sourcePlatform || "Website"}`}
                  </button>
                  <p className="text-xs text-zinc-500 text-center mt-3">
                    Opens the external site — your interest will be tracked in My Applications
                  </p>
                  {(internship.applyLink || internship.sourceUrl) && (
                    <a
                      href={internship.applyLink || internship.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 w-full bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2 transition border border-zinc-700"
                    >
                      <Globe size={13} /> Direct Link: {internship.sourcePlatform || "External Site"}
                    </a>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowApply(true)}
                    className="w-full bg-purple-600 hover:bg-purple-500 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Send size={16} /> Apply Now
                  </button>
                  <p className="text-xs text-zinc-500 text-center mt-2">
                    {internship.applicationCount || 0} already applied
                  </p>
                </>
              )}
            </div>

            {/* Apply Form Modal */}
            {showApply && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Your Application</h3>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a great fit for this role? (Optional but recommended)"
                  rows={5}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    onClick={() => setShowApply(false)}
                    className="px-4 py-2.5 text-zinc-400 text-sm hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Details Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Domain", value: internship.domain },
                  { label: "Type", value: <span className="capitalize">{internship.type}</span> },
                  { label: "Experience", value: internship.experience },
                  { label: "Stipend", value: internship.stipend },
                  { label: "Duration", value: internship.duration },
                  { label: "Location", value: `${internship.location}${internship.city ? ` • ${internship.city}` : ""}` },
                  { label: "Openings", value: internship.openings },
                  { label: "Source", value: internship.source === "external" ? `${internship.sourcePlatform || "External"}` : "Campus" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-zinc-400">
                    <span>{item.label}</span>
                    <span className="text-zinc-300 text-right">{item.value}</span>
                  </div>
                ))}
                {internship.deadline && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Deadline</span>
                    <span className="text-orange-400">{new Date(internship.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Posted By */}
            {internship.postedBy && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Posted By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {internship.postedBy?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{internship.postedBy?.name || "Anonymous"}</p>
                    <p className="text-xs text-zinc-500">
                      {internship.postedBy?.department || ""}{" "}
                      {internship.postedBy?.role && internship.postedBy.role !== "user" && `• ${internship.postedBy.role}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Source info for external */}
            {internship.source === "external" && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-400">
                  <Globe size={14} /> External Listing
                </h3>
                <p className="text-xs text-zinc-400 mb-3">
                  This opportunity was fetched from <span className="text-blue-400 font-medium">{internship.sourcePlatform || "an external platform"}</span>.
                  Apply directly on their website.
                </p>
                {(internship.applyLink || internship.sourceUrl) && (
                  <a
                    href={internship.applyLink || internship.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <ExternalLink size={11} /> {internship.sourcePlatform || "Visit"} →
                  </a>
                )}
              </div>
            )}

            {/* Similar Roles CTA */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 text-center">
              <p className="text-xs text-zinc-500 mb-2">Looking for more?</p>
              <button
                onClick={() => navigate(`/careers/internships?domain=${encodeURIComponent(internship.domain)}`)}
                className="text-sm text-purple-400 hover:text-purple-300 transition"
              >
                View similar {internship.domain} internships →
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
