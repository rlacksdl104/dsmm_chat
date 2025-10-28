import { useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function AdminPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecentMessages = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      
      setMessages(messagesData);
    } catch (error) {
      console.error('메시지 로딩 실패:', error);
      alert('메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 text-white border-b bg-gradient-to-r from-purple-600 to-blue-600">
          <h2 className="text-xl font-bold">🔧 관리자 패널</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-white transition rounded-full hover:bg-white hover:bg-opacity-20"
          >
            ✕
          </button>
        </div>

        {/* 컨트롤 */}
        <div className="p-4 border-b bg-gray-50">
          <button
            onClick={loadRecentMessages}
            disabled={loading}
            className="px-4 py-2 text-white transition bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '로딩 중...' : '최근 메시지 50개 불러오기'}
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              "최근 메시지 불러오기" 버튼을 클릭하세요
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold">
                        {msg.displayName || msg.userEmail}
                      </div>
                      <div className="text-xs text-gray-500">
                        📧 {msg.userEmail}
                      </div>
                      <div className="font-mono text-xs text-gray-500">
                        🔑 UID: {msg.userId}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {msg.createdAt?.toDate().toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="p-2 text-sm text-gray-700 bg-white rounded">
                    {msg.text}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Room: {msg.roomId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}