import React from "react";
import { motion } from "framer-motion";
import PlasmaBackground from "../components/PlasmaBackground";
import Hero3DCanvas from "../components/Hero3DCanvas";
import Navbar from "../components/Navbar";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import AILandingWidget from "../components/landing/AILandingWidget";
import { Sparkles, Brain, Search, ShieldCheck, Zap, Award, ArrowRight, CheckCircle2, Code2, Users, BookOpen } from "lucide-react";

export default function Landing() {
  const token = localStorage.getItem("campusconnect_token");

  return (
    <div className="relative text-white overflow-x-hidden bg-[#090d16] min-h-screen font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* BACKGROUND */}
      <PlasmaBackground />

      {/* NAVIGATION */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 z-10 overflow-hidden">
        <Hero3DCanvas />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-5xl mx-auto space-y-6"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-lg shadow-cyan-500/5"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-Powered Campus Ecosystem · Gemini + RandomForest ML</span>
          </motion.div>

          <h1 className="font-display text-7xl md:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-cyan-400 drop-shadow-2xl leading-none pb-2">
            uni<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Verse</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto font-normal leading-relaxed">
            The intelligent campus platform with <span className="text-cyan-400 font-semibold">live Gemini AI interview coaching</span>, <span className="text-indigo-400 font-semibold">ML placement prediction</span>, and <span className="text-purple-400 font-semibold">company-wise PYQ mock tests</span> for top recruiters.
          </p>

          {!token ? (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <a
                href="/register"
                className="px-9 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch AI Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-slate-900/90 border border-slate-700/80 text-white font-semibold rounded-2xl backdrop-blur-md hover:bg-slate-800 hover:border-slate-600 transition duration-300 text-sm"
              >
                Sign In to Dashboard
              </a>
            </motion.div>
          ) : (
            <div className="pt-4">
              <a
                href="/dashboard"
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition duration-300 text-sm inline-flex items-center gap-2"
              >
                <span>Go to Student Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </motion.div>

        {/* HIGH-TECH STATS BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 w-full max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          {[
            { value: "95.8%", label: "ML F1 Score", color: "from-cyan-400 to-indigo-400" },
            { value: "384-D", label: "NLP Embeddings", color: "from-indigo-400 to-purple-400" },
            { value: "8 cos.", label: "Company PYQs", color: "from-purple-400 to-pink-400" },
            { value: "<20ms", label: "FastAPI Inference", color: "from-cyan-400 to-emerald-400" },
          ].map((stat, i) => (
            <div key={i} className={`p-5 text-center ${i < 3 ? "border-r border-slate-800/60" : ""}`}>
              <span className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>{stat.value}</span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>


      {/* LIVE AI DEMO SANDBOX WIDGET */}
      <section className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        <AILandingWidget />
      </section>

      {/* AI CAPABILITIES SHOWCASE */}
      <section className="relative max-w-6xl mx-auto px-6 py-20 z-10 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Engineered with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Advanced AI & Microservices</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base">
            From predictive career modeling to real-time NLP text vectorization, experience next-level academic features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative hover:border-cyan-500/50 transition duration-300 group">
            <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl w-fit text-cyan-400 mb-6 group-hover:scale-110 transition duration-300">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Placement Predictor</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              RandomForest Classifier analyzing LeetCode ratings, CGPA, semester, and projects to output accurate placement odds & top key impact factors.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative hover:border-indigo-500/50 transition duration-300 group">
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl w-fit text-indigo-400 mb-6 group-hover:scale-110 transition duration-300">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Neural Semantic Search</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Powered by Sentence-Transformers (<code className="text-cyan-300 font-mono text-[10px]">all-MiniLM-L6-v2</code>) for conceptual, context-aware searching across student notes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-md relative hover:border-purple-500/50 transition duration-300 group">
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-2xl w-fit text-purple-400 mb-6 group-hover:scale-110 transition duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cosine Duplicate Checker</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Real-time vector similarity engine preventing duplicate questions and redundant technical issue postings before submission.
            </p>
          </div>
        </div>

        {/* ECOSYSTEM FEATURES MATRIX */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-indigo-400" /> Full Campus Ecosystem
              </div>
              <h3 className="text-3xl font-extrabold text-white">All Academic Tools in One Seamless Portal</h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Connect with peers, prepare for tech hiring drives, earn Aura points for peer assistance, and share verified notes.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Interactive Coding & Placement Benchmarking</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Real-Time Peer DM Messaging & Hackathon Teammate Matcher</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Referrals & Verified Internship Openings</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <Code2 className="w-6 h-6 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Tech Issues</h4>
                <p className="text-[11px] text-slate-400">Resolve code bugs with instant duplicate vector checking.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Smart Notes</h4>
                <p className="text-[11px] text-slate-400">Search academic notes conceptually using NLP embeddings.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <Users className="w-6 h-6 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Community</h4>
                <p className="text-[11px] text-slate-400">Earn Aura points and rank up on campus leaderboards.</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <Award className="w-6 h-6 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Careers</h4>
                <p className="text-[11px] text-slate-400">Apply for internships with AI readiness analytics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & FOOTER */}
      <FAQSection />
      <Footer />
    </div>
  );
}
