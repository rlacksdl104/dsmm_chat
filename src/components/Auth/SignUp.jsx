import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function SignUp({ onToggle }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호가 너무 약합니다.');
      } else {
        setError('회원가입 실패: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google 회원가입 에러:', err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('회원가입 창이 닫혔습니다.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('회원가입이 취소되었습니다.');
      } else {
        setError('Google 회원가입 실패: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="p-8 bg-white shadow-2xl rounded-2xl w-96">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          회원가입
        </h2>

        {/* Google 회원가입 버튼 */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 mb-4 transition bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span className="font-medium text-gray-700">
            {loading ? 'Google 회원가입 중...' : 'Google로 시작하기'}
          </span>
        </button>

        {/* 구분선 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">또는</span>
          </div>
        </div>

        {/* 이메일 회원가입 폼 */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="최소 6자 이상"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="비밀번호 재입력"
              required
            />
          </div>

          {error && (
            <div className="p-2 text-sm text-center text-red-500 rounded bg-red-50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition bg-purple-500 rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '이메일로 회원가입'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={onToggle}
            className="font-medium text-purple-500 hover:underline"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}