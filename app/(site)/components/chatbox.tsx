"use client";


import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import OptimizedImage from "./OptimizedImage";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

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
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

interface UserToken {
  userId: string;
  name: string;
  avatar?: string;
}

const defaultUserAvatar = "/images/avatar-default.png";
const adminAvatar = "/images/avatar-default.png";

const [userInfo, setUserInfo] = useState<UserToken | null>(null);

const conversationIdRef = useRef<string>("guest-conversation");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded: UserToken = jwtDecode(token);
      const cid = `user-${decoded.userId}`;
      conversationIdRef.current = cid;
      setUserInfo(decoded);
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
      setUserInfo(guestInfo);
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;

    const socketInstance = getSocket();
    socketRef.current = socketInstance;
    if (!isConnectedRef.current) {
      socketInstance.emit("joinConversation", conversationIdRef.current);
      isConnectedRef.current = true;
    }

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === conversationIdRef.current) {
        setMessages((prev) => {
          const alreadyExists = prev.some(m => 
            m._id === msg._id || 
            (m.senderId === msg.senderId && 
             m.text === msg.text && 
             Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 1000)
          );
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
      }
    };

    socketInstance.on("newMessage", handleNewMessage);

    return () => {
      socketInstance.off("newMessage", handleNewMessage);
    };
  }, [userInfo]);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get<Message[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${conversationIdRef.current}`,
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
      fetchMessages();
    }
  }, [isOpen, userInfo]);

  const handleSend = () => {
    if (!input.trim() || !userInfo || !socketRef.current) return;
  
    const newMessage: Message = {
      conversationId: conversationIdRef.current,
      senderId: userInfo.userId,
      senderName: userInfo.name,
      senderAvatar: userInfo.avatar || defaultUserAvatar,
      text: input,
      messageType: "text",
      createdAt: new Date().toISOString(),
    };
  
    setMessages(prev => [...prev, newMessage]);
    
    socketRef.current.emit("sendMessage", newMessage);
    setInput("");
  }; 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-19 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gradient-to-r from-black via-red-500 to-black text-white rounded-t-2xl p-4 flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg 
  xmlns="http://www.w3.org/2000/svg" 
  className="text-white w-6 h-6 drop-shadow-sm" 
  viewBox="0 0 24 24" 
  fill="currentColor"
>
  <path d="M12 2C6.477 2 2 6.21 2 11.4c0 2.924 1.347 5.555 3.53 7.297V22l3.236-1.78c1.04.287 2.146.44 3.234.44 5.523 0 10-4.21 10-9.4S17.523 2 12 2zm.09 12.57l-2.56-2.72-4.99 2.72 5.47-5.81 2.53 2.73 4.99-2.73-5.44 5.81z" />
</svg>
              </div>
              <div>
                <span className="font-bold text-sm">Hỗ trợ trực tuyến</span>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs opacity-90">Đang hoạt động</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg 
  xmlns="http://www.w3.org/2000/svg" 
  className="text-white w-6 h-6 drop-shadow-sm" 
  viewBox="0 0 24 24" 
  fill="currentColor"
>
  <path d="M12 2C6.477 2 2 6.21 2 11.4c0 2.924 1.347 5.555 3.53 7.297V22l3.236-1.78c1.04.287 2.146.44 3.234.44 5.523 0 10-4.21 10-9.4S17.523 2 12 2zm.09 12.57l-2.56-2.72-4.99 2.72 5.47-5.81 2.53 2.73 4.99-2.73-5.44 5.81z" />
</svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">Chào bạn!</p>
                <p className="text-gray-400 text-xs mt-1">Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            )}
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === (userInfo?.userId || "guest");

              return (
                <div key={msg._id || index} className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} gap-2`}>
                  
                  {!isCurrentUser && (
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm"
                      style={{ 
                        minWidth: '32px',
                        minHeight: '32px',
                        maxWidth: '32px',
                        maxHeight: '32px'
                      }}
                    >
                      <OptimizedImage 
                        src={adminAvatar} 
                        alt="Admin" 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      isCurrentUser 
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white ml-auto" 
                        : "bg-white text-gray-800 border border-gray-100"
                    }`}
                  >
                    {msg.text && <div className="leading-relaxed">{msg.text}</div>}
                    {msg.image && (
                      <div className="mt-2">
                        <OptimizedImage
                          src={msg.image}
                          alt="Hình ảnh"
                          width={200}
                          height={150}
                          className="rounded-lg max-w-full h-auto cursor-pointer shadow-sm"
                          style={{ maxWidth: '200px', height: 'auto' }}
                        />
                      </div>
                    )}
                    {msg.file && (
                      <div className="mt-2">
                        <a 
                          href={msg.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            isCurrentUser 
                              ? 'bg-white/20 text-white hover:bg-white/30' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>📎</span>
                          <span>Tải file</span>
                        </a>
                      </div>
                    )}
                    <div className={`text-[10px] mt-2 text-right ${
                      isCurrentUser ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div 
                      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm"
                      style={{ 
                        minWidth: '32px',
                        minHeight: '32px',
                        maxWidth: '32px',
                        maxHeight: '32px'
                      }}
                    >
                      <OptimizedImage 
                        src={msg.senderAvatar || defaultUserAvatar} 
                        alt="User" 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-200 placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-red-500 to-red-600 p-2.5 rounded-full text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-30 scale-150"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-20 scale-125 delay-75"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-15 scale-110 delay-150"></div>
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-r from-red-500 via-red-600 to-pink-500 p-4 rounded-full shadow-2xl hover:shadow-red-500/25 hover:scale-110 transition-all duration-300 transform group-hover:rotate-12"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #ec4899 100%)',
              boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="relative">
              <svg 
  xmlns="http://www.w3.org/2000/svg" 
  className="text-white w-6 h-6 drop-shadow-sm" 
  viewBox="0 0 24 24" 
  fill="currentColor"
>
  <path d="M12 2C6.477 2 2 6.21 2 11.4c0 2.924 1.347 5.555 3.53 7.297V22l3.236-1.78c1.04.287 2.146.44 3.234.44 5.523 0 10-4.21 10-9.4S17.523 2 12 2zm.09 12.57l-2.56-2.72-4.99 2.72 5.47-5.81 2.53 2.73 4.99-2.73-5.44 5.81z" />
</svg>
            </div>
          </button>
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Chat với chúng tôi
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
