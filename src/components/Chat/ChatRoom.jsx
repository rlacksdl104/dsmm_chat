import { useState } from 'react';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MyPage from '../Profile/MyPage';
import AdminPanel from '../Admin/AdminPanel';
import { auth } from '../../firebase/config';

// 관리자 이메일 목록
const ADMIN_EMAILS = [
  'your-admin@email.com',  // 본인 이메일로 변경!
];

export default function ChatRoom() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showMyPage, setShowMyPage] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleReply = (message) => {
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    setReplyTo(null);
  };

  // 현재 사용자가 관리자인지 확인
  const isAdmin = ADMIN_EMAILS.includes(auth.currentUser.email);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 최상단 헤더 */}
      <div className="flex-shrink-0 text-white shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💬</div>
            <div>
              <h1 className="text-2xl font-bold">Dechat</h1>
              <p className="text-sm text-blue-100">실시간 채팅 플랫폼</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 사용자 정보 */}
            <div className="mr-2 text-right">
              <div className="text-sm font-semibold">
                {auth.currentUser.displayName || auth.currentUser.email.split('@')[0]}
                {isAdmin && <span className="ml-1 text-yellow-300">👑</span>}
              </div>
              <div className="text-xs text-blue-100">
                {auth.currentUser.email}
              </div>
            </div>
            
            {/* 관리자 패널 버튼 (관리자만 보임) */}
            {isAdmin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="px-4 py-2 font-medium transition bg-yellow-500 rounded-lg hover:bg-yellow-600"
                title="관리자 패널"
              >
                🔧 관리자
              </button>
            )}
            
            {/* 마이페이지 버튼 */}
            <button
              onClick={() => setShowMyPage(true)}
              className="px-4 py-2 font-medium transition bg-white rounded-lg bg-opacity-20 hover:bg-opacity-30"
            >
              마이페이지
            </button>
            
            {/* 로그아웃 버튼 */}
            <button
              onClick={() => auth.signOut()}
              className="px-4 py-2 font-medium transition bg-red-500 rounded-lg hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">
        <RoomList currentRoom={currentRoom} onSelectRoom={handleSelectRoom} />

        <div className="flex flex-col flex-1">
          <div className="flex-shrink-0 p-4 bg-white border-b shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {currentRoom ? `# ${currentRoom.name}` : '채팅방을 선택해주세요'}
              </h2>
              {currentRoom?.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {currentRoom.description}
                </p>
              )}
            </div>
          </div>

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

      {/* 마이페이지 모달 */}
      {showMyPage && <MyPage onClose={() => setShowMyPage(false)} />}

      {/* 관리자 패널 모달 */}
      {showAdminPanel && isAdmin && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}