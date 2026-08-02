import { base44 } from "@/api/base44Client";
import { requestFcmToken } from "@/lib/firebase";

export async function registerPushToken(user) {
  try {
    if (!user || !user.id) return;
    const token = await requestFcmToken();
    if (!token) return;

    // RLS restringe la lettura ai token dell'utente corrente: se il token
    // esiste già, evitiamo duplicati.
    const existing = await base44.entities.PushToken.filter({ token });
    if (existing && existing.length > 0) return;

    await base44.entities.PushToken.create({ user_id: user.id, token });
  } catch (e) {
    console.warn("Push registration failed:", e);
  }
}