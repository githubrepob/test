import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, BookOpen, HelpCircle, Layers, X, Copy, Check } from "lucide-react";
import api from "../../api/axios";

export default function AIResearchSummarizerModal({ isOpen, onClose, initialText = "" }) {
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("takeaways");
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/ml/research/summarize", { text });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyBullets = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.keyTakeaways.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">AI Research & Notes Explainer</h3>
                <p className="text-xs text-slate-400">Summarize research papers, extract exam prep flashcards & ELI5 analogies</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-400 rounded-xl transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Input Area */}
          <div className="mt-6 space-y-3">
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste research paper abstract, lecture notes, or complex text here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 outline-none focus:border-indigo-500/60 transition resize-none placeholder:text-slate-600"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSummarize}
                disabled={loading || !text.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-95 transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Analyzing Vector Embeddings..." : "Run AI Research Analysis"}</span>
              </button>
            </div>
          </div>

          {/* Results Display */}
          {data && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 gap-4">
                {[
                  { id: "takeaways", label: "Key Takeaways", icon: BookOpen },
                  { id: "eli5", label: "ELI5 Analogy", icon: Sparkles },
                  { id: "exam", label: "Exam Prep", icon: HelpCircle },
                  { id: "flashcards", label: "Flashcards", icon: Layers },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                      activeTab === tab.id
                        ? "border-cyan-400 text-cyan-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 min-h-[140px]">
                {activeTab === "takeaways" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        {data.wordCount} words analyzed
                      </span>
                      <button onClick={copyBullets} className="text-xs text-indigo-400 flex items-center gap-1 hover:underline">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied!" : "Copy Summary"}</span>
                      </button>
                    </div>
                    <ul className="space-y-2">
                      {data.keyTakeaways.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === "eli5" && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">Simplified Analogy</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-cyan-500/5 p-3 rounded-xl border border-cyan-500/20">
                      "{data.eli5Explanation}"
                    </p>
                  </div>
                )}

                {activeTab === "exam" && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-purple-400">High-Yield Exam Questions</span>
                    <div className="space-y-2">
                      {data.examQuestions.map((q, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                          Q{idx + 1}: {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "flashcards" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.flashcards.map((fc, idx) => (
                      <div key={idx} className="bg-slate-900 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Card #{idx + 1}</span>
                        <h4 className="text-xs font-bold text-white">{fc.question}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{fc.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
