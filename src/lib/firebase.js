import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FCM_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let _app = null;
let _messaging = null;

function getApp() {
  if (!_app) _app = initializeApp(firebaseConfig);
  return _app;
}

export async function getMessagingInstance() {
  try {
    if (!firebaseConfig.apiKey || !FCM_VAPID_KEY) return null;
    const supported = await isSupported();
    if (!supported) return null;
    if (!_messaging) _messaging = getMessaging(getApp());
    return _messaging;
  } catch (e) {
    return null;
  }
}

export async function requestFcmToken() {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    if (typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return null;
      } else if (Notification.permission !== "granted") {
        return null;
      }
    }

    const token = await getToken(messaging, { vapidKey: FCM_VAPID_KEY });
    return token || null;
  } catch (e) {
    console.warn("FCM token error:", e);
    return null;
  }
}