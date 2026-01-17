import { useChatPrompt } from "@/routes/hooks/chat";
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Input, Spin } from "antd";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatComponent() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?" },
  ]);
  const [input, setInput] = useState("");

  const { sendPrompt, isLoading } = useChatPrompt();

  const handleSend = async () => {
    if (!input.trim()) return;
    setInput("");
    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const response = await sendPrompt({ prompt: input });
    setMessages((prev) => [...prev, { from: "ai", text: response.answer ?? "..." }]);
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Nút mở chat */}
      <Button
        onClick={() => setShowChat(!showChat)}
        shape="circle"
        icon={showChat ? <CloseOutlined /> : <MessageOutlined />}
        style={{
          width: 60,
          height: 60,
          fontSize: 24,
          background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
          color: "#fff",
          boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
          border: "none",
          transition: "all 0.3s",
        }}
      />

      {/* Khung chat */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 0,
          width: 340,
          height: 440,
          background: "var(--color-bg-container, #fff)",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          overflow: "hidden",
          transform: showChat ? "translateY(0)" : "translateY(20px)",
          opacity: showChat ? 1 : 0,
          pointerEvents: showChat ? "auto" : "none",
          transition: "all 0.35s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
            color: "white",
            padding: "14px 16px",
            fontWeight: 600,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Trí tuệ nhân tạo hỗ trợ khách hàng
        </div>

        {/* Vùng chat */}
        <div
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "#f9fafb",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              {msg.from === "ai" && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: "#4f46e5",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <RobotOutlined />
                </div>
              )}
              <div
                style={{
                  maxWidth: "70%",
                  padding: "8px 12px",
                  borderRadius:
                    msg.from === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.from === "user"
                      ? "linear-gradient(135deg, #3b82f6, #60a5fa)"
                      : "#e5e7eb",
                  color: msg.from === "user" ? "white" : "#111827",
                  wordWrap: "break-word",
                }}
              >
                {msg.from === "ai" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
              {msg.from === "user" && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    background: "#3b82f6",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 8,
                  }}
                >
                  <UserOutlined />
                </div>
              )}
            </div>
          ))}

          {/* Hiệu ứng đang trả lời */}
          {isLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RobotOutlined style={{ color: "#4f46e5" }} />
              <Spin size="small" />
              <span>AI đang phản hồi...</span>
            </div>
          )}
        </div>

        {/* Ô nhập tin nhắn */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "10px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Input
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            style={{
              borderRadius: 20,
              background: "#f3f4f6",
              border: "none",
            }}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            loading={isLoading}
            onClick={handleSend}
            style={{
              background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}