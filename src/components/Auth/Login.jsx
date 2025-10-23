import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
      // 로그인 성공
    } catch (err) {
      console.error('Google 로그인 에러:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('로그인 창이 닫혔습니다.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('로그인이 취소되었습니다.');
      } else {
        setError('Google 로그인 실패: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="p-8 bg-white shadow-2xl rounded-2xl w-96">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            대마챗
          </h2>
          <p className="text-gray-600">Google 계정으로 시작하세요</p>
        </div>

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 transition bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-lg font-semibold text-gray-700">
            {loading ? 'Google 로그인 중...' : 'Google로 로그인'}
          </span>
        </button>

        {error && (
          <div className="p-3 mt-4 text-sm text-center text-red-500 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <div className="mt-8 text-xs text-center text-gray-500">
          로그인하면 서비스 이용약관 및<br />5백만원을 주시게될겁니다.
        </div>
      </div>
    </div>
  );
}