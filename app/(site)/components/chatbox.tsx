"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, ShoppingBag, Zap } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import OptimizedImage from "./OptimizedImage";

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "https://bevclock-production.up.railway.app", {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 0,
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
	messageType: 'text' | 'image' | 'file' | 'products';
  products?: {
    brand: {
      _id: string;
      name: string;
    };
    main_image: { image: string; alt: string };
    id: string;
    name: string;
    price: number;
    sale_price: number;
  }[];
  seenBy?: string[];
  createdAt: string;
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);

interface UserToken {
  userId: string;
  username: string;
  avatar?: string;
}

const defaultUserAvatar = "/images/avatar-default.png";
const adminAvatar = "https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg";

const [userInfo, setUserInfo] = useState<UserToken | null>(null);

const conversationIdRef = useRef<string>("guest-conversation");

  // Đảm bảo component chỉ render trên client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded: UserToken = jwtDecode(token);
        const cid = `user-${decoded.userId}`;
        conversationIdRef.current = cid;
        setUserInfo(decoded);
      } catch (error) {
        console.error("Lỗi decode token:", error);
        // Fallback to guest
        let guestName = localStorage.getItem("guestName");
        if (!guestName) {
          guestName = "Khách_" + Date.now().toString().slice(-4);
          localStorage.setItem("guestName", guestName);
        }
        const guestInfo = {
          userId: "guest",
          username: guestName,
          avatar: defaultUserAvatar,
        };
        conversationIdRef.current = "guest-conversation";
        setUserInfo(guestInfo);
      }
    } else {
      let guestName = localStorage.getItem("guestName");
      if (!guestName) {
        guestName = "Khách_" + Date.now().toString().slice(-4);
        localStorage.setItem("guestName", guestName);
      }
      const guestInfo = {
        userId: "guest",
        username: guestName,
        avatar: defaultUserAvatar,
      };
      conversationIdRef.current = "guest-conversation";
      setUserInfo(guestInfo);
    }
  }, [mounted]);

  useEffect(() => {
    if (!userInfo || !mounted) return;

    const socketInstance = getSocket();
    socketRef.current = socketInstance;

    // Join lại phòng mỗi khi conversationId thay đổi
    socketInstance.emit("joinConversation", conversationIdRef.current);

    const handleNewMessage = (msg: Message) => {
      console.log("Nhận được tin nhắn:", msg);
      if (msg.conversationId === conversationIdRef.current) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socketInstance.on("receiveMessage", handleNewMessage);

    return () => {
socketInstance.off("receiveMessage", handleNewMessage);
    };
  }, [userInfo, conversationIdRef.current, mounted]);

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
    if (isOpen && userInfo && mounted) {
      fetchMessages();
    }
  }, [isOpen, userInfo, mounted]);

  const handleSend = () => {
    if (!input.trim() || !userInfo || !socketRef.current) return;
  
    const newMessage: Message = {
      conversationId: conversationIdRef.current,
      senderId: userInfo.userId,
      senderName: userInfo.username,
      senderAvatar: userInfo.avatar || defaultUserAvatar,
      text: input,
      messageType: "text",
      createdAt: new Date().toISOString(),
    };
    console.log("conversationId:", newMessage.conversationId);
    
    socketRef.current.emit("sendMessage", newMessage);
    setInput("");
  }; 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Không render gì cho đến khi component được mount trên client
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className="w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col border-0 animate-in slide-in-from-bottom-2 duration-300 overflow-hidden">
          {/* Header với gradient đỏ */}
          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
              <div className="absolute top-8 right-8 w-24 h-24 bg-white rounded-full opacity-50 animate-bounce"></div>
              <div className="absolute bottom-4 left-8 w-16 h-16 bg-white rounded-full opacity-30 animate-ping"></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 animate-pulse">
                  <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-lg">Chat bot </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm opacity-90 font-medium">Online</span>
                  </div>
                </div>
              </div>
              
            <button 
              onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-white/30 hover:scale-110 hover:rotate-90"
