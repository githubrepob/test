import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, Flame, Sparkles } from "lucide-react";
import { getNotifications, markAllNotificationsRead, getMyProfile } from "../api/internshipsApi";


const MODULE_LINKS = [
  { name: "Notes", path: "/notes" },
  { name: "AI Interview", path: "/interview-prep" },
  { name: "Company PYQ Mocks", path: "/company-mocks" },
  { name: "Hackathons", path: "/hackathons" },
  { name: "Community", path: "/community" },
  { name: "Events", path: "/events" },
  { name: "Careers", path: "/careers" },
  { name: "Tech Issues", path: "/tech-issues" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [auraPoints, setAuraPoints] = useState(0);
  const [auraAnimating, setAuraAnimating] = useState(false);
  const prevAuraRef = useRef(0);

  // Load user from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("campusconnect_token");
    const storedUser = JSON.parse(
      localStorage.getItem("campusconnect_user") || "null"
    );

    setToken(storedToken);
    setUser(storedUser);
    if (storedUser?.auraPoints !== undefined) {
      setAuraPoints(storedUser.auraPoints);
      prevAuraRef.current = storedUser.auraPoints;
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch notifications + fresh aura points
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchFreshAura();
    }
  }, [token]);

  // Refresh aura points on route change
  useEffect(() => {
    if (token) {
      fetchFreshAura();
    }
  }, [location.pathname, token]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Silently fail
    }
  };

  const fetchFreshAura = async () => {
    try {
      const res = await getMyProfile();
      const freshPoints = res.data?.auraPoints ?? 0;
      if (freshPoints !== prevAuraRef.current) {
        setAuraAnimating(true);
        setTimeout(() => setAuraAnimating(false), 1200);
        prevAuraRef.current = freshPoints;
      }
      setAuraPoints(freshPoints);
      // Update localStorage for consistency
      const storedUser = JSON.parse(localStorage.getItem("campusconnect_user") || "null");
      if (storedUser) {
        storedUser.auraPoints = freshPoints;
        localStorage.setItem("campusconnect_user", JSON.stringify(storedUser));
      }
    } catch (err) {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("campusconnect_token");
    localStorage.removeItem("campusconnect_user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="font-display text-lg tracking-widest text-white/90 hover:text-white transition"
          >
            uniVerse
          </Link>

          {token && (
            <div className="hidden md:flex items-center gap-6 text-xs font-display uppercase tracking-widest">
              {MODULE_LINKS.map((mod) => (
                <Link
                  key={mod.name}
                  to={mod.path}
                  className={`transition ${
                    location.pathname.startsWith(mod.path)
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {mod.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* 🔥 Aura Points — Prominent Display */}
          {token && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-500 ${
                auraAnimating
                  ? "bg-gradient-to-r from-orange-500/30 to-amber-500/30 border border-orange-500/40 scale-110"
                  : "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/15"
              }`}
            >
              <div className={`relative ${auraAnimating ? "animate-bounce" : ""}`}>
                <Flame size={16} className="text-orange-400" />
                {auraAnimating && (
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                )}
              </div>
              <span className={`font-bold text-sm tracking-wide transition-all duration-500 ${
                auraAnimating ? "text-orange-300 scale-110" : "text-orange-400"
              }`}>
                {auraPoints.toLocaleString()}
              </span>
              <span className="text-[10px] text-orange-400/60 font-medium uppercase tracking-wider hidden sm:inline">
                Aura
              </span>
            </div>
          )}

          {/* Notifications */}
          {token && (
            <div className="relative">
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative text-white/60 hover:text-white transition"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 p-4 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => {
                            setShowNotif(false);
                            if (notif.link) navigate(notif.link);
                          }}
                          className={`block w-full text-left px-4 py-3 hover:bg-white/5 transition border-b border-white/5 ${
                            !notif.isRead ? "bg-indigo-500/5" : ""
                          }`}
                        >
                          <p className="text-xs font-medium">{notif.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!token ? (
            <div className="flex items-center gap-8 text-sm font-display uppercase tracking-widest">
              <Link
                to="/login"
                className="text-white/60 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white/80 hover:text-white transition"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 rounded-full bg-white/90 text-black text-sm font-medium flex items-center justify-center hover:bg-white transition"
              >
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-44 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="block w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}