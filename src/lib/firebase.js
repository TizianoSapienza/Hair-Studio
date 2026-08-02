import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD3XWHvDCL2p5UGNYxtOJxZZ1CLwYqEl9k",
  authDomain: "hair-studio-331f8.firebaseapp.com",
  projectId: "hair-studio-331f8",
  storageBucket: "hair-studio-331f8.firebasestorage.app",
  messagingSenderId: "492860802967",
  appId: "1:492860802967:web:d546403be8e0484ec4a6d2"
};

export const FCM_VAPID_KEY =
  "BB9-YrbESCfzJ2Ngvuw39wtjOSvY8O_Fd8-0ZqvTv9Zin3FxeSQ5otit9wnhiosL0imXgIe3EJ70kyGyoxMsj9w";

let _app = null;
let _messaging = null;

function getApp() {
  if (!_app) _app = initializeApp(firebaseConfig);
  return _app;
}

export async function getMessagingInstance() {
  try {
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