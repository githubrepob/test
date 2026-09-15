import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { getMyChats, getChatMessages, sendChatMessage } from "../../../api/internshipsApi";
import { getUser } from "../../../utils/auth";
import {
  ArrowLeft, Send, MessageCircle, Building2, Briefcase,
  Circle, Check, CheckCheck
} from "lucide-react";

export default function InternshipChatPage() {
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchChats();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (urlChatId && chats.length > 0) {
      const found = chats.find((c) => c._id === urlChatId);
      if (found) selectChat(found);
    }
    // eslint-disable-next-line
  }, [urlChatId, chats]);

  const fetchChats = async () => {
    try {
      const res = await getMyChats();
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    try {
      const res = await getChatMessages(chat._id);
      setMessages(res.data.messages || []);
      scrollToBottom();

      // Poll for new messages every 5 seconds
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res2 = await getChatMessages(chat._id);
          setMessages(res2.data.messages || []);
        } catch (err) {
          // silent
        }
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await sendChatMessage({
        chatId: selectedChat._id,
        content: newMessage.trim(),
      });
      setNewMessage("");

      // Refresh messages
      const res = await getChatMessages(selectedChat._id);
      setMessages(res.data.messages || []);
      scrollToBottom();

      // Refresh chat list for last message preview
      fetchChats();
    } catch (err) {
      alert("Failed to send");
    }
    setSending(false);
  };

  const getOtherUser = (chat) => {
    if (chat.poster?._id === user?._id) {
      return chat.applicant;
    }
    return chat.poster;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = "";
  messages.forEach((msg) => {
    const date = formatDate(msg.createdAt);
    if (date !== lastDate) {
      groupedMessages.push({ type: "date", date });
      lastDate = date;
    }
    groupedMessages.push({ type: "message", ...msg });
  });

  return (
    <ModuleLayout title="" subtitle="">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/careers/internships")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Careers
        </button>

        <div className="flex bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: "70vh" }}>
          {/* ═══ CHAT LIST SIDEBAR ═══ */}
          <div className="w-80 border-r border-zinc-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <MessageCircle size={16} className="text-purple-400" />
                Messages
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-xs text-zinc-500">Loading chats...</div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle size={32} className="mx-auto text-zinc-700 mb-3" />
                  <p className="text-xs text-zinc-500">No conversations yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Chats are created when a poster shortlists or accepts your application
                  </p>
                </div>
              ) : (
                chats.map((chat) => {
                  const other = getOtherUser(chat);
                  const isSelected = selectedChat?._id === chat._id;
                  return (
                    <button
                      key={chat._id}
                      onClick={() => selectChat(chat)}
                      className={`w-full text-left p-4 border-b border-zinc-800/50 transition ${
                        isSelected
                          ? "bg-purple-600/10 border-l-2 border-l-purple-500"
                          : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
                          {other?.name?.charAt(0) || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{other?.name || "Unknown"}</p>
                            {chat.lastMessage?.createdAt && (
                              <span className="text-[10px] text-zinc-600 shrink-0 ml-2">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {chat.internship?.title || "Internship"}
                          </p>
                          {chat.lastMessage?.content && (
                            <p className="text-xs text-zinc-600 truncate mt-0.5">
                              {chat.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="w-5 h-5 bg-purple-600 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ═══ CHAT WINDOW ═══ */}
          <div className="flex-1 flex flex-col">
            {!selectedChat ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageCircle size={48} className="mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500">Select a conversation</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Chat with internship posters or applicants
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
                    {getOtherUser(selectedChat)?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{getOtherUser(selectedChat)?.name}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Briefcase size={10} /> {selectedChat.internship?.title} — {selectedChat.internship?.company}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {groupedMessages.map((item, idx) => {
                    if (item.type === "date") {
                      return (
                        <div key={`date-${idx}`} className="flex items-center justify-center my-4">
                          <span className="bg-zinc-800 text-zinc-500 text-xs px-3 py-1 rounded-full">
                            {item.date}
                          </span>
                        </div>
                      );
                    }

                    const isMe = item.sender?._id === user?._id || item.sender === user?._id;
                    const isSystem = item.type === "system";

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-3">
                          <span className="bg-emerald-500/10 text-emerald-400 text-xs px-4 py-2 rounded-xl max-w-md text-center">
                            {item.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-purple-600 rounded-br-md"
                              : "bg-zinc-800 rounded-bl-md"
                          }`}
                        >
                          <p className="leading-relaxed">{item.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? "text-purple-300" : "text-zinc-600"} text-right flex items-center justify-end gap-1`}>
                            {formatTime(item.createdAt)}
                            {isMe && (
                              item.readBy?.length > 1
                                ? <CheckCheck size={12} className="text-blue-300" />
                                : <Check size={12} />
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-zinc-800">
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-xl text-sm outline-none focus:border-purple-500 transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl transition disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}
