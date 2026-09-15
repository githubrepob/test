import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { getHackathonById, toggleInterest, registerTeam, withdrawTeam } from "../../api/hackathonsApi";
import { getToken, getUser } from "../../utils/auth";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Calendar, MapPin, Users, Trophy, Globe, Clock, Heart,
  ExternalLink, Mail, ArrowLeft, Zap, UserPlus, Check, Monitor
} from "lucide-react";

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function HackathonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const user = getUser();

  useEffect(() => {
    fetchHackathon();
  }, [id]);

  const fetchHackathon = async () => {
    try {
      const res = await getHackathonById(id);
      setHackathon(res.data);
      setIsInterested(
        res.data.interestedUsers?.some((u) => u._id === user?._id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleInterest = async () => {
    if (!getToken()) return alert("Login to mark interest");
    try {
      const res = await toggleInterest(id);
      setIsInterested(res.data.isInterested);
      fetchHackathon();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const myTeam = hackathon?.registeredTeams?.find((team) => team.members?.some((m) => (m._id || m).toString() === user?._id?.toString()));

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw your team registration?")) return;
    try {
      await withdrawTeam(id);
      alert("Team registration withdrawn");
      fetchHackathon();
    } catch (err) { alert(err.response?.data?.message || "Withdrawal failed"); }
  };

  const handleRegister = async () => {
    if (!getToken()) return alert("Login to register");
    try {
      await registerTeam(id, { teamName });
      alert("Team registered! 🎉");
      setShowRegister(false);
      fetchHackathon();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (!hackathon) {
    return (
      <ModuleLayout title="Loading...">
        <div className="text-center py-20 text-zinc-500">Loading hackathon details...</div>
      </ModuleLayout>
    );
  }

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Ended";
    if (days === 0) return "Today!";
    return `${days} days left`;
  };

  const hasLocation = hackathon.venue?.latitude && hackathon.venue?.longitude;

  return (
    <ModuleLayout title="" subtitle="">
      <button
        onClick={() => navigate("/hackathons")}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Hackathons
      </button>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-cyan-900/40 border border-emerald-500/20 rounded-2xl p-8 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              hackathon.status === "upcoming" ? "bg-emerald-500/20 text-emerald-400" :
              hackathon.status === "ongoing" ? "bg-orange-500/20 text-orange-400" :
              "bg-zinc-500/20 text-zinc-400"
            }`}>
              {hackathon.status}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              {hackathon.mode === "Online" ? <Monitor size={12} /> : <MapPin size={12} />}
              {hackathon.mode}
            </span>
            {hackathon.source !== "user" && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs">
                via {hackathon.source}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-2">{hackathon.title}</h1>
          <p className="text-zinc-400 mb-1">Organized by <span className="text-zinc-200">{hackathon.organizer}</span></p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(hackathon.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {" — "}
              {new Date(hackathon.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {daysUntil(hackathon.startDate)}
            </span>
            {hackathon.venue?.city && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {hackathon.venue.name}, {hackathon.venue.city}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-zinc-300 leading-relaxed">{hackathon.description}</p>
          </div>

          {/* Themes */}
          {hackathon.themes?.length > 0 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">Themes & Tracks</h2>
              <div className="flex flex-wrap gap-2">
                {hackathon.themes.map((t) => (
                  <span key={t} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prizes */}
          {hackathon.prizes && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy size={18} className="text-yellow-400" /> Prizes
              </h2>
              <p className="text-zinc-300">{hackathon.prizes}</p>
              {hackathon.prizePool && (
                <p className="text-2xl font-bold text-yellow-400 mt-2">{hackathon.prizePool}</p>
              )}
            </div>
          )}

          {/* Map */}
          {hasLocation && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-400" /> Venue Location
              </h2>
              <p className="text-sm text-zinc-400 mb-3">
                {hackathon.venue.name}
                {hackathon.venue.address && `, ${hackathon.venue.address}`}
                {hackathon.venue.city && `, ${hackathon.venue.city}`}
              </p>
              <div className="rounded-xl overflow-hidden border border-zinc-700" style={{ height: "350px" }}>
                <MapContainer
                  center={[hackathon.venue.latitude, hackathon.venue.longitude]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[hackathon.venue.latitude, hackathon.venue.longitude]}>
                    <Popup>{hackathon.venue.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Interested Users */}
          {hackathon.interestedUsers?.length > 0 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-3">
                Interested ({hackathon.interestedUsers.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {hackathon.interestedUsers.slice(0, 20).map((u) => (
                  <div key={u._id} className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">
                      {u.name?.charAt(0)}
                    </div>
                    <span className="text-xs">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Action Buttons */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <button
              onClick={handleInterest}
              className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ${
                isInterested
                  ? "bg-pink-600 hover:bg-pink-500"
                  : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              <Heart size={16} className={isInterested ? "fill-white" : ""} />
              {isInterested ? "Interested ❤️" : "Mark as Interested"}
            </button>

            <button
              onClick={myTeam ? handleWithdraw : () => setShowRegister(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            >
              {myTeam ? <><UserPlus size={16} /> Withdraw Team</> : <><UserPlus size={16} /> Register Team</>}
            </button>

            {hackathon.website && (
              <a
                href={hackathon.website}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition border border-zinc-700"
              >
                <ExternalLink size={14} /> Visit Website
              </a>
            )}
          </div>

          {/* Register Modal */}
          {showRegister && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium mb-3">Register Your Team</h3>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Name"
                className="w-full bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg text-sm mb-3 outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-zinc-500 mb-3">
                Team size: {hackathon.teamSize?.min}-{hackathon.teamSize?.max} members
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRegister}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg text-sm transition"
                >
                  Register
                </button>
                <button
                  onClick={() => setShowRegister(false)}
                  className="px-4 py-2 text-zinc-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-sm font-medium mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Registration Deadline</span>
                <span className="text-zinc-300">
                  {new Date(hackathon.registrationDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Team Size</span>
                <span className="text-zinc-300">{hackathon.teamSize?.min}-{hackathon.teamSize?.max}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Participants</span>
                <span className="text-zinc-300">{hackathon.participantCount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Teams Registered</span>
                <span className="text-zinc-300">{hackathon.registeredTeams?.length || 0}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Aura Points</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <Zap size={12} /> +{hackathon.auraPointsReward}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Eligibility</span>
                <span className="text-zinc-300 text-right text-xs">{hackathon.eligibility}</span>
              </div>
              {hackathon.contactEmail && (
                <div className="flex justify-between text-zinc-400">
                  <span>Contact</span>
                  <a href={`mailto:${hackathon.contactEmail}`} className="text-indigo-400 flex items-center gap-1 text-xs">
                    <Mail size={10} /> {hackathon.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
