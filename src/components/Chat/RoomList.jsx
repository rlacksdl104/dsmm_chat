import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function RoomList({ currentRoom, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = [];
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomsData);

      // 첫 번째 방이 있고 현재 선택된 방이 없으면 자동 선택
      if (roomsData.length > 0 && !currentRoom) {
        onSelectRoom(roomsData[0]);
      }
    });

    return () => unsubscribe();
  }, [currentRoom, onSelectRoom]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) return;

    try {
      await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        description: newRoomDescription,
        createdAt: new Date(),
      });

      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col w-64 text-white bg-gray-800">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">채팅방 목록</h2>
      </div>

      {/* 방 목록 */}
      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className={`w-full text-left p-4 hover:bg-gray-700 transition border-b border-gray-700 ${
              currentRoom?.id === room.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="text-lg font-semibold"># {room.name}</div>
            {room.description && (
              <div className="text-sm text-gray-400 truncate">
                {room.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 방 만들기 버튼 */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-2 font-semibold transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + 채팅방 만들기
        </button>
      </div>

      {/* 방 만들기 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 text-gray-800 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-xl font-bold">새 채팅방 만들기</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  방 이름 *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="예: 일상 대화"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  설명 (선택)
                </label>
                <input
                  type="text"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="예: 자유롭게 이야기해요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRoomName('');
                    setNewRoomDescription('');
                  }}
                  className="flex-1 py-2 transition bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}