import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { auth } from '../../firebase/config';

export default function ChatRoom() {
  const [replyTo, setReplyTo] = useState(null);

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 상단 헤더 - 고정 */}
      <div className="z-10 flex items-center justify-between flex-shrink-0 p-4 bg-white shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">실시간 채팅</h1>
          <p className="text-sm text-gray-500">{auth.currentUser.email}</p>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>

      {/* 채팅 영역 - 가운데 스크롤 */}
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto overflow-hidden bg-white shadow-lg">
        <MessageList onReply={handleReply} />
        
        {/* 하단 입력창 - 고정 */}
        <div className="flex-shrink-0">
          <MessageInput replyTo={replyTo} onCancelReply={handleCancelReply} />
        </div>
      </div>
    </div>
  );
}