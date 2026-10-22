const crypto = require('node:crypto');

const sessions = new Map();

function sessionTtlMs() {
  const ttl = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : 60 * 60 * 1000;
}

function removeExpired(now = Date.now()) {
  for (const [sessionId, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(sessionId);
  }
}

function create(userId) {
  removeExpired();
  const sessionId = crypto.randomUUID();
  const session = { userId, expiresAt: Date.now() + sessionTtlMs() };
  sessions.set(sessionId, session);
  return { id: sessionId, ...session };
}

function get(sessionId) {
  if (typeof sessionId !== 'string' || sessionId.length === 0) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return { ...session };
}

function destroy(sessionId) {
  if (typeof sessionId === 'string' && sessionId.length > 0) sessions.delete(sessionId);
}

module.exports = { create, get, destroy };
