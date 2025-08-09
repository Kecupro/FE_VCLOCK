'use client';

import { useState, useEffect } from 'react';

interface TypewriterPlaceholderProps {
  suggestions: string[];
  typingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export default function TypewriterPlaceholder({ 
  suggestions, 
  typingSpeed = 100, 
  pauseTime = 2000,
  className = ""
}: TypewriterPlaceholderProps) {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (suggestions.length === 0) return;

    const currentSuggestion = suggestions[currentIndex];
    
    const timer = setTimeout(() => {
      if (isTyping) {
        // Đang gõ chữ
        if (charIndex < currentSuggestion.length) {
          setCurrentText(currentSuggestion.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Hoàn thành gõ, chờ một chút rồi bắt đầu xóa
          setTimeout(() => setIsTyping(false), pauseTime);
        }
      } else {
        // Đang xóa chữ
        if (charIndex > 0) {
          setCurrentText(currentSuggestion.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Hoàn thành xóa, chuyển sang từ tiếp theo
          setIsTyping(true);
          setCurrentIndex((currentIndex + 1) % suggestions.length);
        }
      }
    }, isTyping ? typingSpeed : typingSpeed / 2);

    return () => clearTimeout(timer);
  }, [currentText, currentIndex, isTyping, charIndex, suggestions, typingSpeed, pauseTime]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
