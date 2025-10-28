import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
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

  // 더블클릭으로 수정 시작
  const handleDoubleClick = (msg) => {
    if (msg.userId === auth.currentUser.uid) {
      setEditingMessageId(msg.id);
      setEditText(msg.text);
    }
  };

  // 길게 누르기 시작
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

  // 길게 누르기 취소
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

  // 메시지 수정 저장
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

  // 메시지 수정 취소
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  // 메시지 삭제
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
      <div className="flex items-center justify-center flex-1 bg-gray-50">
        <div className="text-gray-500">채팅방을 선택해주세요</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 bg-gray-50">
        <div className="text-gray-500">메시지를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
      {messages.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          아직 메시지가 없습니다. 첫 메시지를 보내보세요! 💬
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
                {/* 답장 버튼만 표시 */}
                {hoveredMessageId === msg.id && !isEditing && (
                  <div className={`absolute top-1/2 -translate-y-1/2 ${
                    isMyMessage ? 'right-full mr-2' : 'left-full ml-2'
                  }`}>
                    <button
                      onClick={() => onReply(msg)}
                      className="px-3 py-1 text-xs text-white transition bg-gray-700 rounded shadow-lg hover:bg-gray-800 whitespace-nowrap"
                    >
                      답장
                    </button>
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-lg relative overflow-hidden ${
                    isMyMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  } ${isMyMessage ? 'cursor-pointer select-none' : ''}`}
                  onDoubleClick={() => handleDoubleClick(msg)}
                  onMouseDown={() => isMyMessage && handleMouseDown(msg)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={() => isMyMessage && handleMouseDown(msg)}
                  onTouchEnd={handleMouseUp}
                >
                  {/* 길게 누르기 프로그레스 바 */}
                  {isLongPressing && (
                    <div className="absolute inset-0 transition-all duration-100 bg-red-500 opacity-20"
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
                          ? 'bg-blue-600 border-blue-300'
                          : 'bg-gray-300 border-gray-500'
                      }`}
                    >
                      <div className={`text-xs font-semibold ${isMyMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                        {msg.replyTo.displayName || msg.replyTo.userEmail}
                      </div>
                      <div className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-600'} line-clamp-2`}>
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  {/* 수정 모드 */}
                  {isEditing ? (
                    <div className="relative z-10 space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-2 py-1 text-sm text-gray-800 bg-white border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="px-3 py-1 text-xs text-white transition bg-gray-600 rounded hover:bg-gray-700"
                        >
                          취소 (Esc)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 마크다운 렌더링 */}
                      <div className={`markdown-content break-words relative z-10 ${
                        isMyMessage ? 'text-white' : 'text-gray-800'
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            a: ({node, ...props}) => (
                              <a 
                                {...props} 
                                className={`underline ${isMyMessage ? 'text-blue-100' : 'text-blue-600'} hover:opacity-80`}
                                target="_blank" 
                                rel="noopener noreferrer"
                              />
                            ),
                            code: ({node, inline, ...props}) => 
                              inline ? (
                                <code 
                                  {...props} 
                                  className={`px-1 py-0.5 rounded font-mono text-sm ${
                                    isMyMessage ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                />
                              ) : (
                                <code 
                                  {...props} 
                                  className={`block p-2 rounded font-mono text-sm my-1 overflow-x-auto whitespace-pre-wrap ${
                                    isMyMessage ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                />
                              ),
                            strong: ({node, ...props}) => (
                              <strong {...props} className="font-bold" />
                            ),
                            em: ({node, ...props}) => (
                              <em {...props} className="italic" />
                            ),
                            del: ({node, ...props}) => (
                              <del {...props} className="line-through" />
                            ),
                            ul: ({node, ...props}) => (
                              <ul {...props} className="my-1 list-disc list-inside" />
                            ),
                            ol: ({node, ...props}) => (
                              <ol {...props} className="my-1 list-decimal list-inside" />
                            ),
                            blockquote: ({node, ...props}) => (
                              <blockquote 
                                {...props} 
                                className={`border-l-4 pl-2 my-1 ${
                                  isMyMessage ? 'border-blue-300' : 'border-gray-400'
                                }`}
                              />
                            ),
                            h1: ({node, ...props}) => <h1 {...props} className="my-1 text-xl font-bold" />,
                            h2: ({node, ...props}) => <h2 {...props} className="my-1 text-lg font-bold" />,
                            h3: ({node, ...props}) => <h3 {...props} className="my-1 text-base font-bold" />,
                            p: ({node, ...props}) => <p {...props} className="mb-1 last:mb-0" />,
                            br: ({node, ...props}) => <br {...props} />,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>

                      {/* 수정됨 표시 */}
                      {msg.isEdited && (
                        <div className={`text-xs mt-1 italic relative z-10 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                          (수정됨)
                        </div>
                      )}
                    </>
                  )}

                  <div className={`text-xs mt-1 relative z-10 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.createdAt?.toDate().toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {/* 길게 누르기 안내 (처음 1초만 표시) */}
                  {isLongPressing && longPressProgress < 30 && (
                    <div className="absolute z-20 px-3 py-1 text-xs text-white -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded shadow-lg top-1/2 left-1/2 whitespace-nowrap">
                      삭제중
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