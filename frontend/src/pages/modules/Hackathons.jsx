import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { getHackathons } from "../../api/hackathonsApi";
import { getToken } from "../../utils/auth";
import {
  Search, Plus, Calendar, MapPin, Users, Globe,
  Trophy, Clock, Monitor, Zap, ChevronRight
} from "lucide-react";

export default function Hackathons() {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");

  useEffect(() => {
    fetchHackathons();
  }, [status, mode]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      if (mode) params.mode = mode;
      const res = await getHackathons(params);
      setHackathons(res.data.hackathons);
      setTotal(res.data.total);


    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHackathons();
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "upcoming": return "bg-emerald-500/20 text-emerald-400";
      case "ongoing": return "bg-orange-500/20 text-orange-400";
      case "completed": return "bg-zinc-500/20 text-zinc-400";
      default: return "bg-zinc-500/20 text-zinc-400";
    }
  };

  const getModeIcon = (m) => {
    switch (m) {
      case "Online": return <Monitor size={14} />;
      case "Offline": return <MapPin size={14} />;
      case "Hybrid": return <Globe size={14} />;
      default: return <Globe size={14} />;
    }
  };

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Ended";
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  return (
    <ModuleLayout
      title="HACKATHONS"
      subtitle="Discover hackathons from Devfolio, Unstop, and campus. Compete, build, and win!"
    >
      {/* Search & Create */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search hackathons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:border-emerald-500 outline-none transition"
            />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl text-sm transition">
            Search
          </button>
        </form>

        {getToken() && (
          <div className="flex gap-2">
          <button onClick={() => navigate("/hackathons/my")} className="px-4 py-2.5 rounded-xl border border-zinc-700 text-sm hover:border-emerald-500 transition">Organizer Dashboard</button>
          <button
            onClick={() => navigate("/hackathons/create")}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Create Hackathon
          </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-10">
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "🟢 Upcoming", value: "upcoming" },
            { label: "🔴 Live", value: "ongoing" },
            { label: "⚫ Completed", value: "completed" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                status === s.value
                  ? "bg-emerald-600 border-emerald-500"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {[
            { label: "All Modes", value: "" },
            { label: "Online", value: "Online" },
            { label: "Offline", value: "Offline" },
            { label: "Hybrid", value: "Hybrid" },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                mode === m.value
                  ? "bg-teal-600 border-teal-500"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{total}</p>
          <p className="text-xs text-zinc-500 mt-1">Hackathons</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {hackathons.filter((h) => h.status === "upcoming").length}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Upcoming</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {hackathons.reduce((sum, h) => sum + (h.participantCount || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Participants</p>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            <Trophy size={24} className="inline" />
          </p>
          <p className="text-xs text-zinc-500 mt-1">Win Prizes</p>
        </div>
      </div>

      {/* Hackathon Cards */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading hackathons...</div>
      ) : hackathons.length === 0 ? (
        <div className="text-center py-20">
          <Trophy size={48} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-lg">No hackathons found</p>
        </div>
      ) : (
        <div className="space-y-5">
          {hackathons.map((hack) => (
            <div
              key={hack._id}
              onClick={() => navigate(`/hackathons/${hack._id}`)}
              className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="flex flex-col md:flex-row gap-5">
                {/* Left — Banner placeholder */}
                <div className="w-full md:w-48 h-32 rounded-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <Trophy size={40} className="text-emerald-500/40" />
                </div>

                {/* Right */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hack.status)}`}>
                      {hack.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      {getModeIcon(hack.mode)} {hack.mode}
                    </span>
                    {hack.source !== "user" && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                        {hack.source}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-300 transition">
                    {hack.title}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-3">by {hack.organizer}</p>

                  <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                    {hack.description}
                  </p>

                  {/* Meta Row */}
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(hack.startDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {daysUntil(hack.startDate)}
                    </span>
                    {hack.venue?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {hack.venue.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {hack.participantCount?.toLocaleString() || 0} participants
                    </span>
                    {hack.prizePool && (
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Trophy size={12} /> {hack.prizePool}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-orange-400">
                      <Zap size={12} /> +{hack.auraPointsReward} Aura
                    </span>
                  </div>

                  {/* Themes */}
                  {hack.themes?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hack.themes.slice(0, 5).map((t) => (
                        <span key={t} className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center">
                  <ChevronRight size={20} className="text-zinc-700 group-hover:text-emerald-400 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModuleLayout>
  );
}
