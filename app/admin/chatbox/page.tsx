"use client";

import { useEffect, useState } from "react";
import { FiSearch, FiVideo, FiTrash2, FiUser, FiCamera, FiSend } from "react-icons/fi";
import { Trash2 } from 'lucide-react';
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { useRef } from 'react';
import styles from '../assets/css/AdminChat.module.css';
import { useAppContext } from "../../context/AppContext"
import Image from "next/image";

const socket = io("https://bevclock-production.up.railway.app");

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

  const user_img_default = "https://media.istockphoto.com/id/1300845620/vi/vec-to/bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-ng%C6%B0%E1%BB%9Di-d%C3%B9ng-ph%E1%BA%B3ng-b%E1%BB%8B-c%C3%B4-l%E1%BA%ADp-tr%C3%AAn-n%E1%BB%81n-tr%E1%BA%AFng-bi%E1%BB%83u-t%C6%B0%E1%BB%A3ng-ng%C6%B0%E1%BB%9Di-d%C3%B9ng-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MyAgwZm-Ct_rQpQGYh0Wb0N7KeAaFsY_WrZJ89EAiIw=";
  const currentAdminId = "admin-id";
  const adminAvatar = "https://secure.gravatar.com/avatar/2ad86d4128742b555b487c8a62a33e9e?s=96&d=mm&r=g";

  useEffect(() => {
    fetch("https://bevclock-production.up.railway.app/api/conversations")
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        if (data.length > 0 && !activeConversation) {
          setActiveConversation(data[0].conversationId);
          socket.emit("joinConversation", data[0].conversationId);
          loadMessages(data[0].conversationId);
        }
      });

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId == activeConversation) {
        setMessages(prev => [...prev, newMsg]);
      }
      updateConversationsList(newMsg);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [activeConversation]);

  const loadMessages = (conversationId: string) => {
    fetch(`https://bevclock-production.up.railway.app/api/messages/${conversationId}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
      });
  };

  const updateConversationsList = (msg: Message) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(c => c.conversationId == msg.conversationId);
  
      if (existingIndex >= 0) {
        const newConvs = [...prev];
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

  interface DeleteMessagePayload {
    messageId: string;
    conversationId: string;
  }

  const deleteMessage = (messageId: string, conversationId: string): void => {
    const payload: DeleteMessagePayload = { messageId, conversationId };
    socket.emit('deleteMessage', payload);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversation]);
  
  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá cuộc hội thoại này?")) return;
  
    try {
      const res = await fetch(`https://bevclock-production.up.railway.app/api/conversations/${conversationId}`, {
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
    } catch (error) {
      console.error("Lỗi xoá conversation:", error);
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

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <input
            type="text"
            placeholder="Tìm kiếm cuộc hội thoại..."
            className={styles.searchInput}
          />
        </div>
        <div className={styles.conversationsList}>
          {conversations.map((conv, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectConversation(conv.conversationId)}
              className={`${styles.conversationItem} ${conv.conversationId == activeConversation ? styles.active : ""}`}
            >
              <div className={styles.avatarContainer}>
                <Image
                  src={conv.participants[0]?.userAvatar || user_img_default}
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
                {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <main className={styles.mainChat}>
        <header className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <Image
              src={currentConv?.participants[0]?.userAvatar || user_img_default}
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
            const avatarUrl = isAdmin ? adminAvatar : (msg.senderAvatar || user_img_default);

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
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (msg._id && msg.conversationId) deleteMessage(msg._id, msg.conversationId);
                    }}
                    className={styles.deleteButton}
                    title="Xoá tin nhắn"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
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