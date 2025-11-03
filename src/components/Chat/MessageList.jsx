import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useTheme } from '../../contexts/ThemeContexts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function MessageList({ onReply, roomId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [longPressMessageId, setLongPressMessageId] = useState(null);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const longPressTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const { isDark } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-100');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDoubleClick = (msg) => {
    if (msg.userId === auth.currentUser.uid) {
      setEditingMessageId(msg.id);
      setEditText(msg.text);
    }
  };

  const handleMouseDown = (msg) => {
    if (msg.userId !== auth.currentUser.uid) return;

    setLongPressMessageId(msg.id);
    setLongPressProgress(0);

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 14;
      setLongPressProgress(progress);
    }, 100);

    longPressTimerRef.current = setTimeout(() => {
      handleDelete(msg.id);
      clearLongPress();
    }, 1000);
  };

  const handleMouseUp = () => {
    clearLongPress();
  };

  const handleMouseLeave = () => {
    clearLongPress();
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLongPressMessageId(null);
    setLongPressProgress(0);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) {
      alert('메시지 내용을 입력해주세요.');
      return;
    }

    try {
      const messageRef = doc(db, 'messages', msgId);
      await updateDoc(messageRef, {
        text: editText,
        editedAt: new Date(),
        isEdited: true,
      });
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error('메시지 수정 실패:', error);
      alert('메시지 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDelete = async (msgId) => {
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      alert('메시지 삭제에 실패했습니다.');
    }
  };

  if (!roomId) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          채팅방을 선택해주세요
        </div>  
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          메시지를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${isDark ? 'bg-black' : 'bg-white'}`}>
      {messages.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          아직 메시지가 없습니다. 첫 메시지를 보내보세요 💬
        </div>
      ) : (
        messages.map((msg) => {
          const isMyMessage = msg.userId === auth.currentUser.uid;
          const isEditing = editingMessageId === msg.id;
          const isLongPressing = longPressMessageId === msg.id;

          return (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group transition-colors duration-500`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className="relative max-w-xs lg:max-w-md">
                {hoveredMessageId === msg.id && !isEditing && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isMyMessage ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    <button
                      onClick={() => onReply(msg)}
                      className={`text-white text-xs px-3 py-1 rounded transition shadow-lg whitespace-nowrap ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      답장
                    </button>
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-lg relative overflow-hidden ${
                    isMyMessage
                      ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-200 text-gray-800'
                  } ${isMyMessage ? 'cursor-pointer select-none' : ''}`}
                  onDoubleClick={() => handleDoubleClick(msg)}
                  onMouseDown={() => isMyMessage && handleMouseDown(msg)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={() => isMyMessage && handleMouseDown(msg)}
                  onTouchEnd={handleMouseUp}
                >
                  {isLongPressing && (
                    <div className="absolute inset-0 transition-all duration-300 bg-red-500 opacity-20"
                         style={{ width: `${longPressProgress}%` }}>
                    </div>
                  )}

                  {!isMyMessage && (
                    <div className="relative z-10 mb-1 text-xs opacity-75">
                      {msg.displayName || msg.userEmail}
                    </div>
                  )}

                  {msg.replyTo && (
                    <div
                      onClick={() => scrollToMessage(msg.replyTo.id)}
                      className={`mb-2 p-2 rounded border-l-2 cursor-pointer relative z-10 ${
                        isMyMessage
                          ? isDark ? 'bg-blue-700 border-blue-400' : 'bg-blue-600 border-blue-300'
                          : isDark ? 'bg-gray-700 border-gray-500' : 'bg-gray-300 border-gray-500'
                      }`}
                    >
                      <div className={`text-xs font-semibold ${
                        isMyMessage ? 'text-blue-100' : isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {msg.replyTo.displayName || msg.replyTo.userEmail}
                      </div>
                      <div className={`text-xs line-clamp-2 ${
                        isMyMessage ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    <div className="relative z-10 space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className={`w-full px-2 py-1 text-sm rounded border resize-none ${
                          isDark
                            ? 'bg-gray-700 text-white focus:ring-blue-500'
                            : 'bg-white text-gray-800 focus:ring-blue-500'
                        } focus:ring-2 focus:border-transparent`}
                        rows={3}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSaveEdit(msg.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-3 py-1 text-xs text-white transition bg-blue-600 rounded hover:bg-blue-700"
                        >
                          저장 (Ctrl+Enter)
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className={`px-3 py-1 text-white text-xs rounded transition ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          취소 (Esc)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`markdown-content break-words relative z-10 ${
                        isMyMessage ? 'text-white' : isDark ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props}
                                className={`underline ${isMyMessage ? 'text-blue-100' : 'text-blue-600'} hover:opacity-80`}
                                target="_blank" rel="noopener noreferrer"
                              />
                            ),
                            code: ({ node, inline, ...props }) =>
                              inline ? (
                                <code {...props} className={`px-1 py-0.5 rounded font-mono text-sm ${isMyMessage ? 'bg-blue-600' : 'bg-gray-300'}`} />
                              ) : (
                                <code {...props} className={`block p-2 rounded font-mono text-sm my-1 overflow-x-auto whitespace-pre-wrap ${isMyMessage ? 'bg-blue-600' : 'bg-gray-300'}`} />
                              ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </>
                  )}

                  {/* 시간 표시 부분 제거 완료 */}

                  {isLongPressing && longPressProgress < 50 && (
                    <div className="absolute z-20 px-3 py-1 text-xs text-white -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded shadow-lg top-1/2 left-1/2 whitespace-nowrap">
                      🗑️ 삭제
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
