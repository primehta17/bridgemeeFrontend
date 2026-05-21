const API = 'https://bridgemeebackend.onrender.com/api';

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
let refreshPromise = null;

const setTokens = (payload) => {
  const accessToken = payload?.accessToken ?? payload?.token;
  const refreshToken = payload?.refreshToken;
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Unable to refresh session');
        setTokens(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export async function api(path, options = {}, retry = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && retry && getRefreshToken() && !path.startsWith('/auth/refresh')) {
    try {
      await refreshAccessToken();
      return api(path, options, false);
    } catch (err) {
      clearTokens();
      throw err;
    }
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

const toQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const authApi = {
  register: (body) => api('https://bridgemeebackend.onrender.com/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('https://bridgemeebackend.onrender.com/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api('https://bridgemeebackend.onrender.com/api/auth/logout', { method: 'POST' }),
  me: () => api('https://bridgemeebackend.onrender.com/api/auth/me'),
};

export const plansApi = {
  list: (params = {}) => api(`/plans${toQuery(params)}`),
  listPublic: () => fetch(`${API}/plans`).then((r) => r.json()),
  create: (body) => api('/plans', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => api(`/plans/${id}`, { method: 'DELETE' }),
};

export const subscriptionsApi = {
  me: () => api('/subscriptions/me'),
  mine: () => api('/subscriptions/me'),
  all: (params = {}) => api(`/subscriptions${toQuery(params)}`),
  subscribe: (planId, payment) =>
    api('/subscriptions', { method: 'POST', body: JSON.stringify({ planId, payment }) }),
  changePlan: (id, planId, payment) =>
    api(`/subscriptions/${id}/change-plan`, {
      method: 'PATCH',
      body: JSON.stringify({ planId, payment }),
    }),
  cancel: (id) => api(`/subscriptions/${id}/cancel`, { method: 'PATCH' }),
};

export const usersApi = {
  list: (params = {}) => api(`/users${toQuery(params)}`),
};

export const auditLogsApi = {
  list: (params = {}) => api(`/audit-logs${toQuery(params)}`),
};

export { setTokens };
