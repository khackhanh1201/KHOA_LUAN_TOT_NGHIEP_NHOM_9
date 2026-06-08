import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Nhớ thay đoạn config này bằng thông tin lấy từ Firebase Console của nhóm
const firebaseConfig = {
  apiKey: "AIzaSyC_vQoYK_j7-xKAzmwz6aat1mIO_RjB06Y",
  authDomain: "app-vneid.firebaseapp.com",
  databaseURL: "https://app-vneid-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "app-vneid",
  storageBucket: "app-vneid.firebasestorage.app",
  messagingSenderId: "862735539088",
  appId: "1:862735539088:web:a65367f6b1667a2817b115",
  measurementId: "G-BEW1Z70GWR"
};


const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);