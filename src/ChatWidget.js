// src/ChatWidget.js
import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { getSocket } from "./socket";
import { apiFetch } from "./api";

export default function ChatWidget({ isOpen, onClose, currentUser, receiver }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const scrollRef = useRef(null);

  // Init + history
  useEffect(() => {
    if (!isOpen || !currentUser || !receiver) return;

    setMessages([]);
    setConnecting(true);

    const socket = getSocket();
    if (!socket) {
      // Not logged in / no token — nothing to wire up.
      setConnecting(false);
      return;
    }

    const handleReceive = (msg) => {
      const myId = currentUser.id || currentUser._id;
      const otherId = receiver.id || receiver._id;

      if (
        (String(msg.senderId) === String(myId) &&
          String(msg.receiverId) === String(otherId)) ||
        (String(msg.senderId) === String(otherId) &&
          String(msg.receiverId) === String(myId))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("connect", () => setConnecting(false));
    socket.on("receiveMessage", handleReceive);

    // Load history
    (async () => {
      try {
        const otherId = receiver.id || receiver._id;
        const history = await apiFetch(`/api/messages/history/${otherId}`);
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    })();

    return () => {
      socket.off("receiveMessage", handleReceive);
      // We don't fully disconnect here so we can reuse connection globally.
      // If you want to disconnect when no chat is open at all, manage it higher up.
    };
  }, [isOpen, currentUser, receiver]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !currentUser || !receiver) return;

    const socket = getSocket();
    if (!socket || !socket.connected) return;

    const otherId = receiver.id || receiver._id;
    socket.emit("sendMessage", { to: otherId, content: text });
    setInputText("");
  };

  if (!isOpen || !receiver) return null;

  const meId = currentUser?.id || currentUser?._id;
  const receiverName = receiver.name || "Owner";

  return (
    <div className="fixed bottom-4 right-4 z-[10000] w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-gold-500 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {receiverName[0] || "U"}
          </div>
          <div>
            <p className="text-sm font-bold">{receiverName}</p>
            <p className="text-[10px] text-blue-100">
              {connecting ? "Connecting..." : "Online"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="h-11 w-11 flex items-center justify-center hover:bg-white/20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 h-80 overflow-y-auto p-4 bg-slate-50 space-y-3">
        {messages.map((msg, idx) => {
          const isMe = String(msg.senderId) === String(meId);
          return (
            <div
              key={msg._id || idx}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  isMe
                    ? "bg-gold-500 text-white rounded-br-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-[9px] mt-1 text-right ${
                    isMe ? "text-blue-200" : "text-slate-400"
                  }`}
                >
                  {msg.createdAt &&
                    new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-100 flex gap-2"
      >
        <input
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40 focus-visible:border-gold-400"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={connecting}
        />
        <button
          type="submit"
          disabled={connecting || !inputText.trim()}
          aria-label="Send message"
          className="bg-gold-500 text-white h-11 w-11 flex items-center justify-center rounded-full hover:bg-gold-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
