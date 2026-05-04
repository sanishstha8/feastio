
const BASE = '/api';

const TokenStorage = {
  getAccess:  () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (a, r) => { localStorage.setItem('access_token', a); localStorage.setItem('refresh_token', r); },
  clear: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); },
};

async function request(method, path, body = null, retry = true) {
  const headers = { 'Content-Type': 'application/json' };
  const token = TokenStorage.getAccess();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res = await fetch(BASE + path, opts);

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refresh = TokenStorage.getRefresh();
    if (!refresh) { TokenStorage.clear(); showPage('landing'); return null; }
    const rRes = await fetch(BASE + '/auth/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!rRes.ok) { TokenStorage.clear(); showPage('landing'); return null; }
    const rData = await rRes.json();
    TokenStorage.set(rData.access, TokenStorage.getRefresh());
    return request(method, path, body, false);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};
