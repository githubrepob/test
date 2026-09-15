import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import {
  getEvents, getTrendingEvents, getEventsByMonth,
  toggleLikeEvent, seedEvents,
} from "../../api/eventsApi";
import { getToken, getUser } from "../../utils/auth";
import {
  Search, Plus, Calendar, MapPin, Users, Heart, Clock,
  ChevronLeft, ChevronRight, Flame, Star, Filter,
  Bookmark, Zap, Award, Globe, Monitor, Ticket,
  ArrowRight, TrendingUp, Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "All", "Technical", "Cultural", "Sports", "Workshop",
  "Seminar", "Fest", "Meetup", "Competition", "Fun", "Other",
];

const CATEGORY_ICONS = {
  Technical: "💻", Cultural: "🎭", Sports: "⚽", Workshop: "🛠️",
  Seminar: "🎤", Fest: "🎪", Meetup: "🤝", Competition: "🏆",
  Fun: "🎉", Other: "📌",
};

const CATEGORY_COLORS = {
  Technical: "from-blue-600 to-cyan-600",
  Cultural: "from-pink-600 to-purple-600",
  Sports: "from-green-600 to-emerald-600",
  Workshop: "from-orange-600 to-amber-600",
  Seminar: "from-indigo-600 to-violet-600",
  Fest: "from-rose-600 to-pink-600",
  Meetup: "from-teal-600 to-cyan-600",
  Competition: "from-yellow-600 to-orange-600",
  Fun: "from-fuchsia-600 to-pink-600",
  Other: "from-zinc-600 to-gray-600",
};

