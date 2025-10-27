import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
const MASTER_PASSWORD = import.meta.env.VITE_MASTER_PASSWORD;

export default function RoomList({ currentRoom, onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordCheckRoom, setPasswordCheckRoom] = useState(null);

  useEffect(() => {
    if (!MASTER_PASSWORD) {
      console.warn('⚠️ 마스터 패스워드가 설정되지 않았습니다!');
    }
    
    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = [];
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) return;

    try {
      await addDoc(collection(db, 'rooms'), {
        name: newRoomName,
        description: newRoomDescription,
        password: newRoomPassword.trim() || null,
        createdAt: new Date(),
      });

      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomPassword('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  const handleRoomSelect = async (room) => {
    if (room.password) {
      setPasswordCheckRoom(room);
    } else {
      onSelectRoom(room);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordInput.trim()) return;

    try {
      // 마스터 비밀번호 확인
      if (MASTER_PASSWORD && passwordInput === MASTER_PASSWORD) {
        const roomRef = doc(db, 'rooms', passwordCheckRoom.id);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
          onSelectRoom({ id: passwordCheckRoom.id, ...roomSnap.data() });
          setPasswordCheckRoom(null);
          setPasswordInput('');
          alert('🔑 마스터 비밀번호로 입장했습니다!');
        }
        return;
      }

      // 일반 비밀번호 확인
      const roomRef = doc(db, 'rooms', passwordCheckRoom.id);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        if (roomData.password === passwordInput) {
          onSelectRoom({ id: passwordCheckRoom.id, ...roomData });
          setPasswordCheckRoom(null);
          setPasswordInput('');
        } else {
          alert('비밀번호가 올바르지 않습니다.');
        }
      }
    } catch (err) {
      console.error('비밀번호 확인 중 오류:', err);
    }
  };

  return (
    <div className="flex flex-col w-64 text-white bg-gray-800">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">채팅방 list</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => handleRoomSelect(room)}
            className={`w-full text-left p-4 hover:bg-gray-700 transition border-b border-gray-700 ${
              currentRoom?.id === room.id ? 'bg-gray-700' : ''
            }`}
          >
            <div className="flex items-center justify-between text-lg font-semibold">
              <span># {room.name}</span>
              {room.password && <span className="text-sm text-red-400">🔒</span>}
            </div>
            {room.description && (
              <div className="text-sm text-gray-400 truncate">{room.description}</div>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-2 font-semibold transition bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + 채팅방 만들기
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 text-gray-800 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-xl font-bold">새 채팅방 만들기</h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">방 이름 *</label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="예: 일상 대화"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom(e)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">설명 (선택)</label>
                <input
                  type="text"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="예: 자유롭게 이야기해요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">비밀번호 (선택)</label>
                <input
                  type="password"
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  placeholder="입장 비밀번호 설정"
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
                    setNewRoomPassword('');
                  }}
                  className="flex-1 py-2 transition bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex-1 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {passwordCheckRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 text-gray-800 bg-white rounded-lg w-96">
            <h3 className="mb-4 text-xl font-bold">비밀번호 확인</h3>
            <p className="mb-4 text-sm text-gray-500">
              비밀번호를 입력하세요
            </p>

            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit(e)}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordCheckRoom(null);
                    setPasswordInput('');
                  }}
                  className="flex-1 py-2 transition bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  className="flex-1 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}