const SESSION_KEY = 'sk_admin_token';
const EXPIRES_KEY = 'sk_admin_expires';

export const setAdminSession = (token, expiresInSec = 28800) => {
  sessionStorage.setItem(SESSION_KEY, token);
  sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresInSec * 1000));
};

export const getAdminToken = () => {
  const token = sessionStorage.getItem(SESSION_KEY);
  const exp = Number(sessionStorage.getItem(EXPIRES_KEY) || 0);
  if (!token || Date.now() > exp) {
    clearAdminSession();
    return null;
  }
  return token;
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
};

export const isAdminSessionValid = () => !!getAdminToken();