>
                <X className="w-5 h-5" />
            </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-red-50 to-white space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
                  <div className="relative">
                    <Bot className="w-10 h-10 text-red-600" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h4 className="text-gray-700 text-lg font-semibold mb-2 animate-fade-in">Chat bot VClock Store</h4>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto animate-fade-in-delay">
                  Chào mừng bạn đến với VClock Store! Bạn có thể hỏi tôi về sản phẩm hoặc dịch vụ của chúng tôi!
                </p>
              </div>
            )}
            
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === (userInfo?.userId || "guest");

              if (msg.messageType === "products" && msg.products) {
                console.log("imgs:", msg.products.map(p => p.main_image?.image));
                
                return (
                  <div key={msg._id || index} className="space-y-4 animate-slide-in">
                    {msg.text && (
                      <div className="text-sm font-medium text-gray-700 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                        {msg.text}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3 w-full">
                      {msg.products.map((p) => (
                        <div key={p.id} className="p-3 rounded-xl shadow-md bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group animate-fade-in-up">
                          <div className="flex space-x-3">
                            <div className="flex-shrink-0">
                          <OptimizedImage
                            src={
                              p.main_image?.image
                                ? p.main_image.image.startsWith("https://")
                                      ? p.main_image.image
                                      : `/images/product/${p.main_image.image}`
                                : "/images/no-image.png"
                            }
                            alt={p.main_image?.alt || p.name || "Product image"}
                                width={80}
                                height={80}
                                className="rounded-lg w-20 h-20 object-cover shadow-sm group-hover:shadow-md transition-shadow duration-300 group-hover:scale-105"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1 mb-1">
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                  {p.brand?.name || "Brand"}
                                </span>
                              </div>
                              
                              <h4 className="font-medium text-gray-800 text-xs leading-tight mb-1 line-clamp-2">
                                {p.name}
                              </h4>
                              
                              <div className="flex items-center space-x-1 mb-2">
                                {p.sale_price && p.sale_price < p.price ? (
                                  <>
                                    <span className="text-red-500 font-bold text-sm">
                                      {p.sale_price.toLocaleString()}₫
                                    </span>
                                    <span className="text-gray-400 text-xs line-through">
                                      {p.price.toLocaleString()}₫
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-red-500 font-bold text-sm">
                                    {p.price.toLocaleString()}₫
                                  </span>
                                )}
                              </div>
                              
                              <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg py-1.5 text-xs font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center space-x-1 group-hover:shadow-lg">
                                <ShoppingBag className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                                <span>Xem chi tiết</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg._id || index} className={`flex items-end ${isCurrentUser ? "justify-end" : "justify-start"} gap-3 animate-slide-in`}>
                  
                  {!isCurrentUser && (
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg animate-pulse"
                    >
                      <OptimizedImage 
                        src={adminAvatar} 
                        alt="Admin" 
                          width={40}
                          height={40}
                        className="w-full h-full object-cover" 
                      />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm shadow-lg transform transition-all duration-300 hover:scale-105 ${
                      isCurrentUser 
                        ? "bg-gradient-to-br from-red-500 to-red-600 text-white" 
                        : "bg-white text-gray-800 border border-gray-100 hover:shadow-xl"
                    }`}
                  >
                    {msg.text && <div className="leading-relaxed">{msg.text}</div>}
                    
                    {msg.image && (
                      <div className="mt-3">
                        <OptimizedImage
                          src={msg.image}
                          alt="Hình ảnh"
                          width={250}
                          height={180}
                          className="rounded-xl max-w-full h-auto cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200 hover:scale-105"
                          style={{ maxWidth: '250px', height: 'auto' }}
                        />
                      </div>
                    )}
                    
                    {msg.file && (
                      <div className="mt-3">
                        <a 
                          href={msg.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            isCurrentUser 
                              ? 'bg-white/20 text-white hover:bg-white/30' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>📎</span>
                          <span>Download File</span>
                        </a>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-3 text-right ${
                      isCurrentUser ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {isCurrentUser && (
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-white shadow-lg animate-pulse"
                    >
                      <OptimizedImage 
                        src={msg.senderAvatar || defaultUserAvatar} 
                        alt="User" 
                          width={40}
                          height={40}
                        className="w-full h-full object-cover" 
                      />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-2 border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 placeholder-gray-400 font-medium hover:border-gray-300"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-2xl text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 hover:rotate-3"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          {/* Animated background rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-ping opacity-30 scale-150"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-ping opacity-20 scale-125 delay-75"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-ping opacity-15 scale-110 delay-150"></div>
          
          {/* Floating elements */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          
          {/* Main button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-5 rounded-full shadow-2xl hover:shadow-red-500/25 hover:scale-110 transition-all duration-300 transform group-hover:rotate-12 hover:rotate-0"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
              boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="relative">
              <Bot className="w-7 h-7 text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap transform translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span>Chat với chúng tôi</span>
            </div>
            <div className="absolute top-full right-5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
