import { randomBytes, createHash } from "node:crypto";

export function generateOpaqueToken() {
  return randomBytes(48).toString("hex");
}

export function hashOpaqueToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
