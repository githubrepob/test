import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { createEvent } from "../../api/eventsApi";
import {
  ArrowLeft, Plus, X, Calendar, MapPin, Clock,
  Monitor, Award, Gift, BookOpen, Mic, Shield,
} from "lucide-react";

const CATEGORIES = [
  "Technical", "Cultural", "Sports", "Workshop",
  "Seminar", "Fest", "Meetup", "Competition", "Fun", "Other",
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    category: "Technical",
    date: "",
    endDate: "",
    time: "",
    mode: "offline",
    meetLink: "",
    capacity: "",
    auraPointsReward: 50,
    registrationFee: "Free",
    venue: { name: "", address: "", latitude: 28.6139, longitude: 77.209 },
    banner: { url: "" },
    skills: "",
    prizes: "",
    eligibility: "",
    teamSize: "",
    rules: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    perks: "",
    speakers: [{ name: "", title: "" }],
    schedule: [{ time: "", activity: "" }],
  });

  const [locationPreview, setLocationPreview] = useState(
    "https://www.google.com/maps?q=28.6139,77.209&z=15&output=embed"
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVenueChange = (field, value) => {
    const updatedVenue = { ...form.venue, [field]: value };
    if (field === "latitude" || field === "longitude") {
      setLocationPreview(
        `https://www.google.com/maps?q=${updatedVenue.latitude},${updatedVenue.longitude}&z=15&output=embed`
      );
    }
    setForm({ ...form, venue: updatedVenue });
  };

  const addSpeaker = () => {
    setForm({ ...form, speakers: [...form.speakers, { name: "", title: "" }] });
  };
  const removeSpeaker = (i) => {
    setForm({ ...form, speakers: form.speakers.filter((_, idx) => idx !== i) });
  };
  const updateSpeaker = (i, field, val) => {
    const updated = [...form.speakers];
    updated[i][field] = val;
    setForm({ ...form, speakers: updated });
  };

  const addScheduleItem = () => {
    setForm({ ...form, schedule: [...form.schedule, { time: "", activity: "" }] });
  };
  const removeScheduleItem = (i) => {
    setForm({ ...form, schedule: form.schedule.filter((_, idx) => idx !== i) });
  };
  const updateScheduleItem = (i, field, val) => {
    const updated = [...form.schedule];
    updated[i][field] = val;
    setForm({ ...form, schedule: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.capacity) {
      return alert("Please fill all required fields");
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
        auraPointsReward: parseInt(form.auraPointsReward) || 50,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        perks: form.perks.split(",").map((s) => s.trim()).filter(Boolean),
        speakers: form.speakers.filter((s) => s.name.trim()),
        schedule: form.schedule.filter((s) => s.time.trim() && s.activity.trim()),
      };
      await createEvent(payload);
      navigate("/events");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating event");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition";
  const labelClass = "block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider";

  return (
    <ModuleLayout title="CREATE EVENT" subtitle="Launch your event like a pro.">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate("/events")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition text-sm">
          <ArrowLeft size={16} /> Back to Events
        </button>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step >= s ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {s}
              </button>
              {s < 4 && <div className={`flex-1 h-0.5 ${step > s ? "bg-purple-600" : "bg-zinc-800"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ═══ STEP 1: Basic Info ═══ */}
          {step === 1 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" /> Basic Information
              </h2>

              <div>
                <label className={labelClass}>Event Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. TechFest 2026 — Campus Hackathon" required className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Tagline</label>
                <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="A short catchy line about your event" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Full event description, rules, what to expect..." rows={6} required className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mode</label>
                  <select name="mode" value={form.mode} onChange={handleChange} className={inputClass}>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Banner Image URL</label>
                <input value={form.banner.url} onChange={(e) => setForm({ ...form, banner: { url: e.target.value } })} placeholder="https://example.com/banner.jpg" className={inputClass} />
                {form.banner.url && (
                  <img src={form.banner.url} alt="Banner Preview" className="w-full h-32 object-cover rounded-xl mt-3 border border-zinc-700" />
                )}
              </div>

              <button type="button" onClick={() => setStep(2)} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-medium transition">
                Next: Schedule & Capacity →
              </button>
            </div>
          )}

          {/* ═══ STEP 2: Schedule & Venue ═══ */}
          {step === 2 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock size={18} className="text-blue-400" /> Schedule & Venue
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Time Display</label>
                  <input name="time" value={form.time} onChange={handleChange} placeholder="e.g. 10:00 AM" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Capacity *</label>
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange} placeholder="Max participants" required className={inputClass} />
                </div>
              </div>

              {(form.mode === "online" || form.mode === "hybrid") && (
                <div>
                  <label className={labelClass}>Meeting Link</label>
                  <input name="meetLink" value={form.meetLink} onChange={handleChange} placeholder="https://meet.google.com/..." className={inputClass} />
                </div>
              )}

              <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2 pt-3 border-t border-zinc-800">
                <MapPin size={14} /> Location
              </h3>

              <div>
                <label className={labelClass}>Venue Name</label>
                <input value={form.venue.name} onChange={(e) => handleVenueChange("name", e.target.value)} placeholder="e.g. Main Auditorium" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Address</label>
                <input value={form.venue.address} onChange={(e) => handleVenueChange("address", e.target.value)} placeholder="Full address" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input type="number" step="0.0001" value={form.venue.latitude} onChange={(e) => handleVenueChange("latitude", parseFloat(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input type="number" step="0.0001" value={form.venue.longitude} onChange={(e) => handleVenueChange("longitude", parseFloat(e.target.value))} className={inputClass} />
                </div>
              </div>

              <iframe title="map-preview" src={locationPreview} width="100%" height="200" className="rounded-xl border border-zinc-700" loading="lazy" />

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-medium transition">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-medium transition">
                  Next: Details →
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Details & Rewards ═══ */}
          {step === 3 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award size={18} className="text-yellow-400" /> Details & Rewards
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Registration Fee</label>
                  <input name="registrationFee" value={form.registrationFee} onChange={handleChange} placeholder="Free or ₹100" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Aura Points Reward</label>
                  <input type="number" name="auraPointsReward" value={form.auraPointsReward} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Prizes</label>
                <textarea name="prizes" value={form.prizes} onChange={handleChange} placeholder="🥇 ₹1,00,000 | 🥈 ₹50,000 | 🥉 ₹25,000" rows={3} className={`${inputClass} resize-none`} />
              </div>

              <div>
                <label className={labelClass}>Skills / Topics (comma-separated)</label>
                <input name="skills" value={form.skills} onChange={handleChange} placeholder="Coding, AI, Design..." className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Perks (comma-separated)</label>
                <input name="perks" value={form.perks} onChange={handleChange} placeholder="Certificates, Free Meals, Goodies..." className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Eligibility</label>
                  <input name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="Who can participate" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Team Size</label>
                  <input name="teamSize" value={form.teamSize} onChange={handleChange} placeholder="e.g. 2-4" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Rules</label>
                <textarea name="rules" value={form.rules} onChange={handleChange} placeholder="Any specific rules..." rows={3} className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="event@college.edu" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+91 9876543210" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://event-site.com" className={inputClass} />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-medium transition">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl text-sm font-medium transition">
                  Next: Schedule & Speakers →
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 4: Schedule & Speakers ═══ */}
          {step === 4 && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Mic size={18} className="text-pink-400" /> Schedule & Speakers
              </h2>

              {/* Speakers */}
              <div>
                <label className={labelClass}>Speakers / Guests</label>
                <div className="space-y-3">
                  {form.speakers.map((sp, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={sp.name} onChange={(e) => updateSpeaker(i, "name", e.target.value)}
                        placeholder="Speaker Name" className={`${inputClass} flex-1`} />
                      <input value={sp.title} onChange={(e) => updateSpeaker(i, "title", e.target.value)}
                        placeholder="Title / Role" className={`${inputClass} flex-1`} />
                      {form.speakers.length > 1 && (
                        <button type="button" onClick={() => removeSpeaker(i)} className="text-zinc-600 hover:text-red-400 transition p-2">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addSpeaker} className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1">
                  <Plus size={12} /> Add Speaker
                </button>
              </div>

              {/* Event Timeline */}
              <div>
                <label className={labelClass}>Event Timeline / Agenda</label>
                <div className="space-y-3">
                  {form.schedule.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={item.time} onChange={(e) => updateScheduleItem(i, "time", e.target.value)}
                        placeholder="Time (e.g. 10:00 AM)" className={`${inputClass} w-40`} />
                      <input value={item.activity} onChange={(e) => updateScheduleItem(i, "activity", e.target.value)}
                        placeholder="Activity" className={`${inputClass} flex-1`} />
                      {form.schedule.length > 1 && (
                        <button type="button" onClick={() => removeScheduleItem(i)} className="text-zinc-600 hover:text-red-400 transition p-2">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addScheduleItem} className="text-xs text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1">
                  <Plus size={12} /> Add Timeline Item
                </button>
              </div>

              <div className="flex gap-2 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-3 rounded-xl text-sm font-medium transition">
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {submitting ? "Publishing..." : "🚀 Publish Event"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </ModuleLayout>
  );
}