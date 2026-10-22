const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');

function reject(res) {
  return res.status(401).json({
    error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
  });
}

module.exports = async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (!sessionId || sessionId === false) return reject(res);

    const session = sessionStore.get(sessionId);
    if (!session) return reject(res);

    const user = await userRepository.findPublicById(session.userId);
    if (!user) {
      sessionStore.destroy(sessionId);
      return reject(res);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
