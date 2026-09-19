'use client';

import { useState, useRef, useEffect } from 'react';
import { LineUserProfile, ChatMessage, MessageType } from '@/lib/types';
import {
  Send,
  User,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Smartphone,
  ExternalLink,
  ArrowLeft,
  Paperclip,
  Smile,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

interface ChatBoxProps {
  selectedUser: LineUserProfile | null;
  messages: ChatMessage[];
  onSendMessage: (text: string, type?: MessageType, mediaUrl?: string, packageId?: string, stickerId?: string) => Promise<void>;
  onSimulateIncomingMessage?: (text: string) => Promise<void>;
  onResendMessage?: (msg: ChatMessage) => Promise<void>;
  onDeleteMessage?: (msgId: string) => Promise<void>;
  onBack?: () => void;
  onRefresh?: () => void;
  isLoadingMessages?: boolean;
  isRefreshingMessages?: boolean;
  isLiveMode?: boolean;
  className?: string;
}

const POPULAR_STICKERS = [
  { packageId: '11537', stickerId: '52002734', name: 'Moon Happy' },
  { packageId: '11537', stickerId: '52002735', name: 'Moon Love' },
  { packageId: '11537', stickerId: '52002736', name: 'Moon OK' },
  { packageId: '11537', stickerId: '52002737', name: 'Moon Thumbs Up' },
  { packageId: '11538', stickerId: '51626494', name: 'Cony Smile' },
  { packageId: '11538', stickerId: '51626495', name: 'Cony Heart' },
  { packageId: '1', stickerId: '1', name: 'Brown Smile' },
  { packageId: '1', stickerId: '2', name: 'Brown Laugh' },
  { packageId: '1', stickerId: '4', name: 'Brown Like' },
];

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
  onResendMessage,
  onDeleteMessage,
  onBack,
  onRefresh,
  isLoadingMessages = false,
  isRefreshingMessages = false,
  isLiveMode = false,
  className = '',
}: ChatBoxProps) {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [mockIncomingText, setMockIncomingText] = useState('');
  const [showSimulateInput, setShowSimulateInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedUser || isSending) return;

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage(textToSend, 'text');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSticker = async (packageId: string, stickerId: string) => {
    if (!selectedUser || isSending) return;
    setShowStickerPicker(false);
    setIsSending(true);
    try {
      const stickerUrl = `https://stickershop.line-scdn.net/stickershop/v1/sticker/${stickerId}/android/sticker.png`;
      await onSendMessage('[สติกเกอร์]', 'sticker', stickerUrl, packageId, stickerId);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser || isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const isImage = file.type.startsWith('image/');
        await onSendMessage(
          isImage ? '[รูปภาพ]' : `[ไฟล์แนบ] ${file.name}`,
          isImage ? 'image' : 'file',
          data.url
        );
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        {isLoadingMessages ? (
          <ChatMessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 text-xs py-8">
            ยังไม่มีประวัติการสนทนากับผู้ใช้นี้
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isFailed = msg.status === 'failed';

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
                        isFailed
                          ? 'bg-rose-50 text-rose-900 border border-rose-300 rounded-br-none'
                          : isUser
                          ? 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                          : 'bg-emerald-600 text-white rounded-br-none'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>
                  )}

                  {/* Timestamp, Status & Action Controls (Resend / Cancel) */}
                  <div
                    className={`flex items-center space-x-1.5 mt-1 px-1 text-[10px] text-slate-400 ${
                      isUser ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>{formatTime(msg.timestamp)}</span>

                    {!isUser && (
                      isFailed ? (
                        <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <span className="flex items-center space-x-1" title={msg.errorDetails}>
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span className="font-semibold">ล้มเหลว</span>
                          </span>

                          {onResendMessage && (
                            <button
                              onClick={() => onResendMessage(msg)}
                              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center space-x-0.5"
                              title="ลองส่งข้อความนี้อีกครั้ง"
                            >
                              <RotateCcw className="w-3 h-3 mr-0.5" />
                              <span>ส่งใหม่</span>
                            </button>
                          )}

                          {onDeleteMessage && (
                            <button
                              onClick={() => onDeleteMessage(msg.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline flex items-center space-x-0.5"
                              title="ยกเลิกและลบข้อความที่ส่งไม่ผ่าน"
                            >
                              <Trash2 className="w-3 h-3 mr-0.5" />
                              <span>ลบ</span>
                            </button>
                          )}
                        </div>
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

      {/* LINE Sticker Picker Popover */}
      {showStickerPicker && (
        <div className="p-3 bg-white border-t border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">เลือกสติกเกอร์ LINE</span>
            <button
              onClick={() => setShowStickerPicker(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
            {POPULAR_STICKERS.map((stk) => (
              <button
                key={`${stk.packageId}-${stk.stickerId}`}
                onClick={() => handleSendSticker(stk.packageId, stk.stickerId)}
                className="p-1 hover:bg-slate-100 rounded-xl transition-all flex flex-col items-center border border-slate-100"
                title={stk.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://stickershop.line-scdn.net/stickershop/v1/sticker/${stk.stickerId}/android/sticker.png`}
                  alt={stk.name}
                  className="w-12 h-12 object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form with File Attachment & Sticker Selector */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSendText} className="flex items-center space-x-2">
          {/* File Upload Input (Hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !!isSending}
            title="แนบรูปภาพหรือไฟล์"
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            {isUploading ? <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" /> : <Paperclip className="w-5 h-5" />}
          </button>

          {/* Sticker Button */}
          <button
            type="button"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            disabled={!!isSending}
            title="ส่งสติกเกอร์ LINE"
            className={`p-2.5 text-slate-500 hover:text-amber-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 ${
              showStickerPicker ? 'text-amber-500 bg-amber-50' : ''
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={`ส่งข้อความตอบกลับไปยัง ${selectedUser.displayName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!!isSending || isUploading}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || !!isSending || isUploading}
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
