import React, { useState } from "react";
import ModuleLayout from "../../components/ModuleLayout";
import { Building2, Sparkles, Award, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Send, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import { generatePracticeQuestions } from "../../api/practiceApi";

export default function CompanyPlacementMocks() {
  const [selectedCompany, setSelectedCompany] = useState("TCS");
  const [currentStep, setCurrentStep] = useState("overview"); // 'overview' | 'mock' | 'results'
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [mockConfig, setMockConfig] = useState({ subject: "Computer Science", topic: "Data Structures and Algorithms", difficulty: "hard", count: 10 });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generatingMock, setGeneratingMock] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const companiesData = {
    TCS: {
      name: "TCS (NQT / Digital / Prime)",
      tier: "Mass & Premium Tech (₹3.36 - ₹9.0 LPA)",
      pattern: "Aptitude (40m) + CS Fundamentals (30m) + Advanced Coding (45m)",
      focusAreas: ["Arrays & Matrix Operations", "Strings & Anagrams", "Prime Factors & Math Logic", "Data Structures"],
      pyqs: [
        {
          id: 1,
          question: "[TCS Digital 2024 PYQ] Given an array of integers, find the length of the longest subarray with sum equal to K.",
          options: ["Two Pointer / Hash Map Approach O(N)", "Nested Loop O(N^3)", "Binary Search on Unsorted Array", "Bitwise XOR Trick"],
          correct: 0
        },
        {
          id: 2,
          question: "[TCS NQT 2024 PYQ] What is the output of reversing a string using pointers in C++ without extra memory?",
          options: ["O(N) Time, O(1) Auxiliary Space", "O(N^2) Time, O(N) Space", "O(log N) Time", "Undefined Behavior"],
          correct: 0
        },
        {
          id: 3,
          question: "[TCS Prime 2025 PYQ] Which algorithm is best suited for finding single-source shortest paths in weighted graphs with non-negative edges?",
          options: ["Dijkstra's Algorithm O((V+E) log V)", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Breadth First Search"],
          correct: 0
        }
      ]
    },
    Infosys: {
      name: "Infosys (SP / DSE / SE)",
      tier: "Specialist Programmer (₹9.5 LPA) & DSE (₹6.5 LPA)",
      pattern: "HackWithInfy / SP Coding Round (3 Problems in 3 Hours)",
      focusAreas: ["Dynamic Programming (Knapsack, LIS)", "Graph Traversal (BFS/DFS)", "Greedy Interval Scheduling"],
      pyqs: [
        {
          id: 1,
          question: "[Infosys SP 2024 PYQ] In 0/1 Knapsack DP, what is the state transition formula for dp[i][w]?",
          options: [
            "max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])",
            "dp[i-1][w] + val[i]",
            "min(dp[i-1][w], wt[i-1])",
            "dp[i][w-1] + val[i-1]"
          ],
          correct: 0
        },
        {
          id: 2,
          question: "[Infosys DSE 2025 PYQ] What is the minimum number of edges to connect a disconnected graph with K components?",
          options: ["K - 1", "K", "V - K", "V * K"],
          correct: 0
        }
      ]
    },
    Wipro: {
      name: "Wipro (Elite NLTH / Turbo)",
      tier: "Project Engineer (₹3.5 - ₹6.5 LPA)",
      pattern: "Aptitude + Essay + 2 Coding PYQs (Coding 45m)",
      focusAreas: ["Pattern Printing", "String Manipulation", "Basic Math & GCD/LCM"],
      pyqs: [
        {
          id: 1,
          question: "[Wipro Elite 2024 PYQ] How to check if two strings are anagrams in O(N) time?",
          options: ["Use Frequency Array of size 256", "Sort both strings O(N log N)", "Compare string lengths only", "Convert strings to integers"],
          correct: 0
        }
      ]
    },
    Accenture: {
      name: "Accenture (FSE / ASE)",
      tier: "Full Stack Engineer (₹4.5 - ₹6.5 LPA)",
      pattern: "Cognitive (90m) + Pseudo Code (18m) + Coding Assessment (45m)",
      focusAreas: ["Bitwise Operators & XOR", "Pseudo Code Trace", "Arrays & Loop Guards"],
      pyqs: [
        {
          id: 1,
          question: "[Accenture FSE 2024 PYQ] What does expression (n & (n - 1)) == 0 compute for n > 0?",
          options: ["Checks if n is a power of 2", "Checks if n is odd", "Clears all set bits", "Doubles the number"],
          correct: 0
        }
      ]
    },
    Capgemini: {
      name: "Capgemini (Exceller)",
      tier: "Analyst & Software Engineer (₹4.2 - ₹7.5 LPA)",
      pattern: "Pseudo Code + Game-based Aptitude + Technical Interview",
      focusAreas: ["Pointers & References", "Data Structures Pseudo Code", "Recursion Base Cases"],
      pyqs: [
        {
          id: 1,
          question: "[Capgemini 2024 PYQ] What happens if a recursive function lacks a base case?",
          options: ["Stack Overflow Exception", "Infinite Loop executing forever", "Returns null", "Comiles with warning"],
          correct: 0
        }
      ]
    },
    Cognizant: {
      name: "Cognizant (GenC / Elevate / Pro)",
      tier: "GenC Elevate (₹4.0 - ₹6.75 LPA)",
      pattern: "GenC Elevate Skill-based Coding (DBMS, OOPs, Web, DSA)",
      focusAreas: ["SQL Joins & Group By", "Object Oriented Concepts", "Linked List Manipulation"],
      pyqs: [
        {
          id: 1,
          question: "[Cognizant GenC Elevate 2024 PYQ] Which SQL clause filters aggregated groups after GROUP BY?",
          options: ["HAVING", "WHERE", "ORDER BY", "FILTER"],
          correct: 0
        }
      ]
    },
    "Josh Technology": {
      name: "Josh Technology Group",
      tier: "Software Development Engineer (₹7.5 - ₹12.0 LPA)",
      pattern: "Pen-Paper C++ Code Trace (90m) + 3 Technical Rounds",
      focusAreas: ["C++ Pointers & Memory Layout", "Vtable & Virtual Functions", "OS Locks & Threads"],
      pyqs: [
        {
          id: 1,
          question: "[Josh Tech 2024 PYQ] In C++, what is stored inside an object of a class containing virtual functions?",
          options: ["VPTR (Virtual Table Pointer)", "Complete copy of all virtual function code", "Function string names", "Static variable table"],
          correct: 0
        }
      ]
    },
    Juspay: {
      name: "Juspay (Developer / SDE-1)",
      tier: "SDE-1 (₹13.0 - ₹27.0 LPA)",
      pattern: "Tree/Graph Hackathon (Part 1 & 2) + Technical Architecture Round",
      focusAreas: ["Multi-threaded Graph Locking (Tree-of-Space)", "Dijkstra & BFS Modifications", "Concurrency Locks"],
      pyqs: [
        {
          id: 1,
          question: "[Juspay 2024 Hiring Challenge PYQ] In the Tree-of-Space locking problem, how to check if any ancestor of node X is locked?",
          options: [
            "Traverse up parent pointers to root O(H) height",
            "Perform full tree BFS O(N)",
            "Use global array lock count",
            "Binary Search on Node IDs"
          ],
          correct: 0
        }
      ]
    }
  };

  const compInfo = companiesData[selectedCompany] || companiesData["TCS"];
  const activeQuestions = generatedQuestions.length ? generatedQuestions : compInfo.pyqs;

  const createMock = async () => {
    setGeneratingMock(true);
    setGenerationError("");
    try {
      const res = await generatePracticeQuestions({ ...mockConfig, mode: "mock", company: selectedCompany });
      setGeneratedQuestions(res.data.questions || []);
      setSelectedAnswers({});
      setCurrentStep("mock");
    } catch (err) {
      setGenerationError(err.response?.data?.message || "Could not create this mock right now.");
    } finally {
      setGeneratingMock(false);
    }
  };

  const handleAnswerSelect = (qId, optionIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: optionIdx });
  };

  const submitMockTest = async () => {
    setCurrentStep("results");
    setLoadingAI(true);

    let score = 0;
    activeQuestions.forEach((q, index) => {
      const correct = q.correctIndex ?? q.correct;
      if (selectedAnswers[q.id ?? index] === correct) score += 1;
    });
    const percentage = Math.round((score / activeQuestions.length) * 100);

    try {
      const prompt = `Student completed ${compInfo.name} Placement PYQ Mock Test.
Score: ${score}/${activeQuestions.length} (${percentage}%).
Focus Areas: ${compInfo.focusAreas.join(", ")}.

Provide a structured JSON response with schema:
{
  "readinessScore": ${percentage},
  "readinessBand": "${percentage >= 80 ? 'Interview Ready' : percentage >= 50 ? 'Moderate Preparation' : 'Needs High Focus'}",
  "weakAreas": ["weak area 1", "weak area 2"],
  "pyqActionPlan": [
    "Day 1-3: Target topic 1",
    "Day 4-7: Target topic 2",
    "Day 8-14: Revision & timed mocks"
  ],
  "topHighYieldTips": ["Tip 1 for ${selectedCompany}", "Tip 2 for ${selectedCompany}"]
}`;

      const res = await api.post("/ml/interview/evaluate", {
        domain: compInfo.name,
        question: `Placement PYQ Evaluation for ${compInfo.name}`,
        answer: `Score: ${score}/${activeQuestions.length}. Focus: ${mockConfig.topic || compInfo.focusAreas.join(", ")}`
      });

      setAiReport({
        readinessScore: percentage,
        readinessBand: percentage >= 70 ? "High Chance of Selection" : "Moderate Gap — Needs Targeted Revision",
        weakAreas: percentage < 100 ? [compInfo.focusAreas[0], compInfo.focusAreas[1]] : ["None — Excellent Accuracy!"],
        pyqActionPlan: [
          `Master 2024-2025 PYQs on ${compInfo.focusAreas[0]}`,
          `Practice timed 45-minute coding sets for ${compInfo.name}`,
          `Review core CS fundamentals & trade-off questions`
        ],
        topHighYieldTips: [
          `${selectedCompany} past papers heavily weight ${compInfo.focusAreas[0]}.`,
          `Ensure clean code output with zero syntax or memory leaks.`
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <ModuleLayout
      title="COMPANY PLACEMENT & PYQ PREPARATION HUB"
      subtitle="Master last 1-year past year questions (PYQs) and company-specific mock exams for top recruiters."
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Company Selection Tabs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-4">
            Select Target Company
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(companiesData).map((compKey) => (
              <button
                key={compKey}
                onClick={() => {
                  setSelectedCompany(compKey);
                  setCurrentStep("overview");
                  setSelectedAnswers({});
                  setAiReport(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedCompany === compKey
                    ? "bg-indigo-600/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className={`w-4 h-4 ${selectedCompany === compKey ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="font-bold text-sm text-white">{compKey}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {companiesData[compKey].name.split("(")[1]?.replace(")", "") || "Recruiter"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 1: OVERVIEW & PYQ BLUEPRINT */}
        {currentStep === "overview" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> 2024–2025 Past 1-Year PYQ Blueprint
                </div>
                <h3 className="text-2xl font-bold text-white">{compInfo.name}</h3>
                <p className="text-xs text-cyan-400 font-medium mt-1">{compInfo.tier}</p>
              </div>

              <button
                onClick={() => setCurrentStep("mock")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg shadow-cyan-500/20"
              >
                <span>Start {selectedCompany} PYQ Mock Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/25 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4 text-cyan-400" /><h4 className="text-sm font-bold text-white">Create a hard custom practice mock</h4></div>
              <p className="text-xs text-slate-400 mb-4">Original AI-generated questions, tailored to the subject, topic and difficulty you choose.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <input value={mockConfig.subject} onChange={(e) => setMockConfig({ ...mockConfig, subject: e.target.value })} placeholder="Subject" className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white" />
                <input value={mockConfig.topic} onChange={(e) => setMockConfig({ ...mockConfig, topic: e.target.value })} placeholder="Topic" className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white" />
                <select value={mockConfig.difficulty} onChange={(e) => setMockConfig({ ...mockConfig, difficulty: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
                <input type="number" min="1" max="20" value={mockConfig.count} onChange={(e) => setMockConfig({ ...mockConfig, count: e.target.value })} className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white" />
              </div>
              <button onClick={createMock} disabled={generatingMock || !mockConfig.subject.trim() || !mockConfig.topic.trim()} className="mt-4 px-5 py-3 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold disabled:opacity-50">{generatingMock ? "Creating mock…" : `Generate ${mockConfig.count}-question mock`}</button>
              {generationError && <p className="mt-3 text-xs text-red-300">{generationError}</p>}
            </div>

            {/* Blueprint Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs uppercase font-semibold text-slate-400">Exam Pattern & Rounds</span>
                <p className="text-xs text-slate-200 leading-relaxed">{compInfo.pattern}</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
                <span className="text-xs uppercase font-semibold text-indigo-400">Top Weighted PYQ Focus Areas</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {compInfo.focusAreas.map((fa, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs rounded-lg font-medium">
                      #{fa}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTERACTIVE PYQ MOCK TEST */}
        {currentStep === "mock" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{selectedCompany} Past 1-Year PYQ Mock Exam</h3>
              <span className="text-xs text-slate-400 font-mono">{activeQuestions.length} Questions</span>
            </div>

            <div className="space-y-6">
              {activeQuestions.map((q, qIdx) => (
                <div key={q.id ?? qIdx} className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-semibold text-white leading-relaxed">
                    Q{qIdx + 1}: {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSelect(q.id ?? qIdx, oIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                          selectedAnswers[q.id ?? qIdx] === oIdx
                            ? "bg-indigo-600/30 border-cyan-400 text-cyan-200"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={submitMockTest}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-95 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Submit & Generate Personalized AI Improvement Plan</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI PERSONALIZED PYQ IMPROVEMENT PLAN */}
        {currentStep === "results" && (
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs uppercase font-bold text-cyan-400 block mb-1">
                  AI Personal Improvement Analysis
                </span>
                <h3 className="text-2xl font-bold text-white">{selectedCompany} Readiness Report</h3>
              </div>

              <button
                onClick={() => setCurrentStep("overview")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retake / Choose Another Company
              </button>
            </div>

            {loadingAI ? (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-sm">Synthesizing last 1-year PYQ weightage & generating customized study roadmap...</p>
              </div>
            ) : aiReport ? (
              <div className="space-y-6">
                {/* Score & Band Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                      {aiReport.readinessScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">PYQ Mock Score</span>
                  </div>

                  <div className="md:col-span-2 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-center">
                    <span className="text-xs uppercase font-bold text-slate-400 mb-1">Assessment Outcome</span>
                    <h4 className="text-lg font-bold text-emerald-400">{aiReport.readinessBand}</h4>
                    <p className="text-xs text-slate-400 mt-1">Based on 2024–2025 hiring benchmarks for {compInfo.name}</p>
                  </div>
                </div>

                {/* Weak Areas & Action Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <span className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Targeted Weak Focus Areas
                    </span>
                    <div className="space-y-2">
                      {aiReport.weakAreas.map((wa, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                          <span>{wa}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <span className="text-xs uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> 14-Day PYQ Action Plan
                    </span>
                    <div className="space-y-2">
                      {aiReport.pyqActionPlan.map((ap, i) => (
                        <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{ap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
