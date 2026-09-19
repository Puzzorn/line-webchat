'use client';

import { useState, useRef, useEffect } from 'react';
import { LineUserProfile, ChatMessage } from '@/lib/types';
import { Send, User, MessageCircle, AlertCircle, RefreshCw, Smartphone, ExternalLink, ArrowLeft } from 'lucide-react';

interface ChatBoxProps {
  selectedUser: LineUserProfile | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onSimulateIncomingMessage?: (text: string) => Promise<void>;
  onBack?: () => void;
  onRefresh?: () => void;
  isLoadingMessages?: boolean;
  isRefreshingMessages?: boolean;
  isLiveMode?: boolean;
  className?: string;
}

function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-2 animate-pulse">
      <div className="flex items-start space-x-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="w-48 h-12 bg-white rounded-2xl rounded-bl-none border border-slate-200" />
      </div>
      <div className="flex items-end justify-end space-x-2">
        <div className="w-56 h-12 bg-emerald-200/60 rounded-2xl rounded-br-none" />
      </div>
      <div className="flex items-start space-x-2">
        <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="w-64 h-14 bg-white rounded-2xl rounded-bl-none border border-slate-200" />
      </div>
    </div>
  );
}

export function ChatBox({
  selectedUser,
  messages,
  onSendMessage,
  onSimulateIncomingMessage,
  onBack,
  onRefresh,
  isLoadingMessages = false,
  isRefreshingMessages = false,
  isLiveMode = false,
  className = '',
}: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState('');
  const [mockIncomingText, setMockIncomingText] = useState('');
  const [showSimulateInput, setShowSimulateInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedUser || isSending) return;

    const textToSend = inputText;
    setInputText('');
    setIsSending('webchat');

    try {
      await onSendMessage(textToSend);
    } finally {
      setIsSending('');
    }
  };

  const handleSimulateIncoming = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mockIncomingText.trim() || !selectedUser || !onSimulateIncomingMessage) return;

    const text = mockIncomingText;
    setMockIncomingText('');
    setShowSimulateInput(false);

    await onSimulateIncomingMessage(text);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to detect URLs and format clickable links
  const renderFormattedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:opacity-80 transition-opacity inline-flex items-center gap-0.5 break-all underline-offset-2"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  if (!selectedUser) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-400 ${className}`}>
        <div className="w-16 h-16 rounded-full bg-slate-200/60 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">ยังไม่ได้เลือกห้องแชท</h3>
        <p className="text-sm text-slate-400 mt-1 text-center max-w-xs">
          เลือกรายชื่อผู้ใช้งาน LINE จากแถบด้านซ้ายเพื่อดูข้อความและตอบกลับ
        </p>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full bg-slate-100 ${className}`}>
      {/* Header */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-2.5">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              title="ย้อนกลับไปรายชื่อผู้ใช้"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 md:hidden transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            {selectedUser.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedUser.pictureUrl}
                alt={selectedUser.displayName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                {selectedUser.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-sm text-slate-900 leading-tight truncate">
              {selectedUser.displayName}
            </h2>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              ID: {selectedUser.userId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshingMessages}
              title="รีเฟรชประวัติแชท"
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingMessages ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}

          {!isLiveMode && onSimulateIncomingMessage && (
            <button
              onClick={() => setShowSimulateInput(!showSimulateInput)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center space-x-1 font-medium"
              title="จำลองกรณีผู้ใช้ส่งข้อความมาจากแอป LINE"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">จำลองรับข้อความจาก LINE User</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulate Input Overlay Banner */}
      {!isLiveMode && showSimulateInput && onSimulateIncomingMessage && (
        <form
          onSubmit={handleSimulateIncoming}
          className="p-3 bg-amber-50 border-b border-amber-200 flex items-center space-x-2 animate-fadeIn"
        >
          <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-medium text-amber-800 flex-shrink-0 hidden sm:inline">
            พิมพ์ข้อความในนาม LINE User:
          </span>
          <input
            type="text"
            placeholder="พิมพ์ข้อความสมมติที่ LINE User ส่งมา..."
            value={mockIncomingText}
            onChange={(e) => setMockIncomingText(e.target.value)}
            className="flex-1 px-3 py-1 text-xs border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
          >
            ส่งเข้าแชท
          </button>
        </form>
      )}

      {/* Messages List / Skeleton Loading */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoadingMessages && messages.length === 0 ? (
          <ChatMessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-8">
            ยังไม่มีประวัติการสนทนากับผู้ใช้นี้
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${
                  isUser ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* User Avatar on left for incoming messages */}
                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-300 flex-shrink-0 overflow-hidden mb-1">
                    {selectedUser.pictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedUser.pictureUrl}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-600 m-1.5" />
                    )}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[70%] group`}>
                  {/* Sender label */}
                  <p
                    className={`text-[10px] font-medium text-slate-400 mb-0.5 px-1 ${
                      isUser ? 'text-left' : 'text-right'
                    }`}
                  >
                    {isUser ? selectedUser.displayName : 'Webchat Admin'}
                  </p>

                  {/* Rich Message Body Rendering */}
                  {msg.type === 'sticker' && msg.mediaUrl ? (
                    <div className="p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.mediaUrl}
                        alt="LINE Sticker"
                        className="w-28 h-28 object-contain drop-shadow-sm hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : msg.type === 'image' && msg.mediaUrl ? (
                    <div className="rounded-2xl overflow-hidden max-w-xs shadow-sm border border-slate-200 bg-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.mediaUrl}
                        alt="LINE Attachment"
                        className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                      />
                    </div>
                  ) : (
                    /* Default Text / Link Message Bubble */
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm shadow-sm leading-relaxed break-words ${
                        isUser
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                          : 'bg-emerald-600 text-white rounded-br-none'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  )}

                  {/* Timestamp & Status */}
                  <div
                    className={`flex items-center space-x-1 mt-1 px-1 text-[10px] text-slate-400 ${
                      isUser ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>{formatTime(msg.timestamp)}</span>
                    {!isUser && (
                      msg.status === 'failed' ? (
                        <span className="text-rose-500 flex items-center space-x-0.5" title={msg.errorDetails}>
                          <AlertCircle className="w-3 h-3" />
                          <span>ล้มเหลว</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium ml-1">
                          ส่งแล้ว
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`ส่งข้อความตอบกลับไปยัง ${selectedUser.displayName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!!isSending}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !!isSending}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>ส่ง</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
