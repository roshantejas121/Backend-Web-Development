# Session Authentication with Express and Prisma

This project demonstrates stateful authentication with a signed, `httpOnly` cookie that contains only an opaque session ID. The session ID maps to `{ userId, expiresAt }` in a server-side store; identity is never trusted directly from cookie contents.

## Setup

```bash
cp .env.example .env
# Replace COOKIE_SECRET with a long random value (32+ characters).
npm install
npm run setup
npm start
```

The seeded demo account is `sam@example.com` / `SessionDemo!48`.

For local HTTP, keep `COOKIE_SECURE=false`. Set `COOKIE_SECURE=true` only when serving over HTTPS in production. Never commit `.env` or real signing secrets.

## Endpoints

- `POST /auth/login` accepts `{ "email": "sam@example.com", "password": "SessionDemo!48" }`, verifies the password asynchronously with bcrypt, creates a server-side session, and returns safe user fields.
- `GET /auth/me` resolves the signed `sid` cookie, checks the live server session and user, and returns the safe identity.
- `POST /auth/logout` destroys the server-side session and clears the cookie. It is safe to repeat.

Invalid, missing, altered, expired, and orphaned sessions all return the same `401 AUTH_REQUIRED` response. Login failures return the same generic `401 INVALID_CREDENTIALS` response for unknown accounts and wrong passwords.

## Verification with curl

Start the server in one terminal, then run:

```bash
curl -i -c cookies.txt \
  -H 'Content-Type: application/json' \
  -d '{"email":"sam@example.com","password":"SessionDemo!48"}' \
  http://localhost:3000/auth/login

curl -i -b cookies.txt http://localhost:3000/auth/me

curl -i -b cookies.txt -X POST http://localhost:3000/auth/logout

# The old cookie is now revoked and must return 401.
curl -i -b cookies.txt http://localhost:3000/auth/me
```

The login response should include `Set-Cookie: sid=...; Path=/; Max-Age=3600; HttpOnly; SameSite=Lax`. With `COOKIE_SECURE=true`, the cookie also includes `Secure`.

## Design notes

Cookie options are centralized in `src/config.js` so login and logout use the same path, signing, `httpOnly`, `SameSite`, and `Secure` policy. Prisma access is kept behind `src/repositories/userRepository.js`; session operations are kept behind `src/session/sessionStore.js`.

The supplied `Map` session store is intentionally suitable only for learning and local execution: process restarts erase sessions and multiple server instances do not share state. Production should use a shared expiring store such as Redis, together with HTTPS, CSRF protections appropriate to the client architecture, rate limiting, and secret rotation.
