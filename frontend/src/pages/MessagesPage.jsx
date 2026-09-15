import { useState, useEffect, useRef } from "react";
import ModuleLayout from "../../components/ModuleLayout";
import {
  getMyConversations, getMessages, sendMessage,
  searchUsers, getOrCreateConversation,
} from "../../api/dmApi";
import { getUser } from "../../utils/auth";
import {
  Search, Send, ArrowLeft, MessageCircle, User, Plus,
} from "lucide-react";

export default function MessagesPage() {
  const user = getUser();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await getMyConversations();
      setConversations(res.data || []);
    } catch (err) { console.error(err); }
  };

  const openConversation = async (conv) => {
    try {
      const res = await getMessages(conv._id);
      setActiveConv(res.data);
      setMessages(res.data.messages || []);
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!msgInput.trim() || !activeConv) return;
    try {
      await sendMessage(activeConv._id, msgInput);
      setMsgInput("");
      // Refresh messages
      const res = await getMessages(activeConv._id);
      setMessages(res.data.messages || []);
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    try {
      const res = await searchUsers(q);
      setSearchResults(res.data || []);
    } catch (err) { console.error(err); }
  };

  const startChat = async (targetUser) => {
    try {
      const res = await getOrCreateConversation(targetUser._id);
      setShowSearch(false);
      setSearchQuery("");
      setSearchResults([]);
      openConversation(res.data);
      fetchConversations();
    } catch (err) { console.error(err); }
  };

  const getOtherUser = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id) || {};
  };

  return (
    <ModuleLayout title="MESSAGES" subtitle="Direct messages with any campus user">
      <div className="max-w-5xl mx-auto">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: "70vh" }}>
          <div className="grid grid-cols-12 h-full">

            {/* Conversation List */}
            <div className={`${activeConv ? "hidden md:block" : ""} col-span-12 md:col-span-4 border-r border-zinc-800 flex flex-col`}>
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Chats</h3>
                  <button onClick={() => setShowSearch(!showSearch)} className="text-purple-400 hover:text-purple-300 transition">
                    <Plus size={16} />
                  </button>
                </div>

                {showSearch && (
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full bg-zinc-800 border border-zinc-700 pl-9 pr-3 py-2 rounded-lg text-xs outline-none focus:border-purple-500"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-zinc-700 rounded-lg overflow-hidden z-10 max-h-48 overflow-y-auto">
                        {searchResults.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => startChat(u)}
                            className="w-full flex items-center gap-2 p-2.5 hover:bg-zinc-800 transition text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {u.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{u.name}</p>
                              <p className="text-[10px] text-zinc-500">{u.department}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageCircle size={32} className="mx-auto text-zinc-700 mb-2" />
                    <p className="text-xs text-zinc-500">No conversations yet</p>
                    <button onClick={() => setShowSearch(true)} className="text-xs text-purple-400 mt-2">Start a chat</button>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const other = getOtherUser(conv);
                    const isActive = activeConv?._id === conv._id;
                    return (
                      <button
                        key={conv._id}
                        onClick={() => openConversation(conv)}
                        className={`w-full flex items-center gap-3 p-3.5 transition text-left border-b border-zinc-800/50 ${
                          isActive ? "bg-purple-600/10" : "hover:bg-zinc-800/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {other.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{other.name || "User"}</p>
                          <p className="text-xs text-zinc-500 truncate">{conv.lastMessage?.content || "Start chatting..."}</p>
                        </div>
                        {conv.lastMessage?.createdAt && (
                          <span className="text-[10px] text-zinc-600 shrink-0">
                            {new Date(conv.lastMessage.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${!activeConv ? "hidden md:flex" : "flex"} col-span-12 md:col-span-8 flex-col`}>
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto text-zinc-700 mb-3" />
                    <p className="text-zinc-500">Select a conversation or start a new one</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
                    <button onClick={() => setActiveConv(null)} className="md:hidden text-zinc-400 hover:text-white transition">
                      <ArrowLeft size={18} />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
                      {getOtherUser(activeConv).name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{getOtherUser(activeConv).name}</p>
                      <p className="text-[10px] text-zinc-500">{getOtherUser(activeConv).department} • {getOtherUser(activeConv).role}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, i) => {
                      const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                      return (
                        <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMine
                              ? "bg-purple-600 text-white rounded-br-md"
                              : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                          }`}>
                            <p>{msg.content}</p>
                            <p className={`text-[9px] mt-1 ${isMine ? "text-purple-200/60" : "text-zinc-500"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-zinc-800 flex gap-2">
                    <input
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500"
                    />
                    <button onClick={handleSend} disabled={!msgInput.trim()} className="bg-purple-600 hover:bg-purple-500 px-4 rounded-xl transition disabled:opacity-50">
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
