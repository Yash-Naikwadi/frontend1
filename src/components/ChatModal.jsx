import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Circle,
  Check,
  CheckCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ChatModal = ({
  doctor,
  isOpen,
  onClose,
  messages = [],
  onSendMessage,
  onTyping,
  onMarkAsRead,
  isConnected,
  currentUser,
  typingUsers = [],
  error = null,
  onClearError
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  /* ---------------- Scroll to bottom ---------------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  /* ---------------- Mark messages read ---------------- */
  useEffect(() => {
    if (!isOpen || !onMarkAsRead) return;

    const unread = messages.some(
      m => !m.isRead && m.senderId !== currentUser?._id
    );

    if (unread) {
      const timer = setTimeout(onMarkAsRead, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, onMarkAsRead, currentUser]);

  /* ---------------- Textarea resize ---------------- */
  const adjustTextareaHeight = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 120) + 'px';
  };

  /* ---------------- Typing handler ---------------- */
  const handleTyping = (value) => {
    setNewMessage(value);
    adjustTextareaHeight();

    if (!isUserTyping && value.trim()) {
      setIsUserTyping(true);
      onTyping?.(doctor._id, true);
    }

    clearTimeout(typingTimeoutRef.current);

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false);
        onTyping?.(doctor._id, false);
      }, 1000);
    } else {
      setIsUserTyping(false);
      onTyping?.(doctor._id, false);
    }
  };

  /* ---------------- Send message ---------------- */
  const sendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsUserTyping(false);
    onTyping?.(doctor._id, false);
    clearTimeout(typingTimeoutRef.current);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      await onSendMessage(doctor._id, text);
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---------------- Helpers ---------------- */
  const isOwnMessage = (msg) =>
    msg.senderId?.toString() === currentUser?._id?.toString();

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (t) => {
    const d = new Date(t);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const getMessageStatusIcon = (msg) => {
    if (!isOwnMessage(msg)) return null;
    if (msg.status === 'sending') return <Loader2 size={14} className="spin" />;
    if (msg.isRead) return <CheckCheck size={14} />;
    return <Check size={14} />;
  };

  const typingIndicator = typingUsers.find(u => u.userId === doctor._id);

  /* ---------------- Group messages by date ---------------- */
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt || msg.timestamp);
    acc[date] = acc[date] || [];
    acc[date].push(msg);
    return acc;
  }, {});

  if (!isOpen) return null;

  if (!currentUser?._id) {
    return (
      <div className="chat-modal error">
        <AlertCircle />
        <p>User authentication missing. Please refresh.</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  /* ===================== JSX ===================== */
  return (
    <div className="chat-modal">
      {/* ---------- Header ---------- */}
      <div className="chat-header">
        <div className="doctor-info">
          <span className="avatar">{doctor.image || '👨‍⚕️'}</span>
          <div>
            <h3>{doctor.name}</h3>
            <p>{typingIndicator ? 'Typing…' : isConnected ? 'Online' : 'Offline'}</p>
          </div>
        </div>

        <div className="actions">
          <Phone size={18} />
          <Video size={18} />
          <MoreVertical size={18} />
          <X size={18} onClick={onClose} />
        </div>
      </div>

      {/* ---------- Error ---------- */}
      {error && (
        <div className="chat-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          {onClearError && <X size={14} onClick={onClearError} />}
        </div>
      )}

      {/* ---------- Messages ---------- */}
      <div className="chat-body">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="empty-chat">
            <MessageCircle size={40} />
            <p>Start chatting with {doctor.name}</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">{date}</div>
              {msgs.map((msg, i) => {
                const own = isOwnMessage(msg);
                return (
                  <div
                    key={msg._id || i}
                    className={`message ${own ? 'own' : 'other'}`}
                  >
                    <div className="bubble">
                      <p>{msg.message}</p>
                      <div className="meta">
                        <span>{formatTime(msg.createdAt || msg.timestamp)}</span>
                        {own && getMessageStatusIcon(msg)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ---------- Input ---------- */}
      <div className="chat-input">
        {!isConnected && (
          <div className="connection-warning">
            <Circle size={8} />
            Reconnecting…
          </div>
        )}

        <Paperclip size={18} />
        <Smile size={18} />

        <textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? 'Type a message…' : 'Disconnected'}
          rows={1}
          disabled={!isConnected}
        />

        <button onClick={sendMessage} disabled={!isConnected}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatModal;
