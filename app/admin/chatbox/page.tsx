"use client";



import { useEffect, useState } from "react";
import { FiSearch, FiVideo, FiTrash2, FiUser, FiCamera, FiSend } from "react-icons/fi";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useRef } from 'react';
import styles from '../assets/css/AdminChat.module.css';
import { useAppContext } from "../../context/AppContext"
import Image from "next/image";
import { getAvatarImageUrl } from "@/app/utils/imageUtils";

const socket = io("${process.env.NEXT_PUBLIC_API_URL}");

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

interface Conversation {
  _id?: string;
  conversationId: string;
  participants: {
    userId: string;
    userName: string;
    userAvatar?: string;
    role: 'user' | 'admin' | 'bot';
    unreadCount: number;
  }[];

  lastMessage: string;
  lastMessageType: 'text' | 'image' | 'file';
  lastMessageSenderId: string;
  lastTime: string;
  unreadCount?: number;
}

export default function AdminChat() {
  const { isDarkMode } = useAppContext();

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add(styles['dark-mode']);
    } else {
      html.classList.remove(styles['dark-mode']);
    }
  }, [isDarkMode]);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const user_img_default = "/images/avatar-default.png";
  const currentAdminId = "admin-id";
  const adminAvatar = "/images/avatar-default.png";

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations`)
      .then(res => res.json())
      .then(async (data) => {
        // Kiểm tra và sửa dữ liệu conversations nếu cần
        const processedData = data.map((conv: Conversation) => {
          if (!conv.participants || conv.participants.length === 0) {
            // Nếu không có participants, tạo từ conversationId
            const userId = conv.conversationId.replace('user-', '');
            return {
              ...conv,
              participants: [{
                userId: userId,
                userName: `User_${userId.slice(-6)}`,
                userAvatar: "",
                role: 'user',
                unreadCount: 0,
              }]
            };
          }
          return conv;
        });
        
        setConversations(processedData);
        
        // Chỉ load avatar cho conversation đầu tiên để tăng tốc độ
        const conversationsWithAvatars = [...processedData];
        
        if (processedData.length > 0) {
          try {
            const firstConv = processedData[0];
            const messagesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${firstConv.conversationId}`);
            const messages = await messagesRes.json();
            
            if (messages.length > 0) {
              const firstUserMessage = messages.find((msg: Message) => msg.senderId !== currentAdminId);
              if (firstUserMessage) {
                conversationsWithAvatars[0] = {
                  ...firstConv,
                  participants: firstConv.participants.map((participant: { userId: string; userName: string; userAvatar?: string; role: string; unreadCount: number }) => 
                    participant.role === 'user' 
                      ? { 
                          ...participant, 
                          userAvatar: firstUserMessage.senderAvatar || participant.userAvatar,
                          userName: firstUserMessage.senderName || participant.userName
                        }
                      : participant
                  )
                };
              }
            }
          } catch {
            // Silent error handling
          }
        }
        
        setConversations(conversationsWithAvatars);
        
        if (conversationsWithAvatars.length > 0 && !activeConversation) {
          setActiveConversation(conversationsWithAvatars[0].conversationId);
          socket.emit("joinConversation", conversationsWithAvatars[0].conversationId);
          loadMessages(conversationsWithAvatars[0].conversationId);
        }
      });

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId == activeConversation) {
        setMessages(prev => [...prev, newMsg]);
      }
      updateConversationsList(newMsg);
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [activeConversation]);

  // Cập nhật avatar và tên khi có tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.senderId !== currentAdminId) {
        // Cập nhật avatar và tên trong conversations nếu có thay đổi
        setConversations(prev => prev.map(conv => {
          if (conv.conversationId === newMsg.conversationId) {
            return {
              ...conv,
              participants: conv.participants.map(participant => 
                participant.role === 'user' 
                  ? { 
                      ...participant, 
                      userAvatar: newMsg.senderAvatar || participant.userAvatar,
                      userName: newMsg.senderName || participant.userName
                    }
                  : participant
              )
            };
          }
          return conv;
        }));
      }
    };

    socket.on("receiveMessage", handleNewMessage);
    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, []);

  const loadMessages = (conversationId: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${conversationId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        
        // Cập nhật avatar và tên từ messages nếu conversation không có
        if (data.length > 0) {
          const firstUserMessage = data.find((msg: Message) => msg.senderId !== currentAdminId);
          if (firstUserMessage) {
            setConversations(prev => prev.map(conv => {
              if (conv.conversationId === conversationId) {
                return {
                  ...conv,
                  participants: conv.participants.map(participant => 
                    participant.role === 'user' 
                      ? { 
                          ...participant, 
                          userAvatar: firstUserMessage.senderAvatar || participant.userAvatar,
                          userName: firstUserMessage.senderName || participant.userName
                        }
                      : participant
                  )
                };
              }
              return conv;
            }));
          }
        }
      });
  };

  const updateConversationsList = (msg: Message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.conversationId == msg.conversationId);
  
      if (existingIndex >= 0) {
        const newConvs = [...prev];
        // Cập nhật avatar và tên nếu có thay đổi
        if (msg.senderAvatar && newConvs[existingIndex].participants[0]?.userAvatar !== msg.senderAvatar) {
          newConvs[existingIndex].participants[0] = {
            ...newConvs[existingIndex].participants[0],
            userAvatar: msg.senderAvatar
          };
        }
        
        // Cập nhật tên nếu có thay đổi
        if (msg.senderName && newConvs[existingIndex].participants[0]?.userName !== msg.senderName) {
          newConvs[existingIndex].participants[0] = {
            ...newConvs[existingIndex].participants[0],
            userName: msg.senderName
          };
        }
        
        newConvs[existingIndex] = {
          ...newConvs[existingIndex],
          lastMessage: msg.text || (msg.image ? "[Hình ảnh]" : msg.file ? "[File]" : ""),
          lastMessageType: msg.messageType,
          lastMessageSenderId: msg.senderId,
          lastTime: msg.createdAt,
        };
        return newConvs.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
      } else {
        return [
          {
            _id: msg.conversationId,
            conversationId: msg.conversationId,
            participants: [{
              userId: msg.senderId,
              userName: msg.senderName,
              userAvatar: msg.senderAvatar || "",
              role: 'user',
              unreadCount: 0,
            }],
            lastMessage: msg.text || (msg.image ? "[Hình ảnh]" : msg.file ? "[File]" : ""),
            lastMessageType: msg.messageType,
            lastMessageSenderId: msg.senderId,
            lastTime: msg.createdAt,
            unreadCount: 0,
          },
          ...prev
        ];
      }
    });
  };  

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    socket.emit("joinConversation", conversationId);
    loadMessages(conversationId);
    socket.emit("seenMessage", { conversationId, userId: currentAdminId });
  };
  
  const handleSend = () => {
    if (!activeConversation) return;
    if (!inputValue.trim() && !selectedImage) return;
  
    const baseMsg: Message = {
      senderId: currentAdminId,
      senderName: "Admin",
      senderAvatar: adminAvatar,
      text: inputValue.trim() || "",
      messageType: selectedImage ? 'image' : 'text',
      createdAt: new Date().toISOString(),
      conversationId: activeConversation,
    };
  
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const msgWithImage: Message = {
          ...baseMsg,
          image: reader.result as string,
          messageType: 'image',
        };
        socket.emit("sendMessage", msgWithImage);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      socket.emit("sendMessage", baseMsg);
    }

    
  
    setInputValue("");
    setSelectedImage(null);
  };  
  
  useEffect(() => {
    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg._id != messageId));
      toast.success('Tin nhắn đã bị xoá');
    };
    socket.on('messageDeleted', handleMessageDeleted);
    return () => {
socket.off('messageDeleted', handleMessageDeleted);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);
  
  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá cuộc hội thoại này?")) return;
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast.success("Đã xoá cuộc hội thoại");
        setConversations(prev => prev.filter(conv => conv.conversationId != conversationId));
  
        if (activeConversation == conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } else {
        toast.error(data.error || "Xoá thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi xoá");
    }
  };
  
  useEffect(() => {
    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      setConversations(prev => prev.filter(conv => conv.conversationId != conversationId));
      if (activeConversation == conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
      toast.info("Cuộc hội thoại đã bị xoá");
    };
  
    socket.on("conversationDeleted", handleConversationDeleted);
  
    return () => {
      socket.off("conversationDeleted", handleConversationDeleted);
    };
  }, [activeConversation]);

  const currentConv = conversations.find(c => c.conversationId == activeConversation);

  const filteredConversations = conversations.filter(conv => {
    const userName = conv.participants[0]?.userName || "";
    const lastMessage = conv.lastMessage || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <input
            type="text"
placeholder="Tìm kiếm cuộc hội thoại..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.conversationsList}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectConversation(conv.conversationId)}
                className={`${styles.conversationItem} ${conv.conversationId == activeConversation ? styles.active : ""}`}
              >
                <div className={styles.avatarContainer}>
                  <Image
                    src={getAvatarImageUrl(conv.participants[0]?.userAvatar) || user_img_default}
                    alt="avatar"
                    className={styles.avatar}
                    width={40}
                    height={40}
                    unoptimized
                  />
                  <div className={styles.onlineIndicator}></div>
                </div>
                <div className={styles.conversationContent}>
                  <div className={styles.conversationName}>
                    {conv.participants[0]?.userName || "Người dùng"}
                  </div>
                  <div className={styles.lastMessage}>
                    {conv.lastMessage}
                  </div>
                </div>
                <div className={styles.timestamp}>
                  {formatDateTime(conv.lastTime)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              {searchTerm ? "Không tìm thấy cuộc hội thoại nào" : "Chưa có cuộc hội thoại nào"}
            </div>
          )}
        </div>
      </aside>

      <main className={styles.mainChat}>
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <Image
              src={getAvatarImageUrl(currentConv?.participants[0]?.userAvatar) || user_img_default}
              alt="avatar"
              className={styles.headerAvatar}
              width={40}
              height={40}
              unoptimized
            />
            <div className={styles.headerName}>
              {currentConv?.participants[0]?.userName || "Khách hàng"}
            </div>
          </div>
          <div className={styles.headerActions}>
            <FiUser className={styles.headerAction} />
            <FiSearch className={styles.headerAction} />
            <FiVideo className={styles.headerAction} />
            <FiTrash2 
              className={`${styles.headerAction} ${styles.deleteAction}`}
              onClick={() => {
                if (currentConv?.conversationId) {
                  deleteConversation(currentConv.conversationId);
                }
              }}
            />
          </div>
        </header>
<div className={styles.messagesContainer}>
          {messages.map((msg, idx) => {
            const isAdmin = msg.senderId == currentAdminId;
            const avatarUrl = isAdmin ? adminAvatar : (getAvatarImageUrl(msg.senderAvatar) || user_img_default);

            return (
              <div 
                key={idx} 
                className={`${styles.messageWrapper} ${isAdmin ? styles.sent : styles.received}`}
              >
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  className={styles.messageAvatar}
                  width={40}
                  height={40}
                  unoptimized
                />
                
                <div className={`${styles.messageBubble} ${isAdmin ? styles.sent : styles.received}`}>
                  {msg.text && <div>{msg.text}</div>}
                  {msg.image && (
                    <Image
                      src={msg.image || ""}
                      alt="image"
                      className={styles.messageImage}
                      width={200}
                      height={200}
                      unoptimized
                    />
                  )}
                  {msg.file && (
                    <a 
                      href={msg.file} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.messageFile}
                    >
                      Tải file
                    </a>
                  )}
                  <div className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleDateString('vi-VN', { 
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatFooter}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className={styles.messageInput}
              onKeyDown={(e) => e.key == "Enter" && handleSend()}
            />

            <label htmlFor="upload-image" className={styles.uploadButton}>
              <FiCamera />
            </label>
            <input
              id="upload-image"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            />

            <button
              onClick={handleSend}
              className={styles.sendButton}
            >
              <FiSend />
            </button>
          </div>
{selectedImage && (
            <div className={styles.imagePreview}>
              <div className={styles.previewContainer}>
                <Image
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  className={styles.previewImage}
                  width={200}
                  height={200}
                  unoptimized
                />
                <span className={styles.previewFileName}>
                  {selectedImage.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className={styles.removePreview}
              >
                ✕ Xoá
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
