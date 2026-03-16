/* ============================================================
   APS API Client v3.0
   ============================================================ */

const API_BASE = '/api';

export function getToken()  { return localStorage.getItem('aps_token'); }
export function setToken(t) { localStorage.setItem('aps_token', t); }
export function clearToken(){ localStorage.removeItem('aps_token'); localStorage.removeItem('aps_user'); }
export function getUser()   { try { return JSON.parse(localStorage.getItem('aps_user')); } catch { return null; } }
export function setUser(u)  { localStorage.setItem('aps_user', JSON.stringify(u)); }
export function isLoggedIn(){ return !!getToken(); }
export function isAdmin()   { return getUser()?.role === 'admin'; }

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body !== 'string') options.body = JSON.stringify(options.body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res  = await fetch(API_BASE + path, { ...options, headers, signal: controller.signal });
    const data = await res.json();
    if (res.status === 401) { clearToken(); window.location.href = '/login.html'; return null; }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Auth
export async function login(email, password) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
  if (data?.success) { setToken(data.token); setUser(data.user); }
  return data;
}
export async function register(payload) {
  const data = await apiFetch('/auth/register', { method: 'POST', body: payload });
  if (data?.success) { setToken(data.token); setUser(data.user); }
  return data;
}
export async function getMe() {
  const data = await apiFetch('/auth/me');
  if (data?.success) setUser(data.user);
  return data;
}
export function logout() { clearToken(); window.location.href = '/login.html'; }
export function googleLogin() { window.location.href = '/api/auth/google'; }
export async function forgotPassword(email) { return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } }); }
export async function resetPassword(token, password) { return apiFetch('/auth/reset-password', { method: 'POST', body: { token, password } }); }

// Eligibility
export async function checkEligibility(subjects, qualType = 'LGCSE', institutionFilter = null) {
  return apiFetch('/eligibility/check', { method: 'POST', body: { subjects, qual_type: qualType, institution_filter: institutionFilter } });
}
export async function getSession(token) { return apiFetch(`/eligibility/session/${token}`); }
export function getReportUrl(token) { return `${API_BASE}/eligibility/report/${token}`; }
export async function getRecommendations() { return apiFetch('/eligibility/recommendations'); }
export async function getEligibilityHistory() { return apiFetch('/eligibility/history'); }

// Institutions & Programmes
export async function getInstitutions() { return apiFetch('/institutions'); }
export async function getInstitution(id) { return apiFetch(`/institutions/${id}`); }
export async function getProgrammes(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/programmes${qs ? '?' + qs : ''}`);
}
export async function getProgramme(id) { return apiFetch(`/programmes/${id}`); }
export async function compareProgrammes(ids) { return apiFetch(`/programmes/compare?ids=${ids.join(',')}`); }
export async function getSubjects() { return apiFetch('/subjects'); }

// User
export async function getProfile() { return apiFetch('/users/profile'); }
export async function updateProfile(data) { return apiFetch('/users/profile', { method: 'PATCH', body: data }); }
export async function uploadPhoto(formData) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/users/profile/photo`, { method: 'POST', headers, body: formData });
  return res.json();
}
export async function changePassword(current, next) { return apiFetch('/users/change-password', { method: 'PATCH', body: { current_password: current, new_password: next } }); }
export async function getSavedProgrammes() { return apiFetch('/users/saved'); }
export async function saveProgramme(programmeId, notes = '') { return apiFetch(`/users/saved/${programmeId}`, { method: 'POST', body: { notes } }); }
export async function unsaveProgramme(programmeId) { return apiFetch(`/users/saved/${programmeId}`, { method: 'DELETE' }); }
export async function getDeadlines() { return apiFetch('/users/deadlines'); }
export async function addDeadline(data) { return apiFetch('/users/deadlines', { method: 'POST', body: data }); }
export async function deleteDeadline(id) { return apiFetch(`/users/deadlines/${id}`, { method: 'DELETE' }); }
export async function getNotifications() { return apiFetch('/users/notifications'); }
export async function markAllRead() { return apiFetch('/users/notifications/read-all', { method: 'PATCH' }); }
export async function getDashboardStats() { return apiFetch('/users/stats'); }

// Admin
export async function getAdminStats() { return apiFetch('/admin/stats'); }
export async function getAdminUsers(params = {}) { const qs = new URLSearchParams(params).toString(); return apiFetch(`/admin/users${qs ? '?' + qs : ''}`); }
export async function toggleUser(id) { return apiFetch(`/admin/users/${id}/toggle`, { method: 'PATCH' }); }

// Theme helpers
export function getTheme() { return localStorage.getItem('aps_theme') || 'dark'; }
export function setTheme(t) { localStorage.setItem('aps_theme', t); document.documentElement.dataset.theme = t; }

// Toast notifications
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:1rem">${icons[type]||'ℹ️'}</span><div class="toast-body"><div class="toast-title">${message}</div></div><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('leaving'); setTimeout(() => toast.remove(), 300); }, duration);
}


// Utilities
export function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function gradeColor(g) {
  return { 'A*': '#34d399', A: '#4ade80', B: '#60a5fa', C: '#a5b4fc', D: '#fbbf24', E: '#fb923c', F: '#f87171', G: '#ef4444' }[g] || '#64748b';
}
export function gradeClass(g) {
  return { 'A*': 'grade-Astar', A: 'grade-A', B: 'grade-B', C: 'grade-C', D: 'grade-D', E: 'grade-E', F: 'grade-F', G: 'grade-G' }[g] || '';
}
