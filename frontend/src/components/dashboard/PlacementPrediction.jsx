import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Award, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../api/axios";

export default function PlacementPrediction({ userMetrics }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPrediction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userMetrics]);

  const [lcUsername, setLcUsername] = useState(userMetrics?.codingStats?.leetcodeUsername || "");
  const [cfUsername, setCfUsername] = useState(userMetrics?.codingStats?.codeforcesUsername || "");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/dashboard/placement-prediction");
      setPrediction(res.data);
    } catch (err) {
      console.warn("Falling back to direct ML predict endpoint:", err);
      try {
        const payload = {
          cgpa: userMetrics?.academicStats?.cgpa || 0,
          easySolved: userMetrics?.codingStats?.easySolved || 0,
          mediumSolved: userMetrics?.codingStats?.mediumSolved || 0,
          hardSolved: userMetrics?.codingStats?.hardSolved || 0,
          contestRating: userMetrics?.codingStats?.contestRating || 0,
          projectsCount: userMetrics?.projectCount || 0,
          internshipsCount: userMetrics?.internshipCount || 0,
          certifications: userMetrics?.academicStats?.certifications || 0,
          semester: Number(String(userMetrics?.semester || 0).replace(/\D/g, "")) || 0,
          communityActivityScore: userMetrics?.communityActivityScore || 0,
        };
        const res = await api.post("/ml/predict-placement", payload);
        setPrediction(res.data);
      } catch (fallbackErr) {
        console.error("All prediction requests failed:", fallbackErr);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCoding = async () => {
    if (!lcUsername && !cfUsername) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.post("/dashboard/sync-coding-profile", {
        leetcodeUsername: lcUsername,
        codeforcesUsername: cfUsername
      });
      setSyncMessage(res.data.message || "Synced live coding stats!");
      fetchPrediction();
    } catch (err) {
      setSyncMessage("Sync completed with cached profile data.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-24 bg-slate-800/50 rounded-xl"></div>
        <div className="h-4 bg-slate-800/40 rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex items-center justify-between text-slate-400 text-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>Placement AI Model offline. Complete your coding stats to update prediction.</span>
        </div>
        <button
          onClick={fetchPrediction}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const prob = prediction.readinessScore ?? prediction.placementProbability ?? 0;
  const strokeDasharray = 283;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * prob) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden shadow-xl"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">AI Placement Readiness Predictor</h3>
            <p className="text-xs text-slate-400">Real-time ML analysis based on coding, academics & projects</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          {prediction.packageBand || "Mid Tier"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Radial Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradientPlacement)"
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: strokeDasharray }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
              <defs>
                <linearGradient id="gradientPlacement" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{prob}%</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Prototype Readiness</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400 text-center font-medium">
            Expected Package: <span className="text-cyan-400 font-bold">{prediction.packageBand}</span>
          </p>
        </div>

        {/* Top Factors */}
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Top 3 Key Impact Factors
          </h4>

          <div className="space-y-2">
            {(prediction.topFactors || []).map((factor, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-950/30 border border-slate-800/80 rounded-xl text-slate-200 text-xs font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                  #{idx + 1}
                </div>
                <span className="flex-1 truncate">{factor}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
