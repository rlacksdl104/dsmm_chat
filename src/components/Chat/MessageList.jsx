import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function MessageList({ onReply }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (messageId) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 하이라이트 효과
      element.classList.add('bg-yellow-100');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
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
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="text-gray-500">메시지를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          아직 메시지가 없습니다. 첫 메시지를 보내보세요! 💬
        </div>
      ) : (
        messages.map((msg) => {
          const isMyMessage = msg.userId === auth.currentUser.uid;
          
          return (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group transition-colors duration-500`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div className="relative max-w-xs lg:max-w-md">
                {/* 답장 버튼 */}
                {hoveredMessageId === msg.id && (
                  <button
                    onClick={() => onReply(msg)}
                    className={`absolute top-3 ${
                      isMyMessage ? 'right-full mr-2' : 'left-full ml-2'
                    } bg-gray-700 text-white text-xs px-3 py-1 rounded whitespace-nowrap hover:bg-gray-800 transition shadow-lg`}
                  >
                    답장
                  </button>
                )}
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isMyMessage
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {!isMyMessage && (
                    <div className="mb-1 text-xs opacity-75">
                      {msg.userEmail}
                    </div>
                  )}

                  {/* 답장된 메시지 표시 */}
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
                        {msg.replyTo.userEmail}
                      </div>
                      <div className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-600'} truncate`}>
                        {msg.replyTo.text}
                      </div>
                    </div>
                  )}

                  <div className="break-words">{msg.text}</div>
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