import { useState, useEffect, useCallback } from "react";
import { getToken, getUser } from "../../../utils/auth";
import {
  getReferrals, getMyReferrals, createReferral, sendReferralRequest,
  respondToReferralRequest, initiateReferralChat,
  getMyReferralChats, getReferralChatMessages, sendReferralChatMessage,
  deleteReferral,
} from "../../../api/referralsApi";
import {
  Search, Plus, Users, GraduationCap,
  Building2, MessageCircle, X, Check,
  FileText, Award, Send, UserPlus,
  Filter, Linkedin, Link2, Clock,
} from "lucide-react";

const DOMAINS = [
  "All", "Software Development", "Full Stack", "Backend", "Frontend",
  "Data Science", "AI/ML", "Design", "DevOps", "Cloud",
  "Product", "Marketing", "Finance", "Consulting", "Mobile",
];

const ReferralsPage = () => {
  const user = getUser();
  const isLoggedIn = !!getToken();

  // Tab state
  const [activeView, setActiveView] = useState("seekers"); // "seekers" | "providers" | "my-profile" | "my-chats"
  const [referrals, setReferrals] = useState([]);
  const [myReferrals, setMyReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [seekerCount, setSeekerCount] = useState(0);
  const [providerCount, setProviderCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createType, setCreateType] = useState("seeker");
  const [formData, setFormData] = useState({
    domain: "", skills: "", bio: "", resumeUrl: "",
    targetCompanies: "", experience: "Fresher", pitch: "",
    linkedinUrl: "", portfolioUrl: "",
    company: "", position: "", referralDomains: "",
    availability: "open", maxReferrals: 5,
  });
  const [creating, setCreating] = useState(false);

  // Request modal
  const [showRequestModal, setShowRequestModal] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  // Chat
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Detail view
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showInitiateModal, setShowInitiateModal] = useState(null);
  const [initiateMessage, setInitiateMessage] = useState("");

  // ═══ Fetch referrals ═══
  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const type = activeView === "seekers" ? "seeker" : activeView === "providers" ? "provider" : "";
      const params = {};
      if (type) params.type = type;
      if (search) params.search = search;
      if (domain && domain !== "All") params.domain = domain;

      const res = await getReferrals(params);
      setReferrals(res.data.referrals);
      setTotal(res.data.total);
      setSeekerCount(res.data.seekerCount);
      setProviderCount(res.data.providerCount);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [activeView, search, domain]);

  useEffect(() => {
    if (activeView === "seekers" || activeView === "providers") {
      fetchReferrals();
    } else if (activeView === "my-profile") {
      fetchMyReferrals();
    } else if (activeView === "my-chats") {
      fetchChats();
    }
  }, [activeView, fetchReferrals]);

  const fetchMyReferrals = async () => {
    setLoading(true);
    try {
      const res = await getMyReferrals();
      setMyReferrals(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await getMyReferralChats();
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ═══ Create referral ═══
  const handleCreate = async () => {
    if (!formData.domain) return alert("Domain is required");
    setCreating(true);
    try {
      await createReferral({
        type: createType,
        domain: formData.domain,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        bio: formData.bio,
        resumeUrl: formData.resumeUrl,
        targetCompanies: formData.targetCompanies.split(",").map((s) => s.trim()).filter(Boolean),
        experience: formData.experience,
        pitch: formData.pitch,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        company: formData.company,
        position: formData.position,
        referralDomains: formData.referralDomains.split(",").map((s) => s.trim()).filter(Boolean),
        availability: formData.availability,
        maxReferrals: parseInt(formData.maxReferrals) || 5,
      });
      setShowCreateForm(false);
      setFormData({ domain: "", skills: "", bio: "", resumeUrl: "", targetCompanies: "", experience: "Fresher", pitch: "", linkedinUrl: "", portfolioUrl: "", company: "", position: "", referralDomains: "", availability: "open", maxReferrals: 5 });
      fetchReferrals();
      fetchMyReferrals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create referral profile");
    }
    setCreating(false);
  };

  // ═══ Send request ═══
  const handleSendRequest = async (referralId) => {
    setSendingRequest(true);
    try {
      await sendReferralRequest(referralId, { message: requestMessage });
      setShowRequestModal(null);
      setRequestMessage("");
      alert("Request sent successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
    setSendingRequest(false);
  };

  // ═══ Respond to request ═══
  const handleRespond = async (referralId, requestId, action) => {
    try {
      await respondToReferralRequest(referralId, { requestId, action });
      fetchMyReferrals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to respond");
    }
  };

  // ═══ Delete referral ═══
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this referral profile?")) return;
    try {
      await deleteReferral(id);
      fetchMyReferrals();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // ═══ Provider initiates chat ═══
  const handleInitiateChat = async (seekerReferralId) => {
    try {
      const res = await initiateReferralChat({ seekerReferralId, message: initiateMessage });
      setShowInitiateModal(null);
      setInitiateMessage("");
      setActiveView("my-chats");
      fetchChats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to initiate chat");
    }
  };

  // ═══ Chat ═══
  const openChat = async (chatId) => {
    try {
      const res = await getReferralChatMessages(chatId);
      setChatMessages(res.data);
      setActiveChat(chatId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    setSendingMsg(true);
    try {
      await sendReferralChatMessage({ chatId: activeChat, content: chatInput });
      setChatInput("");
      const res = await getReferralChatMessages(activeChat);
      setChatMessages(res.data);
    } catch (err) {
      console.error(err);
    }
    setSendingMsg(false);
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // ════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════

  return (
    <div className="space-y-0">
      {/* ═══ TAB BAR ═══ */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
          {[
            { label: "🎓 Seeking Referrals", value: "seekers", count: seekerCount },
            { label: "🏢 Referral Providers", value: "providers", count: providerCount },
            { label: "📋 My Profile", value: "my-profile" },
            { label: "💬 Chats", value: "my-chats" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setActiveView(tab.value); setActiveChat(null); setChatMessages(null); }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeView === tab.value
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeView === tab.value ? "bg-white/20" : "bg-zinc-800"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {isLoggedIn && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-purple-500/20"
          >
            <Plus size={16} /> Create Profile
          </button>
        )}
      </div>

      {/* ═══ INFO BANNER ═══ */}
      {activeView === "seekers" && (
        <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <GraduationCap size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm text-amber-300 font-medium">Students Seeking Referrals</p>
            <p className="text-xs text-zinc-500">
              Students looking for referrals at top companies. If you can help, reach out!
            </p>
          </div>
        </div>
      )}
      {activeView === "providers" && (
        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Building2 size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm text-emerald-300 font-medium">Alumni & Professionals Offering Referrals</p>
            <p className="text-xs text-zinc-500">
              Alumni and industry professionals willing to refer deserving candidates. Reach out to connect!
            </p>
          </div>
        </div>
      )}

      {/* ═══ SEARCH & FILTERS (for seekers/providers views) ═══ */}
      {(activeView === "seekers" || activeView === "providers") && (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-5">
            <form onSubmit={(e) => { e.preventDefault(); fetchReferrals(); }} className="flex gap-2 flex-1 max-w-xl">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  placeholder="Search by domain, skills, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm focus:border-purple-500 outline-none transition"
                />
              </div>
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-sm font-medium transition">
                Search
              </button>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition ${
                showFilters ? "bg-purple-600 border-purple-500" : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              <Filter size={14} /> Domain Filter
            </button>
          </div>

          {showFilters && (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6">
              <label className="block text-xs text-zinc-500 mb-2">DOMAIN</label>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDomain(d === "All" ? "" : d)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      (domain === d) || (d === "All" && !domain)
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <p className="text-sm text-zinc-500 mb-4">
            Showing <span className="text-white font-medium">{referrals.length}</span> of{" "}
            <span className="text-white font-medium">{total}</span> profiles
          </p>
        </>
      )}

      {/* ═══ REFERRAL CARDS ═══ */}
      {(activeView === "seekers" || activeView === "providers") && (
        loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-1/3 mb-3" />
                <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4" />
                <div className="flex gap-3">
                  <div className="h-3 bg-zinc-800 rounded w-20" />
                  <div className="h-3 bg-zinc-800 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-400 text-lg">No {activeView === "seekers" ? "seeker" : "provider"} profiles yet</p>
            <p className="text-zinc-600 text-sm mt-1">Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((ref) => (
              <ReferralCard
                key={ref._id}
                referral={ref}
                currentUser={user}
                onRequest={(id) => { setShowRequestModal(id); setRequestMessage(""); }}
                onInitiateChat={(id) => { setShowInitiateModal(id); setInitiateMessage(""); }}
                isProvider={activeView === "providers"}
              />
            ))}
          </div>
        )
      )}

      {/* ═══ MY PROFILES ═══ */}
      {activeView === "my-profile" && (
        <div>
          {loading ? (
            <div className="text-center py-20 text-zinc-500">Loading...</div>
          ) : myReferrals.length === 0 ? (
            <div className="text-center py-16">
              <UserPlus size={48} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-400 text-lg">You haven't created a referral profile yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl text-sm font-medium transition"
              >
                Create Your Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myReferrals.map((ref) => (
                <div key={ref._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-lg font-medium ${
                          ref.type === "seeker"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {ref.type === "seeker" ? "🎓 Seeker" : "🏢 Provider"}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          ref.status === "active" ? "bg-green-500/15 text-green-400" : "bg-zinc-700 text-zinc-400"
                        }`}>
                          {ref.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{ref.domain}</h3>
                      {ref.company && <p className="text-sm text-zinc-400">{ref.position} at {ref.company}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(ref._id)}
                      className="text-zinc-600 hover:text-red-400 transition p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {ref.bio && <p className="text-sm text-zinc-300 mb-4">{ref.bio}</p>}

                  {ref.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {ref.skills.map((s) => (
                        <span key={s} className="bg-zinc-800 px-2.5 py-0.5 rounded text-xs text-zinc-400">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Incoming Requests */}
                  {ref.requests?.length > 0 && (
                    <div className="mt-4 border-t border-zinc-800 pt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle size={14} className="text-purple-400" />
                        Incoming Requests ({ref.requests.length})
                      </h4>
                      <div className="space-y-3">
                        {ref.requests.map((req) => (
                          <div key={req._id} className="bg-zinc-800/50 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                              {req.from?.name?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{req.from?.name || "User"}</p>
                              <p className="text-xs text-zinc-500">{req.from?.department} • {req.from?.role}</p>
                              {req.message && <p className="text-xs text-zinc-400 mt-1 italic">"{req.message}"</p>}
                            </div>
                            {req.status === "pending" ? (
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleRespond(ref._id, req._id, "accepted")}
                                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1"
                                >
                                  <Check size={12} /> Accept
                                </button>
                                <button
                                  onClick={() => handleRespond(ref._id, req._id, "rejected")}
                                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1"
                                >
                                  <X size={12} /> Decline
                                </button>
                              </div>
                            ) : (
                              <span className={`text-xs px-2 py-1 rounded ${
                                req.status === "accepted" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                              }`}>
                                {req.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ MY CHATS ═══ */}
      {activeView === "my-chats" && (
        <div className="grid lg:grid-cols-3 gap-4" style={{ minHeight: "500px" }}>
          {/* Chat list */}
          <div className="space-y-2 lg:border-r lg:border-zinc-800 lg:pr-4">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Conversations</h3>
            {loading ? (
              <div className="text-center py-10 text-zinc-500">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle size={32} className="mx-auto text-zinc-700 mb-3" />
                <p className="text-xs text-zinc-500">No referral conversations yet</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherUser = chat.seeker?._id === user?._id ? chat.provider : chat.seeker;
                return (
                  <button
                    key={chat._id}
                    onClick={() => openChat(chat._id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${
                      activeChat === chat._id
                        ? "bg-purple-600/20 border border-purple-500/30"
                        : "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {otherUser?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{otherUser?.name || "User"}</p>
                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-purple-500 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Chat messages */}
          <div className="lg:col-span-2">
            {!activeChat ? (
              <div className="flex items-center justify-center h-full text-zinc-600">
                <div className="text-center">
                  <MessageCircle size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            ) : !chatMessages ? (
              <div className="text-center py-20 text-zinc-500">Loading...</div>
            ) : (
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col" style={{ height: "500px" }}>
                {/* Chat header */}
                <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                    {chatMessages.seeker?._id === user?._id
                      ? chatMessages.provider?.name?.charAt(0)
                      : chatMessages.seeker?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {chatMessages.seeker?._id === user?._id
                        ? chatMessages.provider?.name
                        : chatMessages.seeker?.name || "User"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {chatMessages.referral?.domain} {chatMessages.referral?.company ? `• ${chatMessages.referral.company}` : ""}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.messages?.map((msg, i) => {
                    const isMe = (msg.sender?._id || msg.sender) === user?._id;
                    const isSystem = msg.type === "system";
                    return (
                      <div key={i} className={`flex ${isSystem ? "justify-center" : isMe ? "justify-end" : "justify-start"}`}>
                        {isSystem ? (
                          <div className="bg-purple-500/10 text-purple-300 text-xs px-4 py-2 rounded-full max-w-sm text-center">
                            {msg.content}
                          </div>
                        ) : (
                          <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-purple-600 text-white rounded-br-md"
                              : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                          }`}>
                            {msg.content}
                            <p className={`text-[10px] mt-1 ${isMe ? "text-purple-200" : "text-zinc-500"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-zinc-800 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={sendingMsg || !chatInput.trim()}
                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ REQUEST MODAL ═══ */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Send Referral Request</h3>
            <p className="text-xs text-zinc-500 mb-4">Write a brief message to introduce yourself and explain why you're reaching out.</p>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Hi, I'm interested in getting a referral. I have experience in..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSendRequest(showRequestModal)}
                disabled={sendingRequest}
                className="flex-1 bg-purple-600 hover:bg-purple-500 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {sendingRequest ? "Sending..." : "Send Request"}
              </button>
              <button
                onClick={() => setShowRequestModal(null)}
                className="px-4 py-2.5 text-zinc-400 text-sm hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROVIDER INITIATE CHAT MODAL ═══ */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Offer Referral</h3>
            <p className="text-xs text-zinc-500 mb-4">You liked this profile! Send an introductory message to start a conversation.</p>
            <textarea
              value={initiateMessage}
              onChange={(e) => setInitiateMessage(e.target.value)}
              placeholder="Hi! I work at [Company] and I'd like to offer you a referral..."
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleInitiateChat(showInitiateModal)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Start Chat
              </button>
              <button
                onClick={() => setShowInitiateModal(null)}
                className="px-4 py-2.5 text-zinc-400 text-sm hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE FORM MODAL ═══ */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Create Referral Profile</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            {/* Type Toggle */}
            <div className="flex bg-zinc-800 rounded-xl p-1 mb-5">
              <button
                onClick={() => setCreateType("seeker")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                  createType === "seeker" ? "bg-amber-600 text-white" : "text-zinc-400"
                }`}
              >
                🎓 I'm Seeking a Referral
              </button>
              <button
                onClick={() => setCreateType("provider")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
                  createType === "provider" ? "bg-emerald-600 text-white" : "text-zinc-400"
                }`}
              >
                🏢 I Can Provide Referrals
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Common fields */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Domain *</label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                >
                  <option value="">Select Domain</option>
                  {DOMAINS.filter((d) => d !== "All").map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Skills (comma-separated)</label>
                <input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, Python..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Bio / About</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder={createType === "seeker" ? "Brief about yourself, your projects, achievements..." : "Your role, experience, and how you can help..."}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Seeker-specific */}
              {createType === "seeker" && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Resume URL</label>
                    <input
                      value={formData.resumeUrl}
                      onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Target Companies (comma-separated)</label>
                    <input
                      value={formData.targetCompanies}
                      onChange={(e) => setFormData({ ...formData, targetCompanies: e.target.value })}
                      placeholder="Google, Microsoft, Amazon..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Experience Level</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-4 years">2-4 years</option>
                      <option value="4+ years">4+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Why should someone refer you?</label>
                    <textarea
                      value={formData.pitch}
                      onChange={(e) => setFormData({ ...formData, pitch: e.target.value })}
                      placeholder="Your elevator pitch..."
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Provider-specific */}
              {createType === "provider" && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Company *</label>
                    <input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Google, Microsoft..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Your Position</label>
                    <input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="SDE-2, Senior Designer..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Referral Domains (comma-separated)</label>
                    <input
                      value={formData.referralDomains}
                      onChange={(e) => setFormData({ ...formData, referralDomains: e.target.value })}
                      placeholder="SDE, Design, Data Science..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                      >
                        <option value="open">Open</option>
                        <option value="limited">Limited</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1">Max Referrals</label>
                      <input
                        type="number"
                        value={formData.maxReferrals}
                        onChange={(e) => setFormData({ ...formData, maxReferrals: e.target.value })}
                        min="1" max="50"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Common links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">LinkedIn URL</label>
                  <input
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Portfolio URL</label>
                  <input
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://portfolio.dev"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 bg-purple-600 hover:bg-purple-500 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Profile"}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2.5 text-zinc-400 text-sm hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════
// REFERRAL CARD COMPONENT
// ════════════════════════════════════════════
const ReferralCard = ({ referral, currentUser, onRequest, onInitiateChat, isProvider }) => {
  const isOwn = currentUser?._id === referral.user?._id;

  return (
    <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-lg font-bold shrink-0">
          {referral.user?.name?.charAt(0) || "U"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-lg font-semibold group-hover:text-purple-300 transition">
                {referral.user?.name || "Anonymous"}
              </h3>
              <p className="text-sm text-zinc-400">
                {referral.user?.department}
                {referral.user?.yearOfStudy ? ` • Year ${referral.user.yearOfStudy}` : ""}
                {referral.user?.role === "alumni" ? " • Alumni" : ""}
                {referral.user?.role === "teacher" ? " • Faculty" : ""}
              </p>
            </div>

            {/* CTA */}
            {!isOwn && currentUser && (
              <div className="flex gap-2 shrink-0">
                {isProvider ? (
                  // For providers, students can request
                  <button
                    onClick={() => onRequest(referral._id)}
                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <UserPlus size={13} /> Request Referral
                  </button>
                ) : (
                  // For seekers, providers can offer (initiate chat)
                  <button
                    onClick={() => onInitiateChat(referral._id)}
                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <MessageCircle size={13} /> Offer Referral
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Domain & Company */}
          <div className="flex flex-wrap gap-2 mb-3 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
              isProvider
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
            }`}>
              {referral.domain}
            </span>
            {referral.company && (
              <span className="bg-blue-500/15 text-blue-400 text-xs px-2.5 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1">
                <Building2 size={10} /> {referral.position ? `${referral.position} @ ` : ""}{referral.company}
              </span>
            )}
            {referral.experience && referral.experience !== "Fresher" && (
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-lg">
                {referral.experience}
              </span>
            )}
            {isProvider && referral.availability && (
              <span className={`text-xs px-2.5 py-1 rounded-lg ${
                referral.availability === "open"
                  ? "bg-green-500/15 text-green-400"
                  : referral.availability === "limited"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : "bg-red-500/15 text-red-400"
              }`}>
                {referral.availability === "open" ? "✅ Open" : referral.availability === "limited" ? "⚠️ Limited" : "🔴 Closed"}
              </span>
            )}
          </div>

          {/* Bio / Pitch */}
          {(referral.bio || referral.pitch) && (
            <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
              {referral.pitch || referral.bio}
            </p>
          )}

          {/* Skills */}
          {referral.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {referral.skills.slice(0, 8).map((skill) => (
                <span key={skill} className="bg-zinc-800/80 px-2.5 py-0.5 rounded text-xs text-zinc-400">
                  {skill}
                </span>
              ))}
              {referral.skills.length > 8 && (
                <span className="text-xs text-zinc-600">+{referral.skills.length - 8} more</span>
              )}
            </div>
          )}

          {/* Target companies / Referral domains */}
          {referral.targetCompanies?.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="text-zinc-600">Target:</span>
              {referral.targetCompanies.slice(0, 4).map((c) => (
                <span key={c} className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">{c}</span>
              ))}
            </div>
          )}
          {referral.referralDomains?.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <span className="text-zinc-600">Can refer for:</span>
              {referral.referralDomains.map((d) => (
                <span key={d} className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">{d}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-zinc-600 pt-2 border-t border-zinc-800/50 mt-2">
            {referral.linkedinUrl && (
              <a href={referral.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition" onClick={(e) => e.stopPropagation()}>
                <Linkedin size={11} /> LinkedIn
              </a>
            )}
            {referral.portfolioUrl && (
              <a href={referral.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition" onClick={(e) => e.stopPropagation()}>
                <Link2 size={11} /> Portfolio
              </a>
            )}
            {referral.resumeUrl && (
              <a href={referral.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition" onClick={(e) => e.stopPropagation()}>
                <FileText size={11} /> Resume
              </a>
            )}
            {isProvider && referral.referralsGiven > 0 && (
              <span className="flex items-center gap-1">
                <Award size={11} className="text-yellow-400" /> {referral.referralsGiven} referrals given
              </span>
            )}
            <span className="ml-auto">
              <Clock size={11} className="inline mr-1" />
              {new Date(referral.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;