import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { auth } from '../../firebase/config';

export default function ChatRoom() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 bg-white shadow-md">
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

      {/* 채팅 영역 */}
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto bg-white shadow-lg">
        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
}