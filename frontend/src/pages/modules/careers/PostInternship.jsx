import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { createInternship } from "../../../api/internshipsApi";
import { ArrowLeft } from "lucide-react";

export default function PostInternship() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    responsibilities: "",
    domain: "",
    stipend: "",
    duration: "",
    location: "Remote",
    city: "",
    ppo: false,
    type: "internship",
    skills: "",
    perks: "",
    openings: 1,
    applyLink: "",
    deadline: "",
    startDate: "",
    whoCanApply: "",
    experience: "Fresher",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        perks: form.perks.split(",").map((s) => s.trim()).filter(Boolean),
        openings: parseInt(form.openings),
      };

      await createInternship(data);
      alert("Opportunity posted! 🚀");
      navigate("/careers/internships");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post");
    }
    setSubmitting(false);
  };

  const inputClass = "w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm focus:border-purple-500 outline-none transition";

  return (
    <ModuleLayout title="POST OPPORTUNITY" subtitle="Share internships, projects, and paid opportunities with campus students.">
      <button onClick={() => navigate("/careers/internships")} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Job Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Frontend Developer Intern" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Company *</label>
              <input name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Google" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Describe the role..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Requirements</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} placeholder="What skills/experience needed..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Responsibilities</label>
            <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={3} placeholder="Day-to-day responsibilities..." className={`${inputClass} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Domain *</label>
              <input name="domain" value={form.domain} onChange={handleChange} required placeholder="e.g. Web Development" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Stipend</label>
              <input name="stipend" value={form.stipend} onChange={handleChange} placeholder="e.g. ₹30,000/month" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Duration *</label>
              <input name="duration" value={form.duration} onChange={handleChange} required placeholder="e.g. 3 Months" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Location</label>
              <select name="location" value={form.location} onChange={handleChange} className={inputClass}>
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                <option value="internship">Internship</option>
                <option value="project">Paid Project</option>
                <option value="opportunity">Opportunity</option>
                <option value="part-time">Part-time</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bangalore, Campus" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Experience Level</label>
              <select name="experience" value={form.experience} onChange={handleChange} className={inputClass}>
                <option value="Fresher">Fresher</option>
                <option value="Intermediate">Intermediate (1-2 yrs)</option>
                <option value="Expert">Expert (2+ yrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Who Can Apply</label>
            <input name="whoCanApply" value={form.whoCanApply} onChange={handleChange} placeholder="e.g. 3rd year CSE, any branch with coding skills" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Skills (comma separated)</label>
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, MongoDB" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Perks (comma separated)</label>
            <input name="perks" value={form.perks} onChange={handleChange} placeholder="e.g. Certificate, PPO, Mentorship" className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Openings</label>
              <input type="number" name="openings" value={form.openings} onChange={handleChange} min={1} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">External Apply Link</label>
            <input name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://..." className={inputClass} />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="ppo" checked={form.ppo} onChange={handleChange} className="accent-purple-600" />
            PPO (Pre Placement Offer) Available
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 shadow-lg shadow-purple-500/20"
          >
            {submitting ? "Posting..." : "Post Opportunity"}
          </button>
        </form>
      </div>
    </ModuleLayout>
  );
}
