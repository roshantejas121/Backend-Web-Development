function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge: Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000),
  };
}

function clearCookieOptions() {
  const { maxAge, ...options } = cookieOptions();
  return options;
}

module.exports = { cookieOptions, clearCookieOptions };
