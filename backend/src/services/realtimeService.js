import { EventEmitter } from "node:events";

//Bus in-process per il realtime SSE. Va bene finché il backend gira su una singola
//istanza Node (vedi design doc, sezione 4); se in futuro si scala su più istanze
//andrà sostituito con un pub/sub condiviso (es. Redis).
export const realtimeBus = new EventEmitter();
realtimeBus.setMaxListeners(0);

export function publishAdminEvent(event) {
  realtimeBus.emit("admin", event);
}

export function publishUserNotification(userId, event) {
  realtimeBus.emit(`notifications:${userId}`, event);
}
