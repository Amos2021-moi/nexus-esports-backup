"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Send,
  Mail,
  Bell,
  Users,
  Search,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

interface Player {
  id: string;
  name: string;
  email: string;
  emailNotificationsEnabled: boolean;
  isVerified: boolean;
  profile: {
    username: string;
    profilePicture: string | null;
  } | null;
}

interface CommunicationLog {
  id: string;
  subject: string;
  message: string;
  channel: string;
  recipientType: string;
  recipientCount: number;
  status: string;
  sentAt: string;
  deliveredAt: string | null;
  admin: {
    name: string;
    email: string;
  };
  stats?: {
    email: { sent: number; delivered: number; read: number; failed: number };
    inApp: { sent: number; delivered: number; read: number; failed: number };
  };
}

export default function CommunicationCenterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [channel, setChannel] = useState<"EMAIL" | "IN_APP" | "BOTH">("BOTH");
  const [recipientType, setRecipientType] = useState<"ALL" | "SPECIFIC">("ALL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<CommunicationLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterChannel, setFilterChannel] = useState<string>("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchPlayers();
    fetchHistory();
    fetchStats();
  }, []);

  async function fetchPlayers(search?: string) {
    try {
      const url = `/api/admin/communication/recipients${search ? `?search=${search}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  }

  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const url = `/api/admin/communication/history${filterStatus ? `?status=${filterStatus}` : ""}${filterChannel ? `${filterStatus ? "&" : "?"}channel=${filterChannel}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setHistory(data.logs || []);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/communication/stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }

    if (recipientType === "SPECIFIC" && selectedPlayers.length === 0) {
      toast.error("Please select at least one player");
      return;
    }

    const recipients = recipientType === "ALL" ? "all" : selectedPlayers;

    setSending(true);
    try {
      const res = await fetch("/api/admin/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          recipients,
          subject,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Message sent successfully!");
        setSubject("");
        setMessage("");
        setSelectedPlayers([]);
        fetchHistory();
        fetchStats();
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(logId: string) {
    if (!confirm("Are you sure you want to delete this message log?")) return;

    try {
      const res = await fetch(`/api/admin/communication/delete?id=${logId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Message deleted");
        fetchHistory();
        fetchStats();
      } else {
        toast.error("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    }
  }

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const toggleAllPlayers = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map((p) => p.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">Sent</span>;
      case "PARTIAL":
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Partial</span>;
      case "FAILED":
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">Failed</span>;
      case "PENDING":
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">Pending</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const filteredPlayers = players.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading Communication Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-indigo-400" />
            📨 Communication Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Send messages to players via Email and/or In-App notifications
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchHistory(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.totalSent}</p>
            <p className="text-xs text-gray-400">Total Messages</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-green-400">{stats.totalRecipients}</p>
            <p className="text-xs text-gray-400">Recipients Reached</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-blue-400">{stats.todaySent}</p>
            <p className="text-xs text-gray-400">Sent Today</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-purple-400">{stats.readRate}%</p>
            <p className="text-xs text-gray-400">Read Rate</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-yellow-400">{stats.readCount}</p>
            <p className="text-xs text-gray-400">Read Receipts</p>
          </div>
        </div>
      )}

      {/* Compose Message */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="h-5 w-5 text-indigo-400" />
          Compose Message
        </h2>

        {/* Channel Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Send via
          </label>
          <div className="flex gap-3">
            {(["EMAIL", "IN_APP", "BOTH"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setChannel(option)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  channel === option
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {option === "EMAIL" && <Mail className="h-4 w-4 inline mr-1" />}
                {option === "IN_APP" && <Bell className="h-4 w-4 inline mr-1" />}
                {option === "BOTH" && <div className="inline mr-1">📧🔔</div>}
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipients
          </label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setRecipientType("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                recipientType === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              All Players
            </button>
            <button
              onClick={() => setRecipientType("SPECIFIC")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                recipientType === "SPECIFIC"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Select Players
            </button>
          </div>

          {recipientType === "SPECIFIC" && (
            <div className="border border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search players..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={toggleAllPlayers}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-all"
                >
                  {selectedPlayers.length === players.length ? "Deselect All" : "Select All"}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedPlayers.length} selected
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredPlayers.map((player) => (
                  <label
                    key={player.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlayers.includes(player.id)
                        ? "bg-indigo-500/20"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayers.includes(player.id)}
                      onChange={() => togglePlayerSelection(player.id)}
                      className="h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-white">{player.profile?.username || player.name || player.email}</span>
                    <span className="text-xs text-gray-500 ml-auto">{player.email}</span>
                  </label>
                ))}
                {filteredPlayers.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No players found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter message subject..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your message here..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <p className="text-right text-xs text-gray-500 mt-1">
            {message.length} characters
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {sending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Send Message
            </>
          )}
        </button>
      </div>

      {/* History */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            Message History
          </h2>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="SENT">Sent</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Channels</option>
              <option value="EMAIL">Email</option>
              <option value="IN_APP">In-App</option>
              <option value="BOTH">Both</option>
            </select>
            <button
              onClick={fetchHistory}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p>No messages sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((log) => (
              <div key={log.id} className="bg-gray-700/30 rounded-lg border border-gray-700 overflow-hidden">
                <div
                  className="flex flex-wrap items-center justify-between gap-2 p-4 cursor-pointer hover:bg-gray-700/50 transition-all"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">{log.subject}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>To: {log.recipientType === "ALL" ? "All Players" : `${log.recipientCount} players`}</span>
                      <span>•</span>
                      <span>Channel: {log.channel}</span>
                      <span>•</span>
                      <span>Sent: {new Date(log.sentAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>By: {log.admin.name || log.admin.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(log.id);
                      }}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {expandedLog === log.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedLog === log.id && log.stats && (
                  <div className="p-4 border-t border-gray-700 bg-gray-800/30">
                    <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{log.message}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-green-400 font-bold">{log.stats.email.sent}</p>
                        <p className="text-gray-500">Email Sent</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-blue-400 font-bold">{log.stats.email.delivered}</p>
                        <p className="text-gray-500">Email Delivered</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-purple-400 font-bold">{log.stats.email.read}</p>
                        <p className="text-gray-500">Email Read</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-red-400 font-bold">{log.stats.email.failed}</p>
                        <p className="text-gray-500">Email Failed</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-2">
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-green-400 font-bold">{log.stats.inApp.sent}</p>
                        <p className="text-gray-500">In-App Sent</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-blue-400 font-bold">{log.stats.inApp.delivered}</p>
                        <p className="text-gray-500">In-App Delivered</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-purple-400 font-bold">{log.stats.inApp.read}</p>
                        <p className="text-gray-500">In-App Read</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-red-400 font-bold">{log.stats.inApp.failed}</p>
                        <p className="text-gray-500">In-App Failed</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}