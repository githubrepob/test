import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getInternships, seedInternships, fetchExternalInternships
} from "../../../api/internshipsApi";
import { getToken, getUser } from "../../../utils/auth";
import {
  Search, Plus, Briefcase, MapPin, Clock, IndianRupee,
  Building2, ChevronRight, Award, Filter, X, RefreshCw,
  Globe, ArrowUpDown, ChevronDown, Bookmark, Users, Zap,
  ExternalLink, GraduationCap, Home
} from "lucide-react";

const DOMAINS = [
  "All Domains", "Full Stack", "Backend", "Software Development",
  "Data Science", "AI/ML", "Design", "DevOps", "Cloud",
  "Marketing", "Product", "Mobile", "Cybersecurity"
];

const LOCATIONS = [
  { label: "All Locations", value: "" },
  { label: "🏠 Work From Home", value: "Remote" },
  { label: "🏢 In Office", value: "Onsite" },
  { label: "🔄 Hybrid", value: "Hybrid" },
];

const DURATIONS = [
  { label: "Any Duration", value: "" },
  { label: "1-2 Months", value: "2 Months" },
  { label: "3-4 Months", value: "3 Months" },
  { label: "5-6 Months", value: "6 Months" },
];

const STIPEND_RANGES = [
  { label: "Any Stipend", min: 0, max: 0 },
  { label: "₹5,000+", min: 5000, max: 0 },
  { label: "₹10,000+", min: 10000, max: 0 },
  { label: "₹20,000+", min: 20000, max: 0 },
  { label: "₹40,000+", min: 40000, max: 0 },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Stipend: High → Low", value: "stipend_high" },
  { label: "Stipend: Low → High", value: "stipend_low" },
  { label: "Most Applicants", value: "applicants" },
  { label: "Deadline Soon", value: "deadline" },
];

const InternshipsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getUser();

  const [internships, setInternships] = useState([]);
  const [total, setTotal] = useState(0);
  const [campusCount, setCampusCount] = useState(0);
  const [externalCount, setExternalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingExternal, setFetchingExternal] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [source, setSource] = useState(searchParams.get("source") || "");
  const [domain, setDomain] = useState(searchParams.get("domain") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [duration, setDuration] = useState("");
  const [stipendRange, setStipendRange] = useState(0);
  const [ppoOnly, setPpoOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchInternships = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy };
      if (search) params.search = search;
      if (source) params.source = source;
      if (domain && domain !== "All Domains") params.domain = domain;
      if (location) params.location = location;
      if (duration) params.duration = duration;
      if (ppoOnly) params.ppo = "true";
      if (STIPEND_RANGES[stipendRange]?.min > 0) {
        params.stipendMin = STIPEND_RANGES[stipendRange].min;
      }

      const res = await getInternships(params);
      setInternships(res.data.internships);
      setTotal(res.data.total);
      setCampusCount(res.data.campusCount);
      setExternalCount(res.data.externalCount);

      // Auto-seed campus if empty
      if (res.data.total === 0 && !seeded) {
        await seedInternships();
        setSeeded(true);
        const res2 = await getInternships(params);
        setInternships(res2.data.internships);
        setTotal(res2.data.total);
        setCampusCount(res2.data.campusCount);
        setExternalCount(res2.data.externalCount);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [source, domain, location, duration, stipendRange, ppoOnly, sortBy, search, seeded]);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleFetchExternal = async () => {
    setFetchingExternal(true);
    try {
      const res = await fetchExternalInternships();
      if (res.data.fetched > 0) {
        fetchInternships();
      }
    } catch (err) {
      console.error(err);
    }
    setFetchingExternal(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSource("");
    setDomain("");
    setLocation("");
    setDuration("");
    setStipendRange(0);
    setPpoOnly(false);
    setSortBy("newest");
  };

  const hasActiveFilters = source || domain || location || duration || stipendRange > 0 || ppoOnly || search;

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="space-y-0">

      {/* ═══ SOURCE TABS ═══ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          {[
            { label: "All Internships", value: "", count: total },
            { label: "🎓 Campus / Local", value: "campus", count: campusCount },
            { label: "🌐 From Platforms", value: "external", count: externalCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSource(tab.value)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                source === tab.value
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                source === tab.value ? "bg-white/20" : "bg-zinc-800"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Fetch External */}
        <button
          onClick={handleFetchExternal}
          disabled={fetchingExternal}
          className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={fetchingExternal ? "animate-spin" : ""} />
          {fetchingExternal ? "Fetching..." : "Refresh Listings"}
        </button>
      </div>

      {/* ═══ CAMPUS VS EXTERNAL EXPLANATION ═══ */}
      {source === "campus" && (
        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <GraduationCap size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm text-emerald-300 font-medium">Campus & Local Opportunities</p>
            <p className="text-xs text-zinc-500">
              Posted by professors, seniors, college departments & local startups. Low competition — apply quickly!
            </p>
          </div>
        </div>
      )}
      {source === "external" && (
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Globe size={20} className="text-blue-400 shrink-0" />
          <div>
            <p className="text-sm text-blue-300 font-medium">External Platform Listings</p>
            <p className="text-xs text-zinc-500">
              Live-fetched from Remotive and other platforms. Apply externally or bookmark for later.
            </p>
          </div>
        </div>
      )}

      {/* ═══ SEARCH & ACTIONS ═══ */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-5">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xl">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search by title, company, skill, domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm focus:border-purple-500 outline-none transition"
            />
          </div>
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-sm font-medium transition">
            Search
          </button>
        </form>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition ${
              showFilters ? "bg-purple-600 border-purple-500" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Filter size={14} /> Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            )}
          </button>

          {getToken() && (
            <button
              onClick={() => navigate("/careers/post")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-5 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20"
            >
              <Plus size={16} /> Post Opportunity
            </button>
          )}
        </div>
      </div>

      {/* ═══ FILTER PANEL ═══ */}
      {showFilters && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                <X size={12} /> Clear All
              </button>
            )}
          </div>

          {/* Domain */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">DOMAIN</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d === "All Domains" ? "" : d)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    (domain === d) || (d === "All Domains" && !domain)
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Location */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">LOCATION</label>
              <div className="space-y-1.5">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc.value}
                    onClick={() => setLocation(loc.value)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                      location === loc.value
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">DURATION</label>
              <div className="space-y-1.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    onClick={() => setDuration(dur.value)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                      duration === dur.value
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stipend */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">MONTHLY STIPEND</label>
              <div className="space-y-1.5">
                {STIPEND_RANGES.map((sr, i) => (
                  <button
                    key={i}
                    onClick={() => setStipendRange(i)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                      stipendRange === i
                        ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                        : "text-zinc-400 hover:bg-zinc-800"
                    }`}
                  >
                    {sr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <label className="block text-xs text-zinc-500 mb-2">MORE</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-zinc-400">
                  <input
                    type="checkbox"
                    checked={ppoOnly}
                    onChange={(e) => setPpoOnly(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  PPO Available
                </label>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">SORT BY</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition flex items-center gap-1 ${
                    sortBy === opt.value
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <ArrowUpDown size={10} /> {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ACTIVE FILTER PILLS ═══ */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {source && (
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              {source === "campus" ? "🎓 Campus" : "🌐 External"}
              <button onClick={() => setSource("")}><X size={10} /></button>
            </span>
          )}
          {domain && (
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              {domain}
              <button onClick={() => setDomain("")}><X size={10} /></button>
            </span>
          )}
          {location && (
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              {location}
              <button onClick={() => setLocation("")}><X size={10} /></button>
            </span>
          )}
          {ppoOnly && (
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              PPO Only
              <button onClick={() => setPpoOnly(false)}><X size={10} /></button>
            </span>
          )}
          {search && (
            <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              "{search}"
              <button onClick={() => setSearch("")}><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* ═══ RESULTS HEADER ═══ */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">
          Showing <span className="text-white font-medium">{internships.length}</span> of{" "}
          <span className="text-white font-medium">{total}</span> internships
        </p>
      </div>

      {/* ═══ INTERNSHIP CARDS ═══ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-zinc-800 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4"></div>
              <div className="flex gap-3">
                <div className="h-3 bg-zinc-800 rounded w-20"></div>
                <div className="h-3 bg-zinc-800 rounded w-20"></div>
                <div className="h-3 bg-zinc-800 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-400 text-lg">No internships match your filters</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or search terms</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-4 text-purple-400 text-sm hover:text-purple-300">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {internships.map((intern) => (
            <div
              key={intern._id}
              className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5"
              onClick={() => navigate(`/careers/internships/${intern._id}`)}
            >
              <div className="flex items-start gap-5">
                {/* Company Logo */}
                <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700 group-hover:border-purple-500/30 transition">
                  {intern.companyLogo ? (
                    <img src={intern.companyLogo} alt={intern.company} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={24} className="text-zinc-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold group-hover:text-purple-300 transition truncate pr-4">
                      {intern.title}
                    </h3>
                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-purple-400 transition shrink-0 mt-1" />
                  </div>

                  {/* Company */}
                  <p className="text-sm text-zinc-400 mb-3">{intern.company}</p>

                  {/* Meta Row — Internshala style */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400 mb-3">
                    {intern.location && (
                      <span className="flex items-center gap-1.5">
                        {intern.location === "Remote" ? <Home size={13} /> : <MapPin size={13} />}
                        {intern.location}
                        {intern.city ? ` • ${intern.city}` : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <IndianRupee size={13} />
                      {intern.stipend}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {intern.duration}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Source badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                      intern.source === "campus"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    }`}>
                      {intern.source === "campus" ? "🎓 Campus" : `🌐 ${intern.sourcePlatform || "External"}`}
                    </span>

                    {intern.ppo && (
                      <span className="bg-purple-500/15 text-purple-400 text-xs px-2.5 py-1 rounded-lg font-medium border border-purple-500/20">
                        <Award size={10} className="inline mr-1" /> PPO
                      </span>
                    )}

                    {intern.isVerified && (
                      <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2.5 py-1 rounded-lg">
                        ✓ Verified
                      </span>
                    )}

                    <span className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-lg capitalize">
                      {intern.type}
                    </span>
                  </div>

                  {/* Skills */}
                  {intern.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {intern.skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="bg-zinc-800/80 px-2.5 py-0.5 rounded text-xs text-zinc-400">
                          {skill}
                        </span>
                      ))}
                      {intern.skills.length > 5 && (
                        <span className="text-xs text-zinc-600">+{intern.skills.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {intern.applicationCount || 0} applicants
                      </span>
                      <span>{getTimeAgo(intern.postedAt || intern.createdAt)}</span>
                      {intern.deadline && (
                        <span className="text-orange-500">
                          Deadline: {new Date(intern.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>

                    {intern.source === "external" && (intern.applyLink || intern.sourceUrl) && (
                      <a
                        href={intern.applyLink || intern.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/15 hover:border-blue-500/30"
                      >
                        <ExternalLink size={10} /> Apply on {intern.sourcePlatform || "site"} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternshipsPage;