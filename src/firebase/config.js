import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 아까 Firebase 콘솔에서 복사한 Config 정보를 여기에 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyAr2jCZZomMoxL6rtIrzikiOzxQdNVxHng",
  authDomain: "chat-daema.firebaseapp.com",
  projectId: "chat-daema",
  storageBucket: "chat-daema.firebasestorage.app",
  messagingSenderId: "108316131533",
  appId: "1:108316131533:web:030f1deae5162db8bc2984"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Auth와 Firestore 인스턴스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);