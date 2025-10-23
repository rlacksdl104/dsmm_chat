import { useState } from 'react';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { auth } from '../../firebase/config';

export default function ChatRoom() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    setReplyTo(null); // 방 변경 시 답장 초기화
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 왼쪽 사이드바 - 채팅방 목록 */}
      <RoomList currentRoom={currentRoom} onSelectRoom={handleSelectRoom} />

      {/* 오른쪽 채팅 영역 */}
      <div className="flex flex-col flex-1">
        {/* 상단 헤더 */}
        <div className="z-10 flex items-center justify-between flex-shrink-0 p-4 bg-white shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {currentRoom ? `# ${currentRoom.name}` : '💬 실시간 채팅'}
            </h1>
            <p className="text-sm text-gray-500">
              {currentRoom?.description || auth.currentUser.email}
            </p>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
          >
            로그아웃
          </button>
        </div>

        {/* 채팅 영역 */}
        <div className="flex flex-col flex-1 overflow-hidden bg-white">
          <MessageList onReply={handleReply} roomId={currentRoom?.id} />
          
          <div className="flex-shrink-0">
            <MessageInput 
              replyTo={replyTo} 
              onCancelReply={handleCancelReply}
              roomId={currentRoom?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}