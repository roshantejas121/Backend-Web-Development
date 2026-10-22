const bcrypt = require('bcryptjs');
const express = require('express');
const requireSession = require('../middleware/requireSession');
const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const { cookieOptions, clearCookieOptions } = require('../config');

const router = express.Router();

function invalidCredentials(res) {
  return res.status(401).json({
    error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
  });
}

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return invalidCredentials(res);

    const user = await userRepository.findByEmail(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!passwordMatches) return invalidCredentials(res);

    const session = sessionStore.create(user.id);
    res.cookie('sid', session.id, cookieOptions());
    return res.status(200).json({ data: userRepository.toPublicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  res.status(200).json({ data: req.user });
});

router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (sessionId && sessionId !== false) sessionStore.destroy(sessionId);
    res.clearCookie('sid', clearCookieOptions());
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
