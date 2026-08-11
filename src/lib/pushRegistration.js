import { pushTokensApi } from "@/api/notificationsApi";
import { requestFcmToken } from "@/lib/firebase";

export async function registerPushToken(user) {
  try {
    if (!user || !user.id) return;
    const token = await requestFcmToken();
    if (!token) return;

    //Il backend fa upsert su conflitto token (vedi backend/src/services/pushTokenService.js),
    //quindi non serve controllare duplicati lato client.
    await pushTokensApi.register({ token });
  } catch (e) {
    console.warn("Push registration failed:", e);
  }
}
