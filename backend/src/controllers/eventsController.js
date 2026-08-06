import { realtimeBus } from "../services/realtimeService.js";
import { deepCamelCase } from "../utils/caseConvert.js";

function startSse(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(":ok\n\n");

  // keep-alive: alcuni reverse proxy chiudono connessioni idle prima dei timeout applicativi.
  const heartbeat = setInterval(() => res.write(":heartbeat\n\n"), 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
  });

  return heartbeat;
}

function sendEvent(res, event) {
  res.write(`data: ${JSON.stringify(deepCamelCase(event))}\n\n`);
}

export function adminEventsStream(req, res) {
  startSse(req, res);
  const listener = (event) => sendEvent(res, event);
  realtimeBus.on("admin", listener);
  req.on("close", () => realtimeBus.off("admin", listener));
}

export function notificationsStream(req, res) {
  startSse(req, res);
  const channel = `notifications:${req.user.id}`;
  const listener = (event) => sendEvent(res, event);
  realtimeBus.on(channel, listener);
  req.on("close", () => realtimeBus.off(channel, listener));
}
