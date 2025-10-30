import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContexts';
import RoomList from './RoomList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MyPage from '../Profile/MyPage';
import { auth } from '../../firebase/config';

export default function ChatRoom() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [showMyPage, setShowMyPage] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* 최상단 헤더 */}
      <div className={`flex-shrink-0 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
      }`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${
                isDark ? 'hover:text-blue-400' : 'hover:text-yellow-300'
              }`}
              title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              💬
            </button>
            <div>
              <h1 className="text-2xl font-bold">Dechat</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-100'}`}>
                실시간 채팅 플랫폼
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 사용자 정보 */}
            <div className="mr-2 text-right">
              <div className="text-sm font-semibold">
                {auth.currentUser.displayName || auth.currentUser.email.split('@')[0]}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-blue-100'}`}>
                {auth.currentUser.email}
              </div>
            </div>
            
            {/* 테마 토글 버튼 */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 rounded-lg transition ${
                isDark
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                  : 'bg-gray-800 hover:bg-gray-900 text-white'
              }`}
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {/* 마이페이지 버튼 */}
            <button
              onClick={() => setShowMyPage(true)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30'
              }`}
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
          {/* 채팅방 정보 헤더 */}
          <div className={`flex-shrink-0 shadow-sm p-4 border-b ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {currentRoom ? `# ${currentRoom.name}` : '채팅방을 선택해주세요'}
              </h2>
              {currentRoom?.description && (
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentRoom.description}
                </p>
              )}
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className={`flex-1 flex flex-col overflow-hidden ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}>
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
    </div>
  );
}