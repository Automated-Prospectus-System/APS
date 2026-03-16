/* ============================================================
   APES App Utilities v2.0 (non-module, loaded globally)
   ============================================================ */

// ── Theme ─────────────────────────────────────────────────────
function updateThemeButton() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  btn.innerHTML = theme === 'dark' ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
}

function ensureThemeToggle() {
  if (document.querySelector('.theme-toggle')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.title = 'Toggle light / dark mode';
  btn.addEventListener('click', toggleTheme);
  document.body.appendChild(btn);
  updateThemeButton();
}

function initTheme() {
  const saved = localStorage.getItem('aps_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  ensureThemeToggle();
  updateThemeButton();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('aps_theme', next);
  updateThemeButton();
}

// ── Sidebar ────────────────────────────────────────────────────
function initSidebar() {
  const sidebar    = document.getElementById('sidebar');
  const hamburger  = document.getElementById('hamburger');
  const overlay    = document.getElementById('sidebar-overlay');
  if (!sidebar) return;

  if (hamburger) hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  });
  if (overlay) overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });

  // Active link
  const path = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Theme toggle
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    const t = localStorage.getItem('apes_theme') || 'dark';
    themeBtn.innerHTML = t === 'dark' ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
    themeBtn.addEventListener('click', toggleTheme);
  }
}

// ── User chip ─────────────────────────────────────────────────
function initUserChip() {
  const user = JSON.parse(localStorage.getItem('apes_user') || 'null');
  if (!user) return;

  const chip   = document.getElementById('user-chip');
  const avatar = document.getElementById('user-avatar');
  const uname  = document.getElementById('user-name');
  const urole  = document.getElementById('user-role');

  if (uname)  uname.textContent  = user.full_name || user.email;
  if (urole)  urole.textContent  = user.role || 'student';
  if (avatar && user.profile_photo_url) {
    avatar.innerHTML = `<img src="${user.profile_photo_url}" alt="avatar">`;
  } else if (avatar) {
    avatar.textContent = (user.full_name || 'U')[0].toUpperCase();
  }

  // Hide admin links if not admin
  if (user.role !== 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
}

// ── Notifications dot ─────────────────────────────────────────
async function loadNotifBadge() {
  const token = localStorage.getItem('apes_token');
  if (!token) return;
  try {
    const res  = await fetch('/api/users/notifications', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.unread_count > 0) {
      const badge = document.getElementById('notif-badge');
      if (badge) badge.textContent = data.unread_count > 9 ? '9+' : data.unread_count;
    }
  } catch {}
}

// ── Toast Notifications ───────────────────────────────────────
function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const colors = { success: '#3fb950', error: '#f87171', warning: '#f97316', info: '#58a6ff' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="fa ${icons[type]}" style="color:${colors[type]};flex-shrink:0"></i><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.remove(); }, 4200);
}
window.toast = toast;

// ── Modal helpers ─────────────────────────────────────────────
function openModal(id)  { const el = document.getElementById(id); if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeModal(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); document.body.style.overflow = ''; } }
window.openModal  = openModal;
window.closeModal = closeModal;

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
  if (e.target.classList.contains('modal-close'))   closeModal(e.target.closest('.modal-overlay')?.id);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
});

// ── Tabs ──────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panelContainer = tabGroup.nextElementSibling || tabGroup.closest('.card');
        if (panelContainer) {
          panelContainer.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
          const panel = document.getElementById(target);
          if (panel) panel.classList.add('active');
        }
      });
    });
  });
}

// ── Guard (redirect if not logged in) ────────────────────────
function requireLogin() {
  const token = localStorage.getItem('apes_token');
  if (!token) { window.location.href = '/login.html'; return false; }
  return true;
}
window.requireLogin = requireLogin;

// ── Grade badge HTML ──────────────────────────────────────────
function gradeBadgeHTML(grade) {
  const g = grade || '?';
  return `<span class="grade-badge grade-${g.replace('*','-star')}">${g}</span>`;
}
window.gradeBadgeHTML = gradeBadgeHTML;

// ── Qualification badge ───────────────────────────────────────
function qualBadge(type) {
  const map = { degree: 'badge-degree', diploma: 'badge-diploma', certificate: 'badge-certificate', honours: 'badge-honours' };
  return `<span class="badge ${map[type] || ''}">${type}</span>`;
}
window.qualBadge = qualBadge;

// ── Institution badge ─────────────────────────────────────────
function instBadge(id) {
  const map = { NUL: 'badge-nul', LP: 'badge-lp', BU: 'badge-bu' };
  return `<span class="badge ${map[id] || ''}">${id}</span>`;
}
window.instBadge = instBadge;

// ── Flag HTML ─────────────────────────────────────────────────
function flagHTML(flag) {
  const typeMap = {
    GATEWAY:      { cls: 'flag-gateway', icon: 'fa-route',            label: 'Gateway Programme' },
    PORTFOLIO:    { cls: 'flag-warning', icon: 'fa-paint-brush',      label: 'Portfolio Required' },
    RPL:          { cls: 'flag-info',    icon: 'fa-graduation-cap',   label: 'RPL Available' },
    NMDS_WARNING: { cls: 'flag-warning', icon: 'fa-exclamation-triangle', label: 'NMDS Warning' },
    ODL:          { cls: 'flag-info',    icon: 'fa-laptop',           label: 'ODL / Distance' },
    INDIRECT_ENTRY:{ cls: 'flag-info',   icon: 'fa-info-circle',      label: 'Indirect Entry' },
    CONDITIONAL:  { cls: 'flag-warning', icon: 'fa-sliders-h',        label: 'Conditional Requirement' },
    RANKING:      { cls: 'flag-info',    icon: 'fa-sort-amount-up',   label: 'Ranking Subjects' },
    MULTI_QUAL:   { cls: 'flag-info',    icon: 'fa-globe',            label: 'Multi-Qualification' }
  };
  const config = typeMap[flag.type] || { cls: 'flag-info', icon: 'fa-info-circle', label: flag.type };
  return `<div class="flag ${config.cls}">
    <i class="fa ${config.icon} flag-icon"></i>
    <div><strong>${config.label}:</strong> ${flag.message}</div>
  </div>`;
}
window.flagHTML = flagHTML;

// ── APS display ───────────────────────────────────────────────
function apsRingHTML(aps, max) {
  if (aps === null || aps === undefined) return '';
  const pct  = max ? (aps / max) : 0;
  const cls  = pct <= 0.6 ? 'good' : pct <= 0.85 ? 'mid' : 'high';
  return `<div class="aps-ring ${cls}"><span class="aps-value">${aps}</span><span class="aps-label">APS / ${max || '—'}</span></div>`;
}
window.apsRingHTML = apsRingHTML;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initUserChip();
  loadNotifBadge();
  initTabs();
});
