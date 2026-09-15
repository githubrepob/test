import React, { useEffect, useState } from "react";
import ModuleLayout from "../../components/ModuleLayout";
import { Brain, Volume2, VolumeX, Send, Sparkles, ChevronRight } from "lucide-react";
import api from "../../api/axios";
import { generatePracticeQuestions } from "../../api/practiceApi";

const defaults = { subject: "Computer Science", topic: "Data Structures and Algorithms", difficulty: "hard", count: 5 };

export default function AIInterviewPrep() {
  const [config, setConfig] = useState(defaults);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const current = questions[index];
  const setField = (field, value) => setConfig((previous) => ({ ...previous, [field]: value }));

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const createInterview = async () => {
    setGenerating(true); setError("");
    try {
      const res = await generatePracticeQuestions({ ...config, mode: "interview" });
      const generated = res.data.questions || [];
      setQuestions(generated); setIndex(0); setAnswer(""); setEvaluation(null);
      if (generated[0]?.question) speak(generated[0].question);
    } catch (err) { setError(err.response?.data?.message || "Could not generate questions. Please try again."); }
    finally { setGenerating(false); }
  };

  const evaluate = async () => {
    if (!answer.trim() || !current) return;
    setEvaluating(true);
    try {
      const res = await api.post("/ml/interview/evaluate", { domain: `${config.subject}: ${config.topic}`, question: current.question, answer });
      setEvaluation(res.data);
    } catch (err) { setError(err.response?.data?.message || "Evaluation is unavailable right now."); }
    finally { setEvaluating(false); }
  };

  const next = () => {
    const nextIndex = Math.min(index + 1, questions.length - 1);
    setIndex(nextIndex); setAnswer(""); setEvaluation(null);
    if (questions[nextIndex]) speak(questions[nextIndex].question);
  };

  return (
    <ModuleLayout title="AI MOCK INTERVIEWER" subtitle="Build a hard interview round for any subject and topic, answer it, and get targeted AI feedback.">
      <div className="max-w-5xl mx-auto space-y-6">
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 md:p-7">
          <div className="flex items-center gap-2 mb-5"><Sparkles className="w-4 h-4 text-cyan-400" /><h2 className="font-bold">Create your interview round</h2></div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-xs text-slate-400">Subject<input value={config.subject} onChange={(e) => setField("subject", e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white" placeholder="e.g. Computer Science" /></label>
            <label className="text-xs text-slate-400">Topic<input value={config.topic} onChange={(e) => setField("topic", e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white" placeholder="e.g. Operating Systems" /></label>
            <label className="text-xs text-slate-400">Difficulty<select value={config.difficulty} onChange={(e) => setField("difficulty", e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
            <label className="text-xs text-slate-400">Questions (1–15)<input type="number" min="1" max="15" value={config.count} onChange={(e) => setField("count", e.target.value)} className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white" /></label>
          </div>
          <button onClick={createInterview} disabled={generating || !config.subject.trim() || !config.topic.trim()} className="mt-5 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-50">{generating ? "Creating a tough round…" : "Generate AI interview round"}</button>
          {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        </section>

        {!current ? <div className="text-center p-10 text-slate-500 text-sm">Choose a subject and topic, then generate a personalised interview round.</div> : (
          <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between gap-4 mb-5"><span className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full"><Brain className="inline w-3.5 h-3.5 mr-1" /> Question {index + 1} of {questions.length}</span><div className="flex gap-2"><button onClick={() => speak(current.question)} className="p-2 rounded-lg bg-slate-800 text-cyan-300" title="Read question aloud"><Volume2 className="w-4 h-4" /></button><button onClick={() => window.speechSynthesis?.cancel()} className="p-2 rounded-lg bg-slate-800 text-slate-300" title="Stop narration"><VolumeX className="w-4 h-4" /></button></div></div>
            <h3 className="text-xl md:text-2xl font-bold leading-relaxed">{current.question}</h3>
            {current.followUp && <p className="mt-4 text-sm text-indigo-300">Follow-up to expect: {current.followUp}</p>}
            <textarea rows="6" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer. Explain your reasoning, trade-offs, complexity and edge cases…" className="mt-6 w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white" />
            <div className="mt-4 flex justify-between"><button onClick={next} disabled={index === questions.length - 1} className="text-xs text-slate-300 disabled:opacity-30 flex items-center gap-1">Next question <ChevronRight className="w-4 h-4" /></button><button onClick={evaluate} disabled={evaluating || !answer.trim()} className="px-5 py-3 rounded-xl bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"><Send className="w-3.5 h-3.5" />{evaluating ? "Evaluating…" : "Get AI feedback"}</button></div>
            {evaluation && <div className="mt-6 border-t border-slate-800 pt-5 grid md:grid-cols-[auto_1fr] gap-5"><div className="w-20 h-20 rounded-2xl bg-cyan-500/10 text-cyan-300 flex flex-col items-center justify-center"><b className="text-2xl">{evaluation.score}/10</b><span className="text-[10px]">{evaluation.rating}</span></div><div><p className="text-sm text-slate-200">{evaluation.feedback}</p><p className="mt-3 text-xs text-slate-400"><b className="text-cyan-300">Model answer:</b> {evaluation.modelAnswer}</p></div></div>}
          </section>
        )}
      </div>
    </ModuleLayout>
  );
}
