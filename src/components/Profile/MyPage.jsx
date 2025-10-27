import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function MyPage({ onClose }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setDisplayName(data.displayName || '');
        setBio(data.bio || '');
      } else {
        // 기본값 설정
        setDisplayName(auth.currentUser.email.split('@')[0]);
      }
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    console.log('현재 유저:', auth.currentUser);
    e.preventDefault();
    
    if (!displayName.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      // Firebase Auth 프로필 업데이트
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });

      // Firestore에 추가 정보 저장
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        email: auth.currentUser.email,
        updatedAt: new Date(),
      }, { merge: true });

      alert('프로필이 저장되었습니다!');
      onClose();
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="p-8 bg-white rounded-lg">
          <div className="text-gray-600">프로필 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">마이페이지</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 프로필 이미지 영역 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-24 h-24 mb-3 text-3xl font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
              {displayName.charAt(0).toUpperCase() || '?'}
            </div>
            <p className="text-sm text-gray-500">{auth.currentUser.email}</p>
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              닉네임 *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={20}
            />
            <p className="mt-1 text-xs text-gray-500">
              {displayName.length}/20
            </p>
          </div>

          {/* 소개 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해보세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              {bio.length}/100
            </p>
          </div>

          {/* 계정 정보 */}
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">계정 정보</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>이메일: {auth.currentUser.email}</p>
              <p>가입일: {auth.currentUser.metadata.creationTime}</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 transition bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}