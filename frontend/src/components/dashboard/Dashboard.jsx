import { useState, useEffect } from "react";
import ModuleLayout from "../../components/ModuleLayout";
import PlacementPrediction from "./PlacementPrediction";
import {
  getDashboardData, updateCodingStats, updateAcademicStats,
  syncCodingProfile, getAllCompanyReadiness,
  getPersonalNotes, createPersonalNote, updatePersonalNote, deletePersonalNote,
  updateNotificationPrefs,
} from "../../api/dashboardApi";

import {
  Edit3, Save, X, Code, Target, TrendingUp,
  BookOpen, Flame, Star, Plus, Trash2, Pin,
  ChevronRight, BarChart2, AlertTriangle,
  Bell, StickyNote, Settings,
} from "lucide-react";

const COMPANIES = [
  "TCS", "Infosys", "Wipro", "Accenture", "Capgemini",
  "Cognizant", "Josh Technology", "Juspay",
  "Google", "Amazon", "Microsoft", "Adobe", "Flipkart",
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Coding stats editing
  const [editingStats, setEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({});

  // Academic editing
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [academicForm, setAcademicForm] = useState({});

  // Company readiness
  const [readiness, setReadiness] = useState({});
  const [selectedCompany, setSelectedCompany] = useState("Google");

  // Personal notes
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", color: "#6366f1" });
  const [editingNote, setEditingNote] = useState(null);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({});

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    fetchDashboard();
    fetchNotes();
    fetchReadiness();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getDashboardData();
      setData(res.data);
      setStatsForm(res.data.user.codingStats || {});
      setAcademicForm(res.data.user.academicStats || {});
      setNotifPrefs(res.data.user.notificationPrefs || {});
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchNotes = async () => {
    try {
      const res = await getPersonalNotes();
      setNotes(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchReadiness = async () => {
    try {
      const res = await getAllCompanyReadiness();
      setReadiness(res.data || {});
    } catch (err) { console.error(err); }
  };

  const handleSaveCodingStats = async () => {
    try {
      await updateCodingStats(statsForm);
      setEditingStats(false);
      fetchDashboard();
      fetchReadiness();
    } catch (err) { console.error(err); }
  };

  const handleSyncProfile = async () => {
    const username = (cs.leetcodeUsername || statsForm.leetcodeUsername || "").trim();
    const cfUsername = (cs.codeforcesUsername || statsForm.codeforcesUsername || "").trim();
    if (!username && !cfUsername) {
      setSyncMsg("Enter your LeetCode or Codeforces username in Edit Stats first!");
      setTimeout(() => setSyncMsg(""), 3000);
      return;
    }
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await syncCodingProfile({ leetcodeUsername: username, codeforcesUsername: cfUsername });
      setSyncMsg(res.data.message);
      fetchDashboard();
      fetchReadiness();
    } catch (err) {
      setSyncMsg("Sync failed. Check your username or try again later.");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 5000);
  };

  const handleSaveAcademic = async () => {
    try {
      await updateAcademicStats(academicForm);
      setEditingAcademic(false);
      fetchDashboard();
    } catch (err) { console.error(err); }
  };

  const handleSaveNote = async () => {
    try {
      if (editingNote) {
        await updatePersonalNote(editingNote, noteForm);
      } else {
        await createPersonalNote(noteForm);
      }
      setShowNoteForm(false);
      setEditingNote(null);
      setNoteForm({ title: "", content: "", color: "#6366f1" });
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await deletePersonalNote(id);
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleTogglePin = async (note) => {
    try {
      await updatePersonalNote(note._id, { isPinned: !note.isPinned });
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleNotifPref = async (key, val) => {
    try {
      const updated = { ...notifPrefs, [key]: val };
      setNotifPrefs(updated);
      await updateNotificationPrefs({ [key]: val });
    } catch (err) { console.error(err); }
  };

  if (loading || !data) {
    return (
      <ModuleLayout title="DASHBOARD">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </ModuleLayout>
    );
  }

  const { user, platformStats } = data;
  const cs = user.codingStats || {};
  const ac = user.academicStats || {};
  const totalSolved = (cs.easySolved || 0) + (cs.mediumSolved || 0) + (cs.hardSolved || 0);
  const maxProblems = 500;
  const solvedPercent = Math.min((totalSolved / maxProblems) * 100, 100);

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "coding", label: "Coding Stats", icon: Code },
    { id: "readiness", label: "Company Prep", icon: Target },
    { id: "notes", label: "My Notes", icon: StickyNote },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <ModuleLayout title="" subtitle="">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-3xl font-bold shrink-0">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm text-zinc-400">{user.department} • {user.branch} • Sem {user.semester}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {user.auraPoints} Aura</span>
                {user.skills?.length > 0 && <span>{user.skills.slice(0, 4).join(" • ")}</span>}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-center bg-zinc-800/50 px-5 py-3 rounded-xl">
                <p className="text-2xl font-bold text-green-400">{totalSolved}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Problems</p>
              </div>
              <div className="text-center bg-zinc-800/50 px-5 py-3 rounded-xl">
                <p className="text-2xl font-bold text-yellow-400">{cs.contestRating || 0}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Rating</p>
              </div>
              <div className="text-center bg-zinc-800/50 px-5 py-3 rounded-xl">
                <p className="text-2xl font-bold text-orange-400">{cs.streak || 0}</p>
                <p className="text-[10px] text-zinc-500 uppercase">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* AI Placement Prediction Card */}
            <PlacementPrediction userMetrics={user} />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Problems Solved", value: totalSolved, icon: Code, color: "text-green-400", bg: "from-green-900/30" },
                { label: "Contest Rating", value: cs.contestRating || 0, icon: TrendingUp, color: "text-yellow-400", bg: "from-yellow-900/30" },
                { label: "Events Attended", value: platformStats.eventsAttended, icon: Star, color: "text-blue-400", bg: "from-blue-900/30" },
                { label: "Aura Points", value: user.auraPoints, icon: Flame, color: "text-orange-400", bg: "from-orange-900/30" },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.bg} to-transparent border border-zinc-800 rounded-2xl p-5`}>
                  <stat.icon size={18} className={`${stat.color} mb-2`} />
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Problem Solving Progress - LeetCode Style */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Problem Solving Progress</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Easy", value: cs.easySolved || 0, total: 200, color: "bg-green-500", textColor: "text-green-400" },
                  { label: "Medium", value: cs.mediumSolved || 0, total: 200, color: "bg-yellow-500", textColor: "text-yellow-400" },
                  { label: "Hard", value: cs.hardSolved || 0, total: 100, color: "bg-red-500", textColor: "text-red-400" },
                ].map((d) => (
                  <div key={d.label} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#27272a" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor"
                          className={d.textColor}
                          strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${(d.value / d.total) * 97.4} 97.4`}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${d.textColor}`}>
                        {d.value}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{d.label}</p>
                    <p className="text-[10px] text-zinc-600">/ {d.total}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-800 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all" style={{ width: `${solvedPercent}%` }} />
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-right">{totalSolved} / {maxProblems} total</p>
            </div>

            {/* Top Company Readiness Preview */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Company Readiness</h3>
                <button onClick={() => setActiveTab("readiness")} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {COMPANIES.slice(0, 5).map((comp) => {
                  const r = readiness[comp];
                  if (!r) return null;
                  const score = r.readinessScore;
                  return (
                    <div key={comp} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-zinc-400 mb-1">{comp}</p>
                      <p className={`text-xl font-bold ${score > 70 ? "text-green-400" : score > 50 ? "text-yellow-400" : "text-red-400"}`}>{score}%</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Activity */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Events Registered", value: platformStats.eventsRegistered },
                { label: "Posts Made", value: platformStats.postsCount },
                { label: "Personal Notes", value: platformStats.notesCount },
                { label: "CGPA", value: ac.cgpa || "N/A" },
              ].map((s, i) => (
                <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-zinc-200">{s.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CODING STATS TAB ═══ */}
        {activeTab === "coding" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code size={18} className="text-green-400" /> Problem Solving
                </h3>
              <div className="flex items-center gap-2">
                {!editingStats && (
                  <>
                    <button
                      onClick={handleSyncProfile}
                      disabled={syncing}
                      className="bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition disabled:opacity-60"
                    >
                      <TrendingUp size={12} className={syncing ? "animate-pulse" : ""} />
                      {syncing ? "Syncing..." : "Sync LeetCode"}
                    </button>
                    <button onClick={() => setEditingStats(true)} className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 transition">
                      <Edit3 size={12} /> Edit Stats
                    </button>
                  </>
                )}
                {editingStats && (
                  <div className="flex gap-2">
                    <button onClick={handleSaveCodingStats} className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={() => { setEditingStats(false); setStatsForm(cs); }} className="text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg text-xs border border-zinc-700 transition">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {syncMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${syncMsg.startsWith("✓") ? "bg-green-900/40 text-green-300 border border-green-800/50" : "bg-orange-900/40 text-orange-300 border border-orange-800/50"}`}>
                {syncMsg}
              </div>
            )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "easySolved", label: "Easy Solved", color: "text-green-400" },
                  { key: "mediumSolved", label: "Medium Solved", color: "text-yellow-400" },
                  { key: "hardSolved", label: "Hard Solved", color: "text-red-400" },
                  { key: "contestRating", label: "Contest Rating", color: "text-blue-400" },
                  { key: "contestsAttended", label: "Contests", color: "text-purple-400" },
                  { key: "streak", label: "Day Streak", color: "text-orange-400" },
                  { key: "totalSubmissions", label: "Submissions", color: "text-cyan-400" },
                  { key: "acceptanceRate", label: "Accept Rate %", color: "text-emerald-400" },
                ].map((field) => (
                  <div key={field.key} className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">{field.label}</p>
                    {editingStats ? (
                      <input
                        type="number"
                        value={statsForm[field.key] || 0}
                        onChange={(e) => setStatsForm({ ...statsForm, [field.key]: parseInt(e.target.value) || 0 })}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                      />
                    ) : (
                      <p className={`text-2xl font-bold ${field.color}`}>{cs[field.key] || 0}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Profile Links */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { key: "leetcodeUsername", label: "LeetCode Username" },
                  { key: "codeforcesUsername", label: "Codeforces Username" },
                  { key: "githubUsername", label: "GitHub Username" },
                ].map((field) => (
                  <div key={field.key}>
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">{field.label}</p>
                    {editingStats ? (
                      <input
                        value={statsForm[field.key] || ""}
                        onChange={(e) => setStatsForm({ ...statsForm, [field.key]: e.target.value })}
                        placeholder={field.label}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-sm text-zinc-300">{cs[field.key] || "—"}</p>
                    )}
                  </div>
                ))}
              </div>

              {editingStats && (
                <div className="mt-4">
                  <p className="text-[10px] text-zinc-500 uppercase mb-1">Top Topics (comma separated)</p>
                  <input
                    value={statsForm.topTopics?.join(", ") || ""}
                    onChange={(e) => setStatsForm({ ...statsForm, topTopics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    placeholder="Arrays, Trees, DP, Graphs..."
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            {/* Academic */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-400" /> Academic Stats
                </h3>
                {editingAcademic ? (
                  <button onClick={handleSaveAcademic} className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                    <Save size={12} /> Save
                  </button>
                ) : (
                  <button onClick={() => setEditingAcademic(true)} className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1">
                    <Edit3 size={12} /> Edit
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "cgpa", label: "CGPA" },
                  { key: "college", label: "College" },
                  { key: "coursesCompleted", label: "Courses" },
                  { key: "certifications", label: "Certifications" },
                ].map((f) => (
                  <div key={f.key} className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-[10px] text-zinc-500 uppercase mb-1">{f.label}</p>
                    {editingAcademic ? (
                      <input
                        type={f.key === "college" ? "text" : "number"}
                        step={f.key === "cgpa" ? "0.01" : "1"}
                        value={academicForm[f.key] || ""}
                        onChange={(e) => setAcademicForm({ ...academicForm, [f.key]: f.key === "college" ? e.target.value : parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-xl font-bold text-zinc-200">{ac[f.key] || "—"}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ COMPANY READINESS TAB ═══ */}
        {activeTab === "readiness" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/15 border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Target size={20} className="text-purple-400" /> AI Placement Readiness
              </h3>
              <p className="text-xs text-zinc-500">Personalized readiness scores based on your coding stats, CGPA, skills, and platform activity — updated live from your profile.</p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {COMPANIES.map((comp) => {
                const r = readiness[comp];
                if (!r) return null;
                const score = r.readinessScore;
                const getColor = (s) => s > 80 ? "text-green-400" : s > 60 ? "text-yellow-400" : s > 40 ? "text-orange-400" : "text-red-400";
                const getBg = (s) => s > 80 ? "from-green-900/20" : s > 60 ? "from-yellow-900/20" : s > 40 ? "from-orange-900/20" : "from-red-900/20";
                const getBorder = (s) => s > 80 ? "border-green-800/40" : s > 60 ? "border-yellow-800/40" : s > 40 ? "border-orange-800/40" : "border-red-800/40";

                return (
                  <div key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={`bg-gradient-to-br ${getBg(score)} to-transparent border rounded-2xl p-5 cursor-pointer transition-all ${
                      selectedCompany === comp ? `${getBorder(score)} shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30` : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-base">{comp}</h4>
                        <p className="text-[10px] text-zinc-500">{r.domain}</p>
                        {r.salaryRange && r.salaryRange !== "N/A" && (
                          <span className="text-[10px] text-emerald-400 font-semibold">{r.salaryRange}</span>
                        )}
                      </div>
                      <div className={`text-3xl font-black tabular-nums ${getColor(score)}`}>{score}%</div>
                    </div>

                    {/* Mini breakdown */}
                    <div className="grid grid-cols-4 gap-1.5 text-center mb-2.5">
                      {[
                        { label: "DSA", val: r.breakdown.dsa },
                        { label: "Rating", val: r.breakdown.contestRating },
                        { label: "Dev", val: r.breakdown.development },
                        { label: "AI/ML", val: r.breakdown.aiml },
                      ].map((b) => (
                        <div key={b.label} className="bg-zinc-800/50 rounded-lg p-1.5">
                          <p className="text-[9px] text-zinc-600">{b.label}</p>
                          <p className={`text-xs font-bold ${getColor(b.val)}`}>{b.val}%</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="bg-zinc-800 rounded-full h-1.5 mb-2">
                      <div className={`h-1.5 rounded-full transition-all ${score > 80 ? "bg-green-500" : score > 60 ? "bg-yellow-500" : score > 40 ? "bg-orange-500" : "bg-red-500"}`} style={{ width: `${score}%` }} />
                    </div>

                    {/* PYQ Focus */}
                    {r.pyqFocus?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.pyqFocus.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-md font-medium">#{f}</span>
                        ))}
                      </div>
                    )}

                    {/* Weak areas */}
                    {r.weakAreas[0] !== "None — great shape!" && (
                      <div className="flex items-start gap-1.5 text-[10px] text-orange-400 mt-1">
                        <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                        <span>{r.weakAreas.join(", ")}</span>
                      </div>
                    )}

                    <p className="text-[10px] text-zinc-500 mt-1.5 italic leading-relaxed">{r.suggestion}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ═══ NOTES TAB ═══ */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <StickyNote size={18} className="text-purple-400" /> Personal Notes
              </h3>
              <button
                onClick={() => { setShowNoteForm(true); setEditingNote(null); setNoteForm({ title: "", content: "", color: "#6366f1" }); }}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition"
              >
                <Plus size={14} /> New Note
              </button>
            </div>

            {/* Note Form */}
            {showNoteForm && (
              <div className="bg-zinc-900/80 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                <input
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Note title..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
                />
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Write your note..."
                  rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-500">Color:</label>
                  {["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setNoteForm({ ...noteForm, color: c })}
                      className={`w-6 h-6 rounded-full transition ${noteForm.color === c ? "ring-2 ring-white scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveNote} className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-xl text-sm font-medium transition">
                    {editingNote ? "Update" : "Save"}
                  </button>
                  <button onClick={() => setShowNoteForm(false)} className="text-zinc-400 hover:text-zinc-200 px-4 py-2 rounded-xl text-sm border border-zinc-700 transition">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Notes Grid */}
            {notes.length === 0 ? (
              <div className="text-center py-16">
                <StickyNote size={48} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-zinc-500">No notes yet. Create your first note!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <div key={note._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition group">
                    <div className="h-1" style={{ backgroundColor: note.color }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm flex items-center gap-1.5">
                          {note.isPinned && <Pin size={10} className="text-yellow-400" />}
                          {note.title}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => handleTogglePin(note)} className="p-1 hover:text-yellow-400 transition"><Pin size={12} /></button>
                          <button onClick={() => { setEditingNote(note._id); setNoteForm({ title: note.title, content: note.content, color: note.color }); setShowNoteForm(true); }} className="p-1 hover:text-purple-400 transition"><Edit3 size={12} /></button>
                          <button onClick={() => handleDeleteNote(note._id)} className="p-1 hover:text-red-400 transition"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-4 whitespace-pre-wrap">{note.content}</p>
                      <p className="text-[10px] text-zinc-600 mt-3">
                        {new Date(note.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell size={18} className="text-purple-400" /> Notification Preferences
              </h3>
              <div className="space-y-4">
                {[
                  { key: "events", label: "Events", desc: "New events, registrations, reminders" },
                  { key: "community", label: "Community", desc: "Posts, group activity, mentions" },
                  { key: "internships", label: "Internships & Careers", desc: "New opportunities, application updates" },
                  { key: "messages", label: "Messages", desc: "Direct messages, chat notifications" },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4">
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="text-xs text-zinc-500">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotifPref(pref.key, !notifPrefs[pref.key])}
                      className={`w-12 h-6 rounded-full transition-all flex items-center ${
                        notifPrefs[pref.key] !== false ? "bg-purple-600 justify-end" : "bg-zinc-700 justify-start"
                      }`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full mx-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
