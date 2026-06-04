const SESSION_KEY = 'sk_admin_token';
const EXPIRES_KEY = 'sk_admin_expires';
const ROLE_KEY = 'sk_admin_role';

export const setAdminSession = (token, expiresInSec = 28800, role = 'admin') => {
  sessionStorage.setItem(SESSION_KEY, token);
  sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresInSec * 1000));
  sessionStorage.setItem(ROLE_KEY, role === 'diagnostics' ? 'diagnostics' : 'admin');
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

export const getAdminRole = () => {
  if (!getAdminToken()) return null;
  return sessionStorage.getItem(ROLE_KEY) === 'diagnostics' ? 'diagnostics' : 'admin';
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
  sessionStorage.removeItem(ROLE_KEY);
};

export const isAdminSessionValid = () => !!getAdminToken();

export const isHospitalAdmin = () => getAdminRole() === 'admin';
export const isDiagnosticsAdmin = () => getAdminRole() === 'diagnostics';
