import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { useTheme } from '../../contexts/ThemeContexts';

export default function MessageInput({ replyTo, onCancelReply, roomId }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !roomId) return;
    if (message.length > 100) {
      alert('메시지는 100자 이내로 입력해야 합니다.');
      return;
    }

    setSending(true);

    try {
      const messageData = {
        text: message,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        displayName:
          auth.currentUser.displayName ||
          auth.currentUser.email.split('@')[0],
        roomId: roomId,
        createdAt: serverTimestamp(),
      };

      if (replyTo) {
        messageData.replyTo = {
          id: replyTo.id,
          text: replyTo.text,
          userEmail: replyTo.userEmail,
          displayName: replyTo.displayName || replyTo.userEmail,
        };
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      setMessage('');
      onCancelReply();
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="bg-white border-t">
      {replyTo && (
        <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b bg-gray-50">
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold text-blue-600">
              {replyTo.userEmail}에게 답장
            </div>
            <div className="text-sm text-gray-600 truncate">
              {replyTo.text}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className={`p-4 ${ isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= 100) {
                setMessage(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={replyTo ? '답장을 입력해주세요' : '메시지 입력'}
            className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
            disabled={sending || !roomId}
            autoFocus
            rows={1}
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={sending || !message.trim() || !roomId}
              className="px-6 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {sending ? '전송 중...' : '전송'}
            </button>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="px-6 py-2 text-sm text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300 whitespace-nowrap"
            >
              MD
            </button>
          </div>
        </div>

        <div className="mt-1 text-xs text-right text-gray-500">
          {message.length}/100
        </div>

        {/* 마크다운 가이드 */}
{showGuide && (
  <div className="p-3 mt-3 text-xs border border-gray-200 rounded-lg bg-gray-50">
    <div className="flex items-center gap-2 mb-2 font-semibold text-gray-700">
      📝 마크다운 문법 가이드
    </div>
    <div className="grid grid-cols-2 text-gray-600 gap-x-4 gap-y-2">
      <div>
        <code className="text-pink-600">**굵게**</code>
        <span className="mx-2">→</span>
        <strong>굵게</strong>
      </div>
      <div>
        <code className="text-pink-600">*기울임*</code>
        <span className="mx-2">→</span>
        <em>기울임</em>
      </div>
      <div>
        <code className="text-pink-600">~~취소선~~</code>
        <span className="mx-2">→</span>
        <del>취소선</del>
      </div>
      <div>
        <code className="text-pink-600">`코드`</code>
        <span className="mx-2">→</span>
        <code className="px-1 bg-gray-200 rounded">코드</code>
      </div>
      <div>
        <code className="text-pink-600">[링크](url)</code>
        <span className="mx-2">→</span>
        <span className="text-blue-600 underline">링크</span>
      </div>
      <div>
        <code className="text-pink-600"># 제목</code>
        <span className="mx-2">→</span>
        <span className="font-bold">제목</span>
      </div>
      <div>
        <code className="text-pink-600">- 리스트</code>
        <span className="mx-2">→</span>
        <span>• 리스트</span>
      </div>
      <div>
        <code className="text-pink-600">&gt; 인용</code>
        <span className="mx-2">→</span>
        <span className="pl-1 border-l-2 border-gray-400">인용</span>
      </div>
    </div>
        {/* 메시지 조작 가이드 추가 */}
        <div className="pt-3 mt-3 border-t border-gray-300">
          <div className="mb-2 font-semibold text-gray-700">
            💡 메시지 조작
          </div>
          <div className="space-y-1 text-gray-600">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">더블클릭:</span>
              <span>수정</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">2초간 누르기:</span>
              <span>삭제</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[80px]">마우스 호버:</span>
              <span>답장 버튼 표시</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 mt-2 text-gray-500 border-t border-gray-300">
          💡 줄바꿈: <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift + Enter</kbd>
        </div>
        <div className="mt-1 text-gray-500">
          💡 코드 블록: ``` 언어명 으로 시작하고 ``` 으로 끝내기
        </div>
      </div>
    )}

        <div className="mt-2 text-xs text-gray-500">
          Enter: 전송
        </div>
      </form>
    </div>
  );
}
