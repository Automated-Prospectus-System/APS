/* ============================================================
   APS Features Module v1.0
   Advanced: notifications, command palette, keyboard shortcuts,
             offline detection, theme transitions, PWA prompt
   ============================================================ */

import { apiFetch, isLoggedIn, getTheme, setTheme, isAdmin } from '/assets/js/api.js';

// ── Time helper ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Feature 6: In-app Notification Panel ─────────────────────
export function initNotificationPanel() {
  if (!isLoggedIn()) return;
  const sidebarBottom = document.querySelector('.sidebar-bottom');
  if (!sidebarBottom) return;

  // Bell button (inserted above user chip)
  const bell = document.createElement('button');
  bell.id = 'notif-bell';
  bell.className = 'notif-bell-btn';
  bell.title = 'Notifications (N)';
  bell.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    <span style="flex:1;font-size:.82rem;font-weight:600;text-align:left">Notifications</span>
    <span class="notif-bell-count hidden" id="bellCount">0</span>`;
  const userChip = sidebarBottom.querySelector('.user-chip');
  sidebarBottom.insertBefore(bell, userChip || null);

  // Slide-out panel
  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.className = 'notif-panel';
  panel.innerHTML = `
    <div class="notif-panel-head">
      <span class="notif-panel-title">Notifications</span>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-ghost btn-sm" id="markAllReadBtn" style="font-size:.72rem;padding:5px 10px">Mark all read</button>
        <button class="modal-x" id="closeNotifPanel">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div id="notif-list" class="notif-list">
      <div class="loader-wrap" style="padding:30px"><div class="loader loader-sm"></div></div>
    </div>`;
  document.body.appendChild(panel);

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'notif-backdrop';
  backdrop.className = 'notif-backdrop';
  document.body.appendChild(backdrop);

  let isOpen = false;
  function openPanel()  { panel.classList.add('open'); backdrop.classList.add('show'); isOpen = true; loadNotifs(); }
  function closePanel() { panel.classList.remove('open'); backdrop.classList.remove('show'); isOpen = false; }

  bell.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  backdrop.addEventListener('click', closePanel);
  document.getElementById('closeNotifPanel').addEventListener('click', closePanel);

  document.getElementById('markAllReadBtn').addEventListener('click', async () => {
    await apiFetch('/users/notifications/read-all', { method: 'PATCH' });
    document.getElementById('bellCount').classList.add('hidden');
    loadNotifs();
  });

  // Load badge count silently
  apiFetch('/users/notifications').then(d => {
    if (d?.unread_count > 0) {
      const c = document.getElementById('bellCount');
      if (c) { c.textContent = d.unread_count > 9 ? '9+' : d.unread_count; c.classList.remove('hidden'); }
    }
  }).catch(() => {});

  async function loadNotifs() {
    const list = document.getElementById('notif-list');
    list.innerHTML = '<div class="loader-wrap" style="padding:30px"><div class="loader loader-sm"></div></div>';
    try {
      const d = await apiFetch('/users/notifications');
      if (!d?.data?.length) { list.innerHTML = '<div class="notif-empty">No notifications yet.</div>'; return; }
      list.innerHTML = d.data.map(n => `
        <div class="notif-item${n.is_read ? '' : ' unread'}" ${n.link ? `onclick="location.href='${n.link}'"` : ''} style="${n.link ? 'cursor:pointer' : ''}">
          <div class="notif-dot-wrap"><div class="notif-dot ${n.type || 'info'}"></div></div>
          <div class="notif-content">
            <div class="notif-title">${n.title}</div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${timeAgo(n.created_at)}</div>
          </div>
        </div>`).join('');
      const cnt = document.getElementById('bellCount');
      if (cnt) cnt.classList.add('hidden');
    } catch { list.innerHTML = '<div class="notif-empty">Could not load notifications.</div>'; }
  }

  // Keyboard shortcut N
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === 'n' || e.key === 'N')) {
      isOpen ? closePanel() : openPanel();
    }
  });
}

// ── Feature 10: Command Palette (Ctrl+K) ─────────────────────
export function initCommandPalette() {
  const baseCommands = [
    { label: 'Check Eligibility',    icon: '✓',  action: () => location.href = '/eligibility.html' },
    { label: 'Browse Programmes',    icon: '📚', action: () => location.href = '/programmes.html' },
    { label: 'My Results',           icon: '📊', action: () => location.href = '/results.html' },
    { label: 'Dashboard',            icon: '🏠', action: () => location.href = '/dashboard.html' },
    { label: 'My Profile',           icon: '👤', action: () => location.href = '/profile.html' },
    { label: 'Toggle Dark/Light Mode', icon: '🌙', action: () => { const t = getTheme() === 'dark' ? 'light' : 'dark'; setTheme(t); document.documentElement.dataset.theme = t; } },
  ];
  if (isAdmin()) baseCommands.push({ label: 'Admin Panel', icon: '🛡', action: () => location.href = '/admin.html' });

  const el = document.createElement('div');
  el.id = 'cmd-palette';
  el.className = 'cmd-palette hidden';
  el.innerHTML = `
    <div class="cmd-backdrop" id="cmdBackdrop"></div>
    <div class="cmd-box">
      <div class="cmd-input-wrap">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:var(--text-faint)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="cmd-input" id="cmdInput" placeholder="Search actions…" autocomplete="off" spellcheck="false">
        <kbd class="cmd-esc-key">ESC</kbd>
      </div>
      <div class="cmd-list" id="cmdList"></div>
      <div class="cmd-footer">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>↵</kbd> select</span>
        <span><kbd>Ctrl K</kbd> toggle</span>
      </div>
    </div>`;
  document.body.appendChild(el);

  let filtered = [...baseCommands], cursor = 0;

  function render() {
    const list = document.getElementById('cmdList');
    if (!filtered.length) { list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-faint);font-size:.85rem">No matching actions</div>'; return; }
    list.innerHTML = filtered.map((cmd, i) => `
      <button class="cmd-item${i === cursor ? ' active' : ''}" data-idx="${i}">
        <span class="cmd-item-icon">${cmd.icon}</span>
        <span class="cmd-item-label">${cmd.label}</span>
      </button>`).join('');
    list.querySelectorAll('.cmd-item').forEach(btn => {
      btn.addEventListener('mouseenter', () => { cursor = +btn.dataset.idx; render(); });
      btn.addEventListener('click', () => { filtered[+btn.dataset.idx]?.action(); close(); });
    });
    // Scroll active into view
    const active = list.querySelector('.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    el.classList.remove('hidden');
    const inp = document.getElementById('cmdInput');
    inp.value = ''; filtered = [...baseCommands]; cursor = 0; render();
    setTimeout(() => inp.focus(), 30);
  }
  function close() { el.classList.add('hidden'); }

  document.getElementById('cmdInput').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    filtered = baseCommands.filter(c => c.label.toLowerCase().includes(q));
    cursor = 0; render();
  });
  document.getElementById('cmdBackdrop').addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); el.classList.contains('hidden') ? open() : close(); return; }
    if (el.classList.contains('hidden')) return;
    if (e.key === 'Escape')     { close(); return; }
    if (e.key === 'ArrowDown')  { e.preventDefault(); cursor = Math.min(cursor + 1, filtered.length - 1); render(); return; }
    if (e.key === 'ArrowUp')    { e.preventDefault(); cursor = Math.max(cursor - 1, 0); render(); return; }
    if (e.key === 'Enter')      { e.preventDefault(); filtered[cursor]?.action(); close(); }
  });

  window._openCmdPalette = open;
}

// ── Feature 7: Global keyboard shortcuts ─────────────────────
export function initKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const page = location.pathname.split('/').pop() || '';
    switch (e.key) {
      case 'd': case 'D': {
        const t = getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(t); document.documentElement.dataset.theme = t;
        break;
      }
      case 'e': case 'E':
        if (!page.includes('eligibility')) location.href = '/eligibility.html'; break;
      case 'p': case 'P':
        if (!page.includes('programme')) location.href = '/programmes.html'; break;
      case 'r': case 'R':
        if (!page.includes('result')) location.href = '/results.html'; break;
    }
  });
}

// ── Feature 8: Offline Detection Banner ──────────────────────
export function initOfflineBanner() {
  const banner = document.createElement('div');
  banner.id = 'offline-banner';
  banner.className = 'offline-banner hidden';
  banner.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
    <span>You're offline — some features may not work</span>`;
  document.body.prepend(banner);

  function update() {
    banner.classList.toggle('hidden', navigator.onLine);
  }
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
}

// ── Init all features at once ─────────────────────────────────
export function initAllFeatures() {
  initNotificationPanel();
  initCommandPalette();
  initKeyboardShortcuts();
  initOfflineBanner();
}
