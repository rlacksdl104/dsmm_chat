import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function MessageInput({ replyTo, onCancelReply, roomId }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (replyTo) {
      console.log('답장 모드 활성화 - 포커스 시도');
      const focusResult = inputRef.current?.focus();
      
      setTimeout(() => {
        if (document.activeElement !== inputRef.current) {
          console.error('❌ 포커스 실패: 입력창에 포커스되지 않음');
          console.log('현재 포커스된 요소:', document.activeElement);
        } else {
          console.log('✅ 포커스 성공: 입력창에 포커스됨');
        }
      }, 100);
    }
  }, [replyTo]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !roomId) return;

    setSending(true);

    try {
      const messageData = {
        text: message,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        roomId: roomId,
        createdAt: serverTimestamp(),
      };

      if (replyTo) {
        messageData.replyTo = {
          id: replyTo.id,
          text: replyTo.text,
          userEmail: replyTo.userEmail,
        };
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      setMessage('');
      onCancelReply();
      
      console.log('메시지 전송 완료 - 포커스 시도');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
      
      setTimeout(() => {
        inputRef.current?.focus();
        
        if (document.activeElement === inputRef.current) {
          console.log('✅ 전송 후 포커스 성공');
        } else {
          console.error('❌ 전송 후 포커스 실패');
          console.log('현재 포커스된 요소:', document.activeElement);
          console.log('inputRef:', inputRef.current);
        }
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

      <form onSubmit={handleSend} className="p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyTo ? "답장을 입력하세요..." : "메시지를 입력하세요..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending || !roomId}
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !message.trim() || !roomId}
            className="px-6 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '전송 중...' : '전송'}
          </button>
        </div>
      </form>
    </div>
  );
}