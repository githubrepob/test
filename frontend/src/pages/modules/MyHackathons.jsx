import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../components/ModuleLayout";
import { getMyHackathons } from "../../api/hackathonsApi";
import { ArrowLeft, Trophy, Users, Mail } from "lucide-react";

export default function MyHackathons() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getMyHackathons().then(r => setItems(r.data || [])).catch(e => console.error(e)).finally(() => setLoading(false)); }, []);
  return <ModuleLayout title="HACKATHON ORGANIZER DASHBOARD" subtitle="Manage your hackathons and see registered teams and participants.">
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate("/hackathons")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm"><ArrowLeft size={16}/> Back</button>
      {loading ? <p className="text-zinc-500 py-20 text-center">Loading...</p> : items.length === 0 ? <div className="text-center py-20 text-zinc-500"><Trophy className="mx-auto mb-3"/><p>You have not created a hackathon yet.</p></div> : <div className="space-y-5">{items.map(h => <div key={h._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6"><div className="flex justify-between gap-4"><div><h2 className="text-xl font-bold">{h.title}</h2><p className="text-xs text-zinc-500 mt-1">{h.participantCount || 0} participants · {h.registeredTeams?.length || 0} teams</p></div><Trophy className="text-emerald-400"/></div><div className="mt-5 grid md:grid-cols-2 gap-3">{(h.registeredTeams || []).map((team, i) => <div key={team._id || i} className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4"><div className="flex justify-between"><span className="font-medium">{team.teamName || `Team ${i+1}`}</span><span className="text-xs text-zinc-500">{team.members?.length || 0} members</span></div><div className="mt-3 space-y-1">{(team.members || []).map(m => <p key={m._id} className="text-xs text-zinc-400"><Users size={11} className="inline mr-1"/>{m.name} · {m.collegeEmail}</p>)}</div></div>)}</div></div>)}</div>}
    </div>
  </ModuleLayout>;
}
