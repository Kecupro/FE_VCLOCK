"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from "../../config/api";


const socket = io(API_ENDPOINTS.SOCKET_URL); // đổi sang đúng địa chỉ server

interface Message {
	_id?: string;
	conversationId: string;
	senderId: string;
	senderName: string;
	senderAvatar?: string;
	text?: string;
	image?: string;
	file?: string;
	messageType: 'text' | 'image' | 'file';
	seenBy?: string[];
	createdAt: string;
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

interface UserToken {
  userId: string;
  name: string;
  avatar?: string;
}

const defaultUserAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const adminAvatar = "https://secure.gravatar.com/avatar/2ad86d4128742b555b487c8a62a33e9e?s=96&d=mm&r=g";

const [userInfo, setUserInfo] = useState<UserToken | null>(null);

const conversationIdRef = useRef<string>("guest-conversation");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded: UserToken = jwtDecode(token);
      const cid = `user-${decoded.userId}`;
      conversationIdRef.current = cid;
      socket.emit("joinConversation", cid);
      setUserInfo(decoded); // Đặt sau cùng
    } else {
      let guestName = localStorage.getItem("guestName");
      if (!guestName) {
        guestName = "Khách_" + Math.floor(Math.random() * 10000);
        localStorage.setItem("guestName", guestName);
      }
      const guestInfo = {
        userId: "guest",
        name: guestName,
        avatar: defaultUserAvatar,
      };
      conversationIdRef.current = "guest-conversation";
      socket.emit("joinConversation", "guest-conversation");
      setUserInfo(guestInfo); // Cũng đặt sau cùng
    }
  }, []);

    // Lắng nghe tin nhắn mới
    useEffect(() => {
  const handleNewMessage = (msg: Message) => {
    if (msg.conversationId === conversationIdRef.current) {
      setMessages((prev) => {
        const alreadyExists = prev.some(m => m._id === msg._id);
        if (alreadyExists) return prev;
        return [...prev, msg];
      });
    }
  };

  socket.on("newMessage", handleNewMessage);

  return () => {
    socket.off("newMessage", handleNewMessage);
  };
}, []); // <-- Để dependency array là [] để không bị cảnh báo


  // Lấy tin nhắn khi mở chat
  const fetchMessages = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get<Message[]>(
      API_ENDPOINTS.MESSAGES(conversationIdRef.current),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setMessages(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy tin nhắn:", err);
    }
  };

  useEffect(() => {
  if (isOpen && userInfo) {
    console.log("📡 conversationIdRef:", conversationIdRef.current);
    fetchMessages();
  }
}, [isOpen, userInfo]);



  const handleSend = () => {
    if (!input.trim() || !userInfo) return;
  
    const newMessage: Message = {
      conversationId: conversationIdRef.current,    //  Dùng ref luôn đúng
      senderId: userInfo.userId,
      senderName: userInfo.name,
      senderAvatar: userInfo.avatar || defaultUserAvatar,
      text: input,
      messageType: "text",
      createdAt: new Date().toISOString(),
    };
  
    setMessages(prev => [...prev, newMessage]);
    socket.emit("sendMessage", newMessage);
    setInput("");
  }; 

  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-2xl p-3 flex justify-between items-center shadow">
            <span className="font-semibold text-sm">Hỗ trợ trực tuyến</span>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-8">Chúng tôi có thể giúp gì cho bạn?</p>
            )}
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === (userInfo?.userId || "guest");

              return (
                <div key={msg._id || index} className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} gap-2`}>
                  
                  {!isCurrentUser && (
                    <div 
                      className="w-6 h-6 rounded-full overflow-hidden"
                      style={{ 
                        minWidth: '24px',
                        minHeight: '24px',
                        maxWidth: '24px',
                        maxHeight: '24px'
                      }}
                    >
                      <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                      isCurrentUser ? "bg-red-500 text-white ml-auto" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className="text-[11px] text-black-300 mt-1 text-left">
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div 
                      className="w-6 h-6 rounded-full overflow-hidden"
                      style={{ 
                        minWidth: '24px',
                        minHeight: '24px',
                        maxWidth: '24px',
                        maxHeight: '24px'
                      }}
                    >
                      <img src={msg.senderAvatar || defaultUserAvatar} alt="User" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}


            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleSend}
              className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="text-white w-5 h-5" />
        </button>
      )}
    </div>
  );
}
