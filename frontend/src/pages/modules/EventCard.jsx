import React, { useState } from "react";
import axios from "axios";
import { Heart, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

console.log("THIS IS THE NEW EVENT CARD");
const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("campusconnect_token");

  const safeEvent = event || {};

  const [likesCount, setLikesCount] = useState(
    safeEvent?.likes?.length || 0
  );
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!token || !safeEvent._id) return;

    try {
      const res = await axios.post(
        `/api/events/${safeEvent._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLikesCount(res.data.likesCount);
      setLiked(!liked);
    } catch (err) {
      console.log("Like error", err);
    }
  };

  const handleRegister = async (e) => {
    e.stopPropagation();
    if (!token || !safeEvent._id) return;

    try {
      await axios.post(
        `/api/events/${safeEvent._id}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Registered successfully 🎉");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (!safeEvent._id) return null;

  return (
    <div
      onClick={() => navigate(`/events/${safeEvent._id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-indigo-500 transition"
    >
      <h3 className="text-xl font-semibold mb-2">
        {safeEvent.title || "Untitled Event"}
      </h3>

      <p className="text-zinc-400 text-sm mb-3">
        {safeEvent.description?.slice(0, 100) || ""}
      </p>

      <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
        <div className="flex items-center gap-1">
          <Users size={16} />
          {safeEvent.attendeesCount || 0}
        </div>

        <div className="flex items-center gap-1">
          <MapPin size={16} />
          {safeEvent.venue?.name || "TBA"}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-sm ${
            liked ? "text-red-500" : "text-zinc-400"
          }`}
        >
          <Heart size={16} />
          {likesCount}
        </button>

        <button
          onClick={handleRegister}
          className="bg-indigo-600 px-4 py-1 rounded-lg text-sm"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default EventCard;