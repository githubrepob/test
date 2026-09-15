import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { createHackathon } from "../../api/hackathonsApi";
import { ArrowLeft } from "lucide-react";

export default function CreateHackathon() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    organizer: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    prizes: "",
    prizePool: "",
    themes: "",
    mode: "Online",
    venueName: "",
    venueCity: "",
    venueAddress: "",
    latitude: "",
    longitude: "",
    teamSizeMin: 1,
    teamSizeMax: 4,
    website: "",
    eligibility: "Open to all",
    contactEmail: "",
    auraPointsReward: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        title: form.title,
        description: form.description,
        organizer: form.organizer,
        startDate: form.startDate,
        endDate: form.endDate,
        registrationDeadline: form.registrationDeadline,
        prizes: form.prizes,
        prizePool: form.prizePool,
        themes: form.themes.split(",").map((t) => t.trim()).filter(Boolean),
        mode: form.mode,
        venue: {
          name: form.venueName || "Online",
          address: form.venueAddress,
          city: form.venueCity,
          latitude: form.latitude ? parseFloat(form.latitude) : undefined,
          longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        },
        teamSize: {
          min: parseInt(form.teamSizeMin),
          max: parseInt(form.teamSizeMax),
        },
        website: form.website,
        eligibility: form.eligibility,
        contactEmail: form.contactEmail,
        auraPointsReward: parseInt(form.auraPointsReward),
      };

      await createHackathon(data);
      alert("Hackathon created! +20 Aura Points 🔥");
      navigate("/hackathons");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-emerald-500 outline-none transition";

  return (
    <ModuleLayout title="CREATE HACKATHON" subtitle="Host a hackathon and earn Aura Points!">
      <button onClick={() => navigate("/hackathons")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Hackathon Name *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. HackWithIndian 2026" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Organizer *</label>
            <input name="organizer" value={form.organizer} onChange={handleChange} required placeholder="e.g. Coding Club" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Describe your hackathon..." className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Start Date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">End Date *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Reg. Deadline *</label>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Mode</label>
            <div className="flex gap-3">
              {["Online", "Offline", "Hybrid"].map((m) => (
                <button
                  key={m} type="button"
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`flex-1 py-3 rounded-xl text-sm border transition ${form.mode === m ? "bg-emerald-600 border-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {(form.mode === "Offline" || form.mode === "Hybrid") && (
            <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-sm font-medium">Venue Details</h3>
              <input name="venueName" value={form.venueName} onChange={handleChange} placeholder="Venue Name" className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input name="venueCity" value={form.venueCity} onChange={handleChange} placeholder="City" className={inputClass} />
                <input name="venueAddress" value={form.venueAddress} onChange={handleChange} placeholder="Address" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude (for map)" className={inputClass} />
                <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude (for map)" className={inputClass} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Themes (comma separated)</label>
            <input name="themes" value={form.themes} onChange={handleChange} placeholder="e.g. AI/ML, Web3, FinTech" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Prizes</label>
              <input name="prizes" value={form.prizes} onChange={handleChange} placeholder="Describe prizes" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Prize Pool</label>
              <input name="prizePool" value={form.prizePool} onChange={handleChange} placeholder="e.g. ₹5,00,000" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Min Team Size</label>
              <input type="number" name="teamSizeMin" value={form.teamSizeMin} onChange={handleChange} min={1} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Max Team Size</label>
              <input type="number" name="teamSizeMax" value={form.teamSizeMax} onChange={handleChange} min={1} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Contact Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Eligibility</label>
            <input name="eligibility" value={form.eligibility} onChange={handleChange} placeholder="e.g. All college students" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {submitting ? "Creating..." : "Create Hackathon (+20 Aura)"}
          </button>
        </form>
      </div>
    </ModuleLayout>
  );
}