export default function Events() {
  const navigate = useNavigate();
  const user = getUser();
  const token = getToken();

  // State
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState("");
  const [timeFilter, setTimeFilter] = useState("upcoming");

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth() + 1);
  const [calEvents, setCalEvents] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 30, sortBy };
      if (category !== "All") params.category = category;
      if (search) params.search = search;
      if (mode) params.mode = mode;
      if (timeFilter === "upcoming") params.upcoming = "true";
      if (timeFilter === "past") params.past = "true";

      const res = await getEvents(params);
      setEvents(res.data.events || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [category, search, sortBy, mode, timeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fetch trending
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrendingEvents();
        setTrending(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrending();
  }, []);

  // Fetch calendar
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await getEventsByMonth(calYear, calMonth);
        setCalEvents(res.data || {});
      } catch (err) {
        console.error(err);
      }
    };
    fetchCalendar();
  }, [calYear, calMonth]);


  // Like event
  const handleLike = async (e, eventId) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await toggleLikeEvent(eventId);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeed = async () => {
    try {
      await seedEvents();
      await fetchEvents();
      const res = await getTrendingEvents();
      setTrending(res.data || []);
    } catch (err) {
      console.error("Unable to seed events:", err);
    }
  };

  // Date helpers
  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / 3600000);
      if (hours < 24) return `In ${hours}h`;
      const days = Math.floor(hours / 24);
      return `In ${days}d`;
    }
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Calendar helpers
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth - 1, 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDayIndex; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  const formatCalKey = (day) =>
    `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthName = new Date(calYear, calMonth - 1).toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); }
    else setCalMonth(calMonth + 1);
  };

  const isToday = (day) => {
    return day === today.getDate() &&
      calMonth === today.getMonth() + 1 &&
      calYear === today.getFullYear();
  };

  return (
    <ModuleLayout title="EVENTS" subtitle="Discover campus happenings, register, and never miss a moment.">

      {/* ═══ TOP HERO ACTION BAR ═══ */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <form onSubmit={(e) => { e.preventDefault(); fetchEvents(); }} className="flex gap-2 flex-1 max-w-xl">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Search events, workshops, fests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm focus:border-purple-500 outline-none transition"
            />
          </div>
          <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-sm font-medium transition">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700"
          >
            Seed Data
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition ${
              showFilters ? "bg-purple-600 border-purple-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}
          >
            <Filter size={14} /> Filters
          </button>
          {token && (
            <button
              onClick={() => navigate("/events/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-5 py-3 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20"
            >
              <Plus size={16} /> Create Event
            </button>
          )}
        </div>
      </div>

      {/* ═══ FILTERS PANEL ═══ */}
      {showFilters && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6 space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-2">MODE</label>
            <div className="flex gap-2">
              {["", "offline", "online", "hybrid"].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    mode === m ? "bg-purple-600 border-purple-500" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}>
                  {m === "" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-2">SORT</label>
            <div className="flex gap-2">
              {[
                { label: "Date", value: "date" },
                { label: "Newest", value: "newest" },
                { label: "Popular", value: "popular" },
              ].map((s) => (
                <button key={s.value} onClick={() => setSortBy(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                    sortBy === s.value ? "bg-purple-600 border-purple-500" : "border-zinc-700 text-zinc-400"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CATEGORY PILLS ═══ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition ${
              category === cat
                ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            {cat !== "All" && <span>{CATEGORY_ICONS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      {/* ═══ TIME TOGGLE ═══ */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { label: "Upcoming", value: "upcoming" },
          { label: "Past Events", value: "past" },
          { label: "All", value: "" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTimeFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              timeFilter === t.value
                ? "bg-white text-black"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-600">
          {total} event{total !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* ═══ TRENDING SECTION ═══ */}
      {trending.length > 0 && timeFilter === "upcoming" && category === "All" && !search && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Flame size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Trending Now</h2>
              <p className="text-xs text-zinc-500">Most popular upcoming events</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {trending.slice(0, 3).map((event, i) => (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="group relative bg-zinc-900/80 border border-orange-500/20 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10"
              >
                {/* Gradient Top Bar */}
                <div className={`h-1.5 bg-gradient-to-r ${CATEGORY_COLORS[event.category] || "from-orange-500 to-red-500"}`} />

                <div className="p-5">
                  {/* Rank badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-orange-400/30">#{i + 1}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${CATEGORY_COLORS[event.category] || "from-zinc-600 to-zinc-700"} text-white`}>
                      {CATEGORY_ICONS[event.category] || "📌"} {event.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-1 group-hover:text-orange-300 transition line-clamp-2">
                    {event.title}
                  </h3>
                  {event.tagline && (
                    <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{event.tagline}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {formatEventDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {event.attendeesCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={11} className="text-pink-500" /> {event.likes?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ MAIN GRID: Feed + Calendar ═══ */}
      <div className="grid lg:grid-cols-12 gap-8">

        {/* Feed Column */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                  <div className="h-2 bg-zinc-800 rounded w-2/3 mb-3" />
                  <div className="h-5 bg-zinc-800 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-400 text-lg">No events found</p>
              <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or create one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <EventFeedCard
                  key={event._id}
                  event={event}
                  user={user}
                  onLike={handleLike}
                  onClick={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Calendar + Quick Links Column */}
        <div className="lg:col-span-4 space-y-4">

          {/* ═══ COMPACT LIVE CALENDAR ═══ */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar size={12} className="text-purple-400" />
                {monthName} {calYear}
              </h3>
              <div className="flex gap-0.5">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-zinc-800 transition text-zinc-400">
                  <ChevronLeft size={12} />
                </button>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-zinc-800 transition text-zinc-400">
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-zinc-600 mb-0.5 font-medium">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((day, index) => {
                if (!day) return <div key={index} />;
                const key = formatCalKey(day);
                const dayEvents = calEvents[key];
                const todayClass = isToday(day);

                return (
                  <div
                    key={index}
                    className="relative group"
                    onMouseEnter={() => setHoveredDate(dayEvents ? key : null)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <div
                      className={`w-full h-7 flex items-center justify-center rounded text-[10px] cursor-pointer transition-all ${
                        todayClass
                          ? "bg-purple-600 text-white font-bold"
                          : dayEvents
                          ? "bg-purple-600/25 text-purple-300 font-medium"
                          : "text-zinc-500 hover:bg-zinc-800"
                      }`}
                      onClick={() => {
                        if (dayEvents && dayEvents.length > 0) {
                          navigate(`/events/${dayEvents[0].id}`);
                        }
                      }}
                    >
                      {day}
                    </div>

                    {hoveredDate === key && dayEvents && (
                      <div className="absolute z-50 bg-black/95 backdrop-blur-xl border border-zinc-700 rounded-lg p-2.5 text-xs w-48 top-8 left-1/2 -translate-x-1/2 shadow-2xl">
                        <p className="text-zinc-500 mb-1.5 text-[10px] font-medium">
                          {new Date(key).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div key={ev.id} className="mb-1.5 last:mb-0">
                            <p className="text-purple-300 font-medium text-[10px] leading-tight">{ev.title}</p>
                          </div>
                        ))}
                        {dayEvents.length > 3 && <p className="text-zinc-600 text-[9px]">+{dayEvents.length - 3} more</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-2 text-[9px] text-zinc-600 border-t border-zinc-800 pt-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" /> Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600/40" /> Event
              </span>
            </div>
          </div>

          {/* My Created Events */}
          {token && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                <Star size={12} className="text-yellow-400" /> My Events
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => navigate("/events/my")}
                  className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 px-3 py-2.5 rounded-lg text-xs transition"
                >
                  <span>Events I Created</span>
                  <ArrowRight size={12} className="text-zinc-600" />
                </button>
                <button
                  onClick={() => navigate("/events/registered")}
                  className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 px-3 py-2.5 rounded-lg text-xs transition"
                >
                  <span>Events I Registered</span>
                  <ArrowRight size={12} className="text-zinc-600" />
                </button>
                <button
                  onClick={() => navigate("/events/create")}
                  className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/20 hover:border-purple-500/40 px-3 py-2.5 rounded-lg text-xs transition flex items-center gap-1.5"
                >
                  <Plus size={12} className="text-purple-400" /> Create Event
                </button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Zap size={12} className="text-yellow-400" /> Stats
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Total</span>
                <span className="text-white font-medium">{total}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Trending</span>
                <span className="text-orange-400 font-medium">{trending.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}

// ════════════════════════════════════════════
// EVENT FEED CARD
// ════════════════════════════════════════════
function EventFeedCard({ event, user, onLike, onClick }) {
  const isUpcoming = new Date(event.date) > new Date();
  const isPast = !isUpcoming;
  const seatsLeft = event.capacity - (event.attendeesCount || 0);
  const userLiked = user && event.likes?.some((l) => l.toString() === user._id);
  const seatPercent = event.capacity > 0 ? ((event.attendeesCount || 0) / event.capacity * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5"
    >
      {/* Category color bar */}
      <div className={`h-1 bg-gradient-to-r ${CATEGORY_COLORS[event.category] || "from-zinc-600 to-gray-600"}`} />

      <div className="p-6">
        {/* Header Row */}
        <div className="flex items-start gap-4">
          {/* Date Badge */}
          <div className="bg-zinc-800 rounded-xl p-3 text-center shrink-0 w-16">
            <p className="text-lg font-bold leading-none">
              {new Date(event.date).getDate()}
            </p>
            <p className="text-[10px] uppercase text-zinc-500 mt-0.5">
              {new Date(event.date).toLocaleString("en", { month: "short" })}
            </p>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium bg-gradient-to-r ${CATEGORY_COLORS[event.category] || "from-zinc-600 to-gray-600"} text-white`}>
                {CATEGORY_ICONS[event.category]} {event.category}
              </span>
              {event.mode && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                  event.mode === "online" ? "bg-green-500/15 text-green-400" :
                  event.mode === "hybrid" ? "bg-blue-500/15 text-blue-400" :
                  "bg-zinc-800 text-zinc-400"
                }`}>
                  {event.mode === "online" ? "🌐" : event.mode === "hybrid" ? "🔄" : "📍"} {event.mode}
                </span>
              )}
              {event.registrationFee && event.registrationFee !== "Free" && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/15 text-yellow-400">
                  💰 {event.registrationFee}
                </span>
              )}
              {event.registrationFee === "Free" && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/15 text-green-400">
                  ✅ Free
                </span>
              )}
              {isPast && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500">
                  Ended
                </span>
              )}
              {event.isFeatured && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 flex items-center gap-0.5">
                  <Star size={8} /> Featured
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold group-hover:text-purple-300 transition line-clamp-1">
              {event.title}
            </h3>
            {event.tagline && (
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{event.tagline}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-400 mt-3 line-clamp-2">
          {event.description?.replace(/[\n\r]+/g, " ").substring(0, 200)}
        </p>

        {/* Meta Info Grid */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-zinc-600" />
            {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
            {event.time ? ` • ${event.time}` : ` • ${new Date(event.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
          </span>
          {event.venue?.name && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-zinc-600" />
              {event.venue.name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-zinc-600" />
            {event.attendeesCount || 0}/{event.capacity}
            {seatsLeft <= 10 && seatsLeft > 0 && isUpcoming && (
              <span className="text-orange-400 ml-1">({seatsLeft} left!)</span>
            )}
            {seatsLeft <= 0 && <span className="text-red-400 ml-1">(Full)</span>}
          </span>
          {event.auraPointsReward > 0 && (
            <span className="flex items-center gap-1.5">
              <Award size={12} className="text-orange-400" />
              +{event.auraPointsReward} Aura
            </span>
          )}
        </div>

        {/* Seat Progress Bar */}
        {isUpcoming && seatPercent > 0 && (
          <div className="mt-3">
            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${
                  seatPercent > 80 ? "bg-red-500" : seatPercent > 50 ? "bg-yellow-500" : "bg-purple-500"
                }`}
                style={{ width: `${Math.min(seatPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Skills */}
        {event.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {event.skills.slice(0, 5).map((s) => (
              <span key={s} className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] text-zinc-400">{s}</span>
            ))}
          </div>
        )}

        {/* Perks Preview */}
        {event.perks?.length > 0 && (
          <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
            <Sparkles size={11} className="text-yellow-400" />
            {event.perks.slice(0, 3).join(" • ")}
            {event.perks.length > 3 && ` +${event.perks.length - 3} more`}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={(e) => onLike(e, event._id)}
              className={`flex items-center gap-1.5 text-xs transition ${
                userLiked ? "text-pink-400" : "text-zinc-500 hover:text-pink-400"
              }`}
            >
              <Heart size={14} fill={userLiked ? "currentColor" : "none"} />
              {event.likes?.length || 0}
            </button>

            {/* Organizer */}
            {event.organizer && (
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[9px] font-bold">
                  {event.organizer.name?.charAt(0) || "U"}
                </span>
                {event.organizer.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {event.prizes && (
              <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                🏆 Prizes
              </span>
            )}
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              <ArrowRight size={12} /> View Details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
