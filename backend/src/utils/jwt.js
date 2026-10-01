import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const accessMs = 15 * 60 * 1000;
const refreshMs = 7 * 24 * 60 * 60 * 1000;

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(user) {
  const jti = crypto.randomBytes(16).toString('hex');
  const token = jwt.sign(
    { sub: user._id.toString(), jti },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { token, jti };
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, { ...cookieBase(), maxAge: accessMs });
  res.cookie('refreshToken', refreshToken, { ...cookieBase(), maxAge: refreshMs });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', cookieBase());
  res.clearCookie('refreshToken', cookieBase());
}
