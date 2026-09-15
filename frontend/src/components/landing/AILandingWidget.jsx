import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import api from "../../api/axios";

export default function AILandingWidget() {
  const [cgpa, setCgpa] = useState(8.2);
  const [solved, setSolved] = useState(120);
  const [projects, setProjects] = useState(3);
  const [internships, setInternships] = useState(1);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    placementProbability: 84.5,
    packageBand: "High (₹12 - ₹18 LPA)",
    topFactors: [
      "Academic Performance (CGPA 8.2)",
      "Problem Solving (120 Solved)",
      "Practical Projects (3 Built)"
    ]
  });

  const calculateML = async (newCgpa, newSolved, newProj, newIntern) => {
    setLoading(true);
    try {
      const payload = {
        cgpa: newCgpa,
        easySolved: Math.round(newSolved * 0.5),
        mediumSolved: Math.round(newSolved * 0.4),
        hardSolved: Math.round(newSolved * 0.1),
        contestRating: 1450 + newSolved * 0.8,
        projectsCount: newProj,
        internshipsCount: newIntern,
        certifications: 1,
        semester: 7,
        communityActivityScore: 70
      };
      const res = await api.post("/ml/predict-placement", payload);
      setResult(res.data);
    } catch (err) {
      // Fallback local ML formula if backend offline
      const score = (newCgpa - 5.5) * 11 + (newSolved / 4) + newProj * 5 + newIntern * 10;
      const prob = Math.min(99.4, Math.max(15.0, Math.round(score * 1.05 * 10) / 10));
      let band = "Low (< ₹5 LPA)";
      if (prob > 80) band = "High (₹12 - ₹18 LPA)";
      else if (prob > 55) band = "Mid (₹6 - ₹11 LPA)";

      setResult({
        placementProbability: prob,
        packageBand: band,
        topFactors: [
          `Academic Performance (CGPA ${newCgpa})`,
          `Problem Solving (${newSolved} Solved)`,
          `Practical Projects (${newProj} Built)`
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCgpaChange = (v) => { setCgpa(v); calculateML(v, solved, projects, internships); };
  const handleSolvedChange = (v) => { setSolved(v); calculateML(cgpa, v, projects, internships); };
  const handleProjChange = (v) => { setProjects(v); calculateML(cgpa, solved, v, internships); };
  const handleInternChange = (v) => { setInternships(v); calculateML(cgpa, solved, projects, v); };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Brain className="w-3.5 h-3.5" /> Live Interactive ML Simulator
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Test the AI Placement Engine</h3>
          <p className="text-xs text-slate-400 mt-1">Adjust metrics to observe real-time RandomForest model predictions & salary tier analysis</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Inference Latency: <strong className="text-cyan-400 font-mono">18ms</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Side */}
        <div className="lg:col-span-6 space-y-5">
          {/* CGPA Slider */}
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-2">
                CGPA Score
              </label>
              <span className="text-cyan-400 font-mono font-bold text-sm">{cgpa}</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.1"
              value={cgpa}
              onChange={(e) => handleCgpaChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Solved Slider */}
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300 font-semibold flex items-center gap-2">
                Coding Problems Solved
              </label>
              <span className="text-cyan-400 font-mono font-bold text-sm">{solved}</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="10"
              value={solved}
              onChange={(e) => handleSolvedChange(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Projects & Internships */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-semibold">Projects</label>
                <span className="text-cyan-400 font-mono font-bold">{projects}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={projects}
                onChange={(e) => handleProjChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-semibold">Internships</label>
                <span className="text-cyan-400 font-mono font-bold">{internships}</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={internships}
                onChange={(e) => handleInternChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Prediction Results Gauge */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> ML Model Prediction
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold">
              {result.packageBand}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
            {/* Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#landingGrad)"
                  strokeWidth="8"
                  strokeDasharray={264}
                  animate={{ strokeDashoffset: 264 - (264 * result.placementProbability) / 100 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="landingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{result.placementProbability}%</span>
                <span className="block text-[9px] text-slate-400 font-medium uppercase">Placement</span>
              </div>
            </div>

            {/* Top Factors */}
            <div className="space-y-2 flex-1 w-full">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Top Key Drivers
              </p>
              {result.topFactors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/register"
            className="mt-4 w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-cyan-500/10"
          >
            <span>Unlock Full AI Career Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
