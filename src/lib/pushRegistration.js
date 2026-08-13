import { pushTokensApi } from "@/api/notificationsApi";
import { requestFcmToken } from "@/lib/firebase";

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

export async function registerPushToken(user) {
  try {
    if (!user || !user.id) return;
    //Su iOS le push funzionano solo se l'app è installata come PWA sulla home
    //(vedi CLAUDE.md): fuori da quel contesto Safari nega comunque il permesso,
    //quindi evitiamo di chiederlo per non mostrare un prompt inutile.
    if (isIos() && !isStandalone()) return;

    const token = await requestFcmToken();
    if (!token) return;

    //Il backend fa upsert su conflitto token (vedi backend/src/services/pushTokenService.js),
    //quindi non serve controllare duplicati lato client.
    await pushTokensApi.register({ token });
  } catch (e) {
    console.warn("Push registration failed:", e);
  }
}

export async function unregisterPushToken() {
  try {
    //Non richiede mai il permesso: se non è già "granted" non esiste un token da rimuovere.
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const token = await requestFcmToken();
    if (!token) return;
    await pushTokensApi.remove(token);
  } catch (e) {
    console.warn("Push unregistration failed:", e);
  }
}
