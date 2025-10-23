import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

export default function MessageInput({ replyTo, onCancelReply }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setSending(true);

    try {
      const messageData = {
        text: message,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      };

      // 답장 정보 추가
      if (replyTo) {
        messageData.replyTo = {
          id: replyTo.id,
          text: replyTo.text,
          userEmail: replyTo.userEmail,
        };
      }

      await addDoc(collection(db, 'messages'), messageData);
      
      setMessage('');
      onCancelReply(); // 답장 취소
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border-t">
      {/* 답장 미리보기 */}
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

      {/* 입력창 */}
      <form onSubmit={handleSend} className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyTo ? "답장을 입력하세요..." : "메시지를 입력하세요..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-6 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '전송 중...' : '전송'}
          </button>
        </div>
      </form>
    </div>
  );
}