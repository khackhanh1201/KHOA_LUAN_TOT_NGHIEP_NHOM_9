import React, { useEffect, useRef, useReducer } from "react";
import { useAuth } from "../../hooks/useAuth";
import { FOCUS_VISIBLE_CLASS } from "../theme/designTokens";

const API_BASE = "http://localhost:8080";
const ALLOWED = new Set(["ROLE_CITIZEN", "ROLE_TAX_OFFICER", "ROLE_LAND_OFFICER"]);

/** Bảng màu đồng bộ VNeID / MainLayout */
const THEME = {
  primary: "#a30d11",
  primaryHover: "#8a0b0f",
  primaryLight: "#bb1a20",
  accent: "#ffc107",
  bg: "#f4f1e9",
  surface: "#ffffff",
  aiBubble: "#fff5f5",
  border: "#e2e8f0",
  text: "#1e293b",
  muted: "#64748b",
  shadow: "0 12px 32px rgba(163, 13, 17, 0.18)",
  shadowFab: "0 10px 24px rgba(163, 13, 17, 0.35)",
};

const fabButtonStyle = {
  width: 58,
  height: 58,
  borderRadius: "50%",
  border: `2px solid ${THEME.accent}`,
  background: `linear-gradient(145deg, ${THEME.primaryLight} 0%, ${THEME.primary} 100%)`,
  color: "#fff",
  boxShadow: THEME.shadowFab,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 26,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const panelStyle = {
  width: 380,
  maxWidth: "calc(100vw - 32px)",
  height: 500,
  maxHeight: "calc(100vh - 40px)",
  background: THEME.surface,
  borderRadius: 16,
  border: `1px solid ${THEME.border}`,
  boxShadow: THEME.shadow,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const headerIconStyle = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  border: "1px solid rgba(255,255,255,0.35)",
};

const closeButtonStyle = {
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
};

const aiAvatarStyle = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: THEME.primary,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  flexShrink: 0,
};

const messageBubbleStyle = (msg) => ({
  maxWidth: "78%",
  padding: "10px 14px",
  borderRadius: msg.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
  background: msg.from === "me" ? THEME.primary : THEME.aiBubble,
  color: msg.from === "me" ? "#fff" : THEME.text,
  border: msg.from === "me" ? "none" : `1px solid ${THEME.border}`,
  whiteSpace: "pre-wrap",
  fontSize: 14,
  lineHeight: 1.5,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
});

const sendButtonStyle = (busy, input) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  border: "none",
  background: busy || !input.trim() ? "#cbd5e1" : THEME.primary,
  color: "#fff",
  cursor: busy || !input.trim() ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
});

const AI_CHAT_SESSION_KEY = "ai_chat_session_id";

const INITIAL_MESSAGES = [
  {
    id: "welcome",
    from: "ai",
    text: "Xin chào! Tôi là trợ lý AI — hỗ trợ tra cứu quy định thuế đất và hướng dẫn thủ tục.",
  },
];

function nextMessageId() {
  return crypto?.randomUUID?.() ?? `msg-${Date.now()}`;
}

function createNewSessionId() {
  const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
  localStorage.setItem(AI_CHAT_SESSION_KEY, id);
  return id;
}
function safeParseResponse(text) {
  try {
    const obj = JSON.parse(text);
    return obj.answer || obj.response || obj.message || text;
  } catch {
    return text;
  }
}

const INITIAL_CHAT_STATE = {
  open: false,
  input: "",
  busy: false,
  messages: INITIAL_MESSAGES,
  sessionId: (() => {
    const saved = localStorage.getItem(AI_CHAT_SESSION_KEY);
    return saved || createNewSessionId();
  })(),
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [
          ...state.messages,
          { ...action.message, id: action.message.id || nextMessageId() },
        ],
      };
    case "RESET_CHAT":
      return {
        ...state,
        sessionId: createNewSessionId(),
        messages: INITIAL_MESSAGES,
        input: "",
        busy: false,
        open: false,
      };
    case "RESET_ON_LOGOUT":
      return {
        ...INITIAL_CHAT_STATE,
        sessionId: createNewSessionId(),
        messages: INITIAL_MESSAGES,
        open: false,
      };
    default:
      return state;
  }
};

