import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { getMyEvents, getEventRegistrations } from "../../api/eventsApi";
import { Calendar, MapPin, Users, ArrowLeft, Eye, Mail, CheckCircle2, UserX } from "lucide-react";

export default function MyCreatedEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchMyEvents(); }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await getMyEvents();
      setEvents(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openRegistrations = async (event) => {
    setSelected(event);
    setDetailLoading(true);
    try {
      const res = await getEventRegistrations(event._id);
      setRegistrations(res.data.registrations || []);
    } catch (err) {
      alert(err.response?.data?.message || "Could not load registrations");
    } finally { setDetailLoading(false); }
  };

  return (
    <ModuleLayout title="ORGANIZER DASHBOARD" subtitle="Create events and see exactly who registered, attended, or withdrew.">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate("/events")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition text-sm"><ArrowLeft size={16}/> Back to Events</button>
        {loading ? <div className="text-zinc-500 py-20 text-center">Loading organizer data...</div> : events.length === 0 ? (
          <div className="text-center py-20"><Calendar size={48} className="mx-auto text-zinc-700 mb-4"/><p className="text-zinc-400">You haven't created any events yet.</p><button onClick={() => navigate("/events/create")} className="mt-4 bg-purple-600 px-6 py-2.5 rounded-xl text-sm">Create Event</button></div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6">
            <div className="space-y-4">
              {events.map(event => (
                <button key={event._id} onClick={() => openRegistrations(event)} className={`w-full text-left bg-zinc-900/80 border rounded-2xl p-5 transition ${selected?._id === event._id ? "border-purple-500/70" : "border-zinc-800 hover:border-zinc-600"}`}>
                  <div className="flex items-start justify-between gap-3"><div><div className="flex gap-2 mb-2"><span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400">{event.category}</span><span className="text-xs text-zinc-500">{new Date(event.date).toLocaleDateString("en-IN")}</span></div><h3 className="font-semibold text-white">{event.title}</h3><p className="text-xs text-zinc-500 mt-2 flex gap-3"><span><MapPin size={11} className="inline"/> {event.venue?.name || "TBA"}</span><span><Users size={11} className="inline"/> {event.attendeesCount || 0}/{event.capacity}</span></p></div><Eye size={17} className="text-zinc-500"/></div>
                </button>
              ))}
            </div>
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 min-h-[420px]">
              {!selected ? <div className="h-full flex items-center justify-center text-zinc-600 text-sm">Select an event to view its live registration list.</div> : (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4"><div><h2 className="text-xl font-bold">{selected.title}</h2><p className="text-xs text-zinc-500 mt-1">{registrations.length}/{selected.capacity} registered</p></div><Users className="text-purple-400"/></div>
                  {detailLoading ? <p className="text-zinc-500 text-sm">Loading registrants...</p> : registrations.length === 0 ? <div className="py-16 text-center text-zinc-600"><UserX className="mx-auto mb-3"/><p>No registrations yet.</p></div> : <div className="space-y-2 max-h-[520px] overflow-y-auto">
                    {registrations.map(r => <div key={r._id} className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded-xl p-3"><div><p className="text-sm font-medium">{r.user?.name || "Unknown"}</p><p className="text-xs text-zinc-500">{r.user?.collegeEmail || ""} · {r.user?.branch || ""} · Sem {r.user?.semester || "-"}</p></div><div className="text-right"><span className={`text-xs px-2 py-1 rounded ${r.status === "attended" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>{r.status}</span><p className="text-[10px] text-zinc-600 mt-1">{new Date(r.createdAt).toLocaleString("en-IN")}</p></div></div>)}
                  </div>}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
