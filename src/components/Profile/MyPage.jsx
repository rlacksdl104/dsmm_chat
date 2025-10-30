import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useTheme } from '../../contexts/ThemeContexts';

export default function MyPage({ onClose }) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isDark } = useTheme();

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
        setDisplayName(auth.currentUser.email.split('@')[0]);
      }
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });

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
        <div className={`rounded-lg p-8 ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <div>프로필 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            마이페이지
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl leading-none ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-20 h-20 mb-2 text-2xl font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
              {displayName.charAt(0).toUpperCase() || '?'}
            </div>
            <p className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {auth.currentUser.email}
            </p>
          </div>

          {/* 닉네임 */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              닉네임 *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className={`w-full px-3 py-2 text-sm border rounded-lg ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500 focus:ring-blue-500'
              } focus:ring-2 focus:border-transparent`}
              required
              maxLength={20}
            />
            <p className={`text-xs mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {displayName.length}/20
            </p>
          </div>

          {/* 소개 */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해보세요"
              className={`w-full px-3 py-2 text-sm border rounded-lg resize-none ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:ring-blue-500'
                  : 'bg-white text-gray-800 border-gray-300 placeholder-gray-500 focus:ring-blue-500'
              } focus:ring-2 focus:border-transparent`}
              rows={2}
              maxLength={100}
            />
            <p className={`text-xs mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {bio.length}/100
            </p>
          </div>

          {/* 계정 정보 */}
          <div className={`rounded-lg p-3 ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              계정 정보
            </h3>
            <div className={`text-xs space-y-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <p>이메일: {auth.currentUser.email}</p>
              <p>가입일: {new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('ko-KR')}</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 text-sm rounded-lg transition ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 text-sm text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}