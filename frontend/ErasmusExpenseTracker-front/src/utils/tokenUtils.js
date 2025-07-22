// src/utils/tokenUtils.js

export function parseJwt(token) {
  if (!token) return {};
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error("Invalid JWT:", e);
    return {};
  }
}
