import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import {
  getEventById, toggleLikeEvent, toggleInterested,
  toggleBookmark, registerForEvent,
  getEventComments, addEventComment,
} from "../../api/eventsApi";
import { getToken, getUser } from "../../utils/auth";
import {
  ArrowLeft, Calendar, MapPin, Users, Heart, Clock,
  Award, Globe, Monitor, Ticket, Share2, Bookmark,
  Star, Zap, MessageCircle, Send, Check, ChevronRight,
  ExternalLink, User, Shield, Trophy, Gift, BookOpen,
} from "lucide-react";

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

const CATEGORY_ICONS = {
  Technical: "💻", Cultural: "🎭", Sports: "⚽", Workshop: "🛠️",
  Seminar: "🎤", Fest: "🎪", Meetup: "🤝", Competition: "🏆",
  Fun: "🎉", Other: "📌",
};

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const token = getToken();

  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchEvent();
    fetchComments();
    // eslint-disable-next-line
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await getEventById(eventId);
      const data = res.data;
      setEvent(data);
      setIsRegistered(data.isRegistered || false);
      setIsInterested(data.isInterested || false);
      setLiked(data.likes?.some((l) => l.toString() === user?._id) || false);
      setLikesCount(data.likes?.length || 0);
      setIsBookmarked(data.bookmarks?.some((b) => b.toString() === user?._id) || false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await getEventComments(eventId);
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!token) return alert("Login to register");
    setRegistering(true);
    try {
      await registerForEvent(eventId);
      setIsRegistered(true);
      fetchEvent();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
    setRegistering(false);
  };

  const handleLike = async () => {
    if (!token) return;
    try {
      const res = await toggleLikeEvent(eventId);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInterested = async () => {
    if (!token) return;
    try {
      const res = await toggleInterested(eventId);
      setIsInterested(res.data.interested);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!token) return;
    try {
      const res = await toggleBookmark(eventId);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !token) return;
    try {
      await addEventComment(eventId, { text: commentText });
      setCommentText("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  if (!event) {
    return (
      <ModuleLayout title="">
        <div className="max-w-5xl mx-auto py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-2/3" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-48 bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </ModuleLayout>
    );
  }

  const isUpcoming = new Date(event.date) > new Date();
  const seatsLeft = event.capacity - (event.attendeesCount || 0);
  const seatPercent = event.capacity > 0 ? ((event.attendeesCount || 0) / event.capacity) * 100 : 0;
  const gradientClass = CATEGORY_COLORS[event.category] || "from-purple-600 to-pink-600";

  return (
    <ModuleLayout title="" subtitle="">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate("/events")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition text-sm"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>

        {/* ═══ HERO BANNER ═══ */}
        <div className="relative rounded-2xl overflow-hidden mb-6">
          {event.banner?.url ? (
            <img src={event.banner.url} alt={event.title} className="w-full h-72 object-cover" />
          ) : (
            <div className={`w-full h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <span className="text-6xl">{CATEGORY_ICONS[event.category] || "📌"}</span>
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content over banner */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r ${gradientClass} text-white font-medium`}>
                {CATEGORY_ICONS[event.category]} {event.category}
              </span>
              {event.mode && (
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                  event.mode === "online" ? "bg-green-500/20 text-green-400 border border-green-500/20" :
                  event.mode === "hybrid" ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" :
                  "bg-zinc-700/50 text-zinc-300"
                }`}>
                  {event.mode === "online" ? "🌐 Online" : event.mode === "hybrid" ? "🔄 Hybrid" : "📍 Offline"}
                </span>
              )}
              {event.isFeatured && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  <Star size={10} className="inline mr-1" /> Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-1">{event.title}</h1>
            {event.tagline && <p className="text-zinc-400">{event.tagline}</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ═══ MAIN CONTENT ═══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Key Details Bar */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                    <Calendar size={12} /> DATE
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {event.endDate && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      to {new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                    <Clock size={12} /> TIME
                  </p>
                  <p className="text-sm font-medium">{event.time || new Date(event.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                    <MapPin size={12} /> VENUE
                  </p>
                  <p className="text-sm font-medium">{event.venue?.name || "TBA"}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500 mb-1 flex items-center justify-center gap-1">
                    <Ticket size={12} /> FEE
                  </p>
                  <p className="text-sm font-medium">{event.registrationFee || "Free"}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">About This Event</h2>
              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Prizes */}
            {event.prizes && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400" /> Prizes & Rewards
                </h2>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{event.prizes}</p>
                {event.auraPointsReward > 0 && (
                  <div className="mt-3 bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 flex items-center gap-2 text-sm">
                    <Zap size={14} className="text-orange-400" />
                    <span className="text-orange-300 font-medium">+{event.auraPointsReward} Aura Points</span>
                    <span className="text-zinc-500">for attending</span>
                  </div>
                )}
              </div>
            )}

            {/* Schedule */}
            {event.schedule?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-400" /> Event Schedule
                </h2>
                <div className="space-y-3">
                  {event.schedule.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      {/* Timeline line */}
                      {i < event.schedule.length - 1 && (
                        <div className="absolute left-[11px] top-6 w-0.5 h-full bg-zinc-800" />
                      )}
                      <div className="w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-400 font-medium">{item.time}</p>
                        <p className="text-sm text-zinc-300">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={16} className="text-blue-400" /> Speakers
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {event.speakers.map((speaker, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {speaker.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{speaker.name}</p>
                        <p className="text-xs text-zinc-500">{speaker.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills / Tags */}
            {event.skills?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">Skills & Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {event.skills.map((skill) => (
                    <span key={skill} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {event.perks?.length > 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Gift size={16} className="text-pink-400" /> What You Get
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {event.perks.map((perk) => (
                    <span key={perk} className="bg-pink-500/5 border border-pink-500/10 text-zinc-300 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                      <Check size={14} className="text-pink-400 shrink-0" /> {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Eligibility / Rules */}
            {(event.eligibility || event.rules || event.teamSize) && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" /> Eligibility & Rules
                </h2>
                {event.eligibility && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-1">WHO CAN PARTICIPATE</p>
                    <p className="text-sm text-zinc-300">{event.eligibility}</p>
                  </div>
                )}
                {event.teamSize && (
                  <div className="mb-3">
                    <p className="text-xs text-zinc-500 mb-1">TEAM SIZE</p>
                    <p className="text-sm text-zinc-300">{event.teamSize}</p>
                  </div>
                )}
                {event.rules && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">RULES</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{event.rules}</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ MAP ═══ */}
            {event.venue?.latitude && event.venue.latitude !== 0 && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-red-400" /> Event Location
                </h2>
                {event.venue.name && <p className="text-sm text-zinc-400 mb-1">{event.venue.name}</p>}
                {event.venue.address && <p className="text-xs text-zinc-600 mb-3">{event.venue.address}</p>}
                <div className="rounded-xl overflow-hidden border border-zinc-700">
                  <iframe
                    title="Event Location Map"
                    width="100%"
                    height="300"
                    loading="lazy"
                    className="w-full"
                    src={`https://www.google.com/maps?q=${event.venue.latitude},${event.venue.longitude}&z=15&output=embed`}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latitude},${event.venue.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  <ExternalLink size={11} /> Get Directions
                </a>
              </div>
            )}

            {/* ═══ COMMENTS / DISCUSSION ═══ */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-purple-400" /> Discussion ({comments.length})
              </h2>

              {/* Comment input */}
              {token && (
                <div className="flex gap-2 mb-5">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Ask something or share your thoughts..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">No comments yet. Be the first to ask!</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="bg-zinc-800/50 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {c.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{c.user?.name || "User"}</p>
                          <span className="text-[10px] text-zinc-600">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className="space-y-5">

            {/* Registration Card */}
            <div className={`bg-gradient-to-br ${gradientClass.replace("from-", "from-").replace("to-", "to-")}/20 border border-purple-500/20 rounded-2xl p-6 sticky top-20`}>
              {/* Seats */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-zinc-400 mb-2">
                  <span>{event.attendeesCount || 0} registered</span>
                  <span>{event.capacity} total</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      seatPercent > 80 ? "bg-red-500" : seatPercent > 50 ? "bg-yellow-500" : `bg-gradient-to-r ${gradientClass}`
                    }`}
                    style={{ width: `${Math.min(seatPercent, 100)}%` }}
                  />
                </div>
                {isUpcoming && seatsLeft > 0 && seatsLeft <= 20 && (
                  <p className="text-xs text-orange-400 mt-1">Only {seatsLeft} seats left!</p>
                )}
              </div>

              {/* Register Button */}
              {isUpcoming ? (
                isRegistered ? (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <Check size={14} /> Registered!
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">See you at the event 🎉</p>
                  </div>
                ) : seatsLeft <= 0 ? (
                  <button disabled className="w-full bg-zinc-700 py-3.5 rounded-xl text-sm font-medium cursor-not-allowed">
                    Event Full
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className={`w-full bg-gradient-to-r ${gradientClass} hover:opacity-90 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50`}
                  >
                    <Ticket size={16} />
                    {registering ? "Registering..." : `Register Now ${event.registrationFee && event.registrationFee !== "Free" ? `• ${event.registrationFee}` : "• Free"}`}
                  </button>
                )
              ) : (
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-zinc-800 text-zinc-500">
                    Event has ended
                  </div>
                </div>
              )}

              {/* Aura Points */}
              {event.auraPointsReward > 0 && (
                <div className="mt-3 bg-orange-500/10 border border-orange-500/15 rounded-xl p-3 text-center">
                  <p className="text-sm text-orange-300 font-medium flex items-center justify-center gap-1.5">
                    <Zap size={14} /> +{event.auraPointsReward} Aura Points
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Awarded on attendance</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm border transition ${
                    liked ? "border-pink-500/30 bg-pink-500/10 text-pink-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likesCount}
                </button>
                <button
                  onClick={handleInterested}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm border transition ${
                    isInterested ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <Star size={14} fill={isInterested ? "currentColor" : "none"} /> Interested
                </button>
                <button
                  onClick={handleBookmark}
                  className={`py-2.5 px-3 rounded-xl text-sm border transition ${
                    isBookmarked ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <Bookmark size={14} fill={isBookmarked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-3">Event Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Category", value: `${CATEGORY_ICONS[event.category] || ""} ${event.category}` },
                  { label: "Mode", value: event.mode?.charAt(0).toUpperCase() + event.mode?.slice(1) },
                  { label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
                  { label: "Time", value: event.time || "TBA" },
                  { label: "Venue", value: event.venue?.name || "TBA" },
                  { label: "Capacity", value: event.capacity },
                  { label: "Fee", value: event.registrationFee || "Free" },
                  event.teamSize ? { label: "Team Size", value: event.teamSize } : null,
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex justify-between text-zinc-400">
                    <span>{item.label}</span>
                    <span className="text-zinc-300 text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Organized By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {event.organizer.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{event.organizer.name}</p>
                    <p className="text-xs text-zinc-500">
                      {event.organizer.department || ""}
                      {event.organizer.role && event.organizer.role !== "user" ? ` • ${event.organizer.role}` : ""}
                    </p>
                  </div>
                </div>
                {event.contactEmail && (
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    📧 {event.contactEmail}
                  </p>
                )}
                {event.contactPhone && (
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    📞 {event.contactPhone}
                  </p>
                )}
              </div>
            )}

            {/* Meet Link */}
            {event.meetLink && (event.mode === "online" || event.mode === "hybrid") && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-400">
                  <Monitor size={14} /> Online Access
                </h3>
                {isRegistered ? (
                  <a href={event.meetLink} target="_blank" rel="noreferrer"
                    className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition">
                    <Globe size={11} /> {event.meetLink}
                  </a>
                ) : (
                  <p className="text-xs text-zinc-500">Register to get the meeting link</p>
                )}
              </div>
            )}

            {/* Website */}
            {event.website && (
              <a href={event.website} target="_blank" rel="noreferrer"
                className="block bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition">
                <p className="text-sm flex items-center gap-2 text-purple-400">
                  <Globe size={14} /> Event Website <ExternalLink size={11} className="ml-auto" />
                </p>
              </a>
            )}

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied!");
              }}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition text-sm text-zinc-400 flex items-center justify-center gap-2"
            >
              <Share2 size={14} /> Share Event
            </button>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}