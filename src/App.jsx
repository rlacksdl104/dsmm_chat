import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { ThemeProvider } from './contexts/ThemeContexts';
import Login from './components/Auth/Login';
import ChatRoom from './components/Chat/ChatRoom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-2xl text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {!user ? <Login /> : <ChatRoom />}
    </ThemeProvider>
  );
}

export default App;