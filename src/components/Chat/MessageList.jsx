import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MessageList({ onReply, roomId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [swipedMessageId, setSwipedMessageId] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

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

  const handleTouchStart = (e, messageId) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
    setSwipedMessageId(messageId);
  };

  const handleTouchMove = (e, isMyMessage) => {
    if (!swipedMessageId) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    const diffX = touchCurrentX - touchStartX.current;
    const diffY = touchCurrentY - touchStartY.current;

    // 수평 스와이프가 수직보다 클 때만 처리
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true;
      
      // 내 메시지는 왼쪽으로, 상대 메시지는 오른쪽으로만 스와이프
      if (isMyMessage && diffX < 0) {
        setSwipeOffset(Math.max(diffX, -80));
      } else if (!isMyMessage && diffX > 0) {
        setSwipeOffset(Math.min(diffX, 80));
      }
    }
  };

  const handleTouchEnd = (message) => {
    if (isSwiping.current && Math.abs(swipeOffset) > 40) {
      onReply(message);
    }
    
    setSwipeOffset(0);
    setSwipedMessageId(null);
    isSwiping.current = false;
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
          아직 메시지가 없습니다. 첫 메시지를 보내보세요
        </div>
      ) : (
        messages.map((msg) => {
          const isMyMessage = msg.userId === auth.currentUser.uid;
          const isSwipingThis = swipedMessageId === msg.id;
          
          return (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group transition-colors duration-500`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className="relative max-w-xs lg:max-w-md">
                {/* 호버 시 답장 버튼 - 중앙 정렬 */}
                {hoveredMessageId === msg.id && (
                  <button
                    onClick={() => onReply(msg)}
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isMyMessage ? 'right-full mr-2' : 'left-full ml-2'
                    } bg-gray-700 text-white text-xs px-3 py-1 rounded whitespace-nowrap hover:bg-gray-800 transition shadow-lg z-10`}
                  >
                    답장
                  </button>
                )}

                {/* 스와이프 시 답장 아이콘 */}
                {isSwipingThis && Math.abs(swipeOffset) > 10 && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 ${
                      isMyMessage ? 'right-full mr-4' : 'left-full ml-4'
                    } text-2xl transition-opacity`}
                    style={{ 
                      opacity: Math.min(Math.abs(swipeOffset) / 40, 1)
                    }}
                  >
                    ↩️
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-lg transition-transform ${
                    isMyMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  style={{
                    transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                    transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                  }}
                  onTouchStart={(e) => handleTouchStart(e, msg.id)}
                  onTouchMove={(e) => handleTouchMove(e, isMyMessage)}
                  onTouchEnd={() => handleTouchEnd(msg)}
                >
                  {!isMyMessage && (
                    <div className="mb-1 text-xs opacity-75">
                      {msg.displayName || msg.userEmail}
                    </div>
                  )}

                  {msg.replyTo && (
                    <div
                      onClick={() => scrollToMessage(msg.replyTo.id)}
                      className={`mb-2 p-2 rounded border-l-2 cursor-pointer ${
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

                  {/* 마크다운 렌더링 */}
                  <div className={`markdown-content break-words ${
                    isMyMessage ? 'text-white' : 'text-gray-800'
                  }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // 링크
                        a: ({node, ...props}) => (
                          <a 
                            {...props} 
                            className={`underline ${isMyMessage ? 'text-blue-100' : 'text-blue-600'} hover:opacity-80`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          />
                        ),
                        // 코드 블록
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
                              className={`block p-2 rounded font-mono text-sm my-1 overflow-x-auto ${
                                isMyMessage ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            />
                          ),
                        // 강조
                        strong: ({node, ...props}) => (
                          <strong {...props} className="font-bold" />
                        ),
                        // 이탤릭
                        em: ({node, ...props}) => (
                          <em {...props} className="italic" />
                        ),
                        // 취소선
                        del: ({node, ...props}) => (
                          <del {...props} className="line-through" />
                        ),
                        // 리스트
                        ul: ({node, ...props}) => (
                          <ul {...props} className="my-1 list-disc list-inside" />
                        ),
                        ol: ({node, ...props}) => (
                          <ol {...props} className="my-1 list-decimal list-inside" />
                        ),
                        // 인용
                        blockquote: ({node, ...props}) => (
                          <blockquote 
                            {...props} 
                            className={`border-l-4 pl-2 my-1 ${
                              isMyMessage ? 'border-blue-300' : 'border-gray-400'
                            }`}
                          />
                        ),
                        // 제목 크기 조정
                        h1: ({node, ...props}) => <h1 {...props} className="my-1 text-xl font-bold" />,
                        h2: ({node, ...props}) => <h2 {...props} className="my-1 text-lg font-bold" />,
                        h3: ({node, ...props}) => <h3 {...props} className="my-1 text-base font-bold" />,
                        // 단락
                        p: ({node, ...props}) => <p {...props} className="my-0.5" />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>

                  <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.createdAt?.toDate().toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
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