export default function AiChatWidget() {
  const { isAuthenticated, role, token, user } = useAuth();
  const canUse = isAuthenticated && ALLOWED.has(role);

  const [chat, dispatchChat] = useReducer(chatReducer, INITIAL_CHAT_STATE);
  const { open, input, busy, messages, sessionId } = chat;

  const listRef = useRef(null);
  const authKeyRef = useRef(null);

  const userKey =
    user?.userId ?? user?.id ?? user?.cccdNumber ?? user?.citizenId ?? "";

  const resetChat = () => {
    localStorage.removeItem(AI_CHAT_SESSION_KEY);
    dispatchChat({ type: "RESET_CHAT" });
  };

  useEffect(() => {
  if (!isAuthenticated) {
    authKeyRef.current = null;
    localStorage.removeItem(AI_CHAT_SESSION_KEY);
    dispatchChat({ type: "RESET_ON_LOGOUT" });
    return;
  }

  const nextKey = `${token || ""}|${role || ""}|${userKey}`;
  if (authKeyRef.current !== null && authKeyRef.current !== nextKey) {
    resetChat();
  }
  authKeyRef.current = nextKey;
}, [isAuthenticated, token, role, userKey]);

  if (!canUse) return null;

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;

    dispatchChat({ type: "ADD_MESSAGE", message: { from: "me", text: q } });
    dispatchChat({ type: "PATCH", payload: { input: "", busy: true } });

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q, session_id: sessionId }),
      });

      const text = await res.text();
      const answer = safeParseResponse(text);

      if (!res.ok) {
        dispatchChat({ type: "ADD_MESSAGE", message: { from: "ai", text: `Lỗi (${res.status}): ${answer}` } });
      } else {
        dispatchChat({ type: "ADD_MESSAGE", message: { from: "ai", text: answer } });
      }
    } catch (e) {
      dispatchChat({ type: "ADD_MESSAGE", message: { from: "ai", text: `Không gọi được backend: ${e.message}` } });
    } finally {
      dispatchChat({ type: "PATCH", payload: { busy: false } });
      requestAnimationFrame(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }
  };

  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 9999 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => dispatchChat({ type: "PATCH", payload: { open: true } })}
          aria-label="Mở trợ lý AI"
          style={fabButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <i className="bi bi-chat-dots-fill" aria-hidden="true" />
        </button>
      ) : (
        <div
          style={panelStyle}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryLight} 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `2px solid ${THEME.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={headerIconStyle}
              >
                <i className="bi bi-stars" aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Trợ lý AI</div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                  Cổng dịch vụ công · Thuế &amp; đất đai
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatchChat({ type: "PATCH", payload: { open: false } })}
              aria-label="Đóng"
              style={closeButtonStyle}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            style={{
              padding: 14,
              flex: 1,
              overflowY: "auto",
              background: THEME.bg,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
                  marginBottom: 10,
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                {msg.from === "ai" && (
                  <div
                    style={aiAvatarStyle}
                  >
                    <i className="bi bi-robot" aria-hidden="true" />
                  </div>
                )}
                <div
                  style={messageBubbleStyle(msg)}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ fontSize: 12, color: THEME.muted, paddingLeft: 36 }}>
                <i className="bi bi-three-dots" /> Đang soạn câu trả lời…
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: `1px solid ${THEME.border}`,
              display: "flex",
              gap: 8,
              background: THEME.surface,
            }}
          >
            <input
              value={input}
              onChange={(e) => dispatchChat({ type: "PATCH", payload: { input: e.target.value } })}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={busy ? "Đang trả lời..." : "Nhập câu hỏi..."}
              aria-label="Nhập câu hỏi"
              disabled={busy}
              className={FOCUS_VISIBLE_CLASS}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${THEME.border}`,
                fontSize: 14,
                background: "#fafafa",
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !input.trim()}
              aria-label="Gửi"
              style={sendButtonStyle(busy, input)}
            >
              <i className="bi bi-send-fill" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}