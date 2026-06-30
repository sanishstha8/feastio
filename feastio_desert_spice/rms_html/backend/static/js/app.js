// ── State ─────────────────────────────────────────────────────────────────────
let STATE = {
  user: null,
  tables: [], orders: [], menuItems: [], menuCategories: [], staff: [],
  currentPage: 'landing',
  refreshInterval: null,
};
// ── Cross-tab sync ────────────────────────────────────────────────────────────
const _syncChannel = new BroadcastChannel('feastio_sync');
_syncChannel.onmessage = (e) => {
  if (e.data === 'tables_updated') {
    if (STATE.user?.role === 'waiter') loadStaffData();
    else if (STATE.user?.role === 'manager') {
      loadAllData().then(() => renderTablesOrders());
    }
  }
};
// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── Icons (inline SVG strings) ────────────────────────────────────────────────
const icons = {
  home:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  table:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  orders:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>`,
  menu:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  staff:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  reports: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  logout:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  plus:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  check:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  utensils:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  chef:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`,
  waiter:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  manager: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="m14.5 14.5 5 5"/><path d="M18 17h4v4"/></svg>`,
  clock:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  dollar:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  phone:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  calendar:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

// ── Page Router ───────────────────────────────────────────────────────────────
function showPage(name) {
  STATE.currentPage = name;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const el = document.getElementById(`page-${name}`);
  if (el) el.classList.remove('hidden');
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function hideLoading() {
  document.getElementById('loading-screen').classList.add('hidden');
}

async function checkAuth() {
  const token = TokenStorage.getAccess();
  if (!token) {
    hideLoading();
    showPage('landing');
    return;
  }
  try {
    const data = await api.get('/auth/me/');
    STATE.user = data;
    afterLogin();
  } catch {
    TokenStorage.clear();
    hideLoading();
    showPage('landing');
  }
}
function startAutoRefresh() {
  if (STATE.refreshInterval) clearInterval(STATE.refreshInterval);
  STATE.refreshInterval = setInterval(async () => {
    if (STATE.user?.role === 'manager') await loadAllData();
    else if (STATE.user?.role === 'cashier') await loadCashierData();
    else await loadStaffData();
  }, 30000);
}

function stopAutoRefresh() {
  if (STATE.refreshInterval) clearInterval(STATE.refreshInterval);
  STATE.refreshInterval = null;
}

function afterLogin() {
  hideLoading();
  startAutoRefresh();
  if (STATE.user.role === 'manager') {
    renderManagerShell();
    loadAllData().then(() => renderDashboard());
  } else if (STATE.user.role === 'cashier') {
    renderCashierPortal();
    loadCashierData();
  } else {
    renderStaffPortal();
    loadStaffData();
  }
}

function logout() {
  stopAutoRefresh();
  TokenStorage.clear();
  STATE.user = null;
  STATE.tables = []; STATE.orders = []; STATE.menuItems = []; STATE.staff = [];
  showPage('landing');
  document.getElementById('app-shell').innerHTML = '';
  document.getElementById('staff-portal').innerHTML = '';
  document.getElementById('cashier-portal').innerHTML = '';
}

// ── Data Loading ──────────────────────────────────────────────────────────────
async function loadAllData() {
  try {
    const [tables, orders, items, categories, staff] = await Promise.all([
      api.get('/orders/tables/'),
      api.get('/orders/orders/'),
      api.get('/menu/items/'),
      api.get('/menu/categories/'),
      api.get('/staff/employees/'),
    ]);
    STATE.tables     = (tables.results     ?? tables);
    STATE.orders     = (orders.results     ?? orders);
    STATE.menuItems  = (items.results      ?? items);
    STATE.menuCategories = (categories.results ?? categories);
    STATE.staff      = (staff.results      ?? staff);
  } catch(e) { toast('Failed to load data', 'error'); }
}

async function loadStaffData() {
  try {
    const [tables, orders, items, takeaways] = await Promise.all([
      api.get('/orders/tables/'),
      api.get('/orders/orders/'),
      api.get('/menu/items/'),
      api.get('/orders/takeaways/'),
    ]);
    STATE.tables     = (tables.results   ?? tables);
    STATE.orders     = (orders.results   ?? orders);
    STATE.menuItems  = (items.results    ?? items);
    STATE.takeaways  = (takeaways.results ?? takeaways);
    if (STATE.user.role === 'waiter') renderWaiterView();
    else renderKitchenView();
  } catch(e) { toast('Failed to load data', 'error'); }
}

async function loadCashierData() {
  try {
    const [orders, payments, takeaways, reservations, items] = await Promise.all([
      api.get('/orders/orders/'),
      api.get('/orders/payments/'),
      api.get('/orders/takeaways/'),
      api.get('/orders/reservations/'),
      api.get('/menu/items/'),
    ]);
    STATE.orders       = orders.results       ?? orders;
    STATE.payments     = payments.results     ?? payments;
    STATE.takeaways    = takeaways.results    ?? takeaways;
    STATE.reservations = reservations.results ?? reservations;
    STATE.menuItems    = items.results        ?? items;
    renderCashierView();
  } catch { toast('Failed to load data', 'error'); }
}

// ── Manager Shell ─────────────────────────────────────────────────────────────
function renderManagerShell() {
  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',       icon: icons.home    },
    { id: 'tables-orders', label: 'Tables & Orders',  icon: icons.table   },
    { id: 'menu',          label: 'Menu',             icon: icons.menu    },
    { id: 'staff',         label: 'Staff',            icon: icons.staff   },
    { id: 'reports',       label: 'Reports',          icon: icons.reports },
  ];

  const initials = (STATE.user.first_name?.[0] || '') + (STATE.user.last_name?.[0] || '') || STATE.user.username?.[0]?.toUpperCase() || 'U';
  const fullName = [STATE.user.first_name, STATE.user.last_name].filter(Boolean).join(' ') || STATE.user.username;

  document.getElementById('app-shell').innerHTML = `
    <div class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">${icons.utensils}</div>
        <span class="sidebar-title"> <h1>Feastio</h1> </span>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(n => `
          <button class="nav-item ${n.id === 'dashboard' ? 'active' : ''}" onclick="navigateTo('${n.id}')">
            ${n.icon} ${n.label}
          </button>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">${initials}</div>
          <div>
            <div class="user-name">${fullName}</div>
            <div class="user-role">${STATE.user.role}</div>
          </div>
        </div>
        <button class="btn btn-outline w-full btn-sm" onclick="logout()">
          ${icons.logout} Logout
        </button>
      </div>
    </div>
    <div class="main-content">
      <div class="mobile-topbar">
        <button id="mobile-menu-btn" class="mobile-menu-btn" onclick="toggleMobileSidebar()">☰</button>
        <h1 id="mobile-topbar-title">Dashboard</h1>
      </div>
      <div id="page-inner" class="page-content"></div>
    </div>
  `;
  showPage('app');
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[onclick="navigateTo('${page}')"]`)?.classList.add('active');
  const fns = { dashboard: renderDashboard, 'tables-orders': renderTablesOrders, menu: renderMenu, staff: renderStaff, reports: renderReports };
  if (fns[page]) fns[page]();
  closeMobileSidebar();
  const labels = { dashboard: 'Dashboard', 'tables-orders': 'Tables & Orders', menu: 'Menu', staff: 'Staff', reports: 'Reports' };
  const titleEl = document.getElementById('mobile-topbar-title');
  if (titleEl && labels[page]) titleEl.textContent = labels[page];
}

function setInner(html) {
  document.getElementById('page-inner').innerHTML = html;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const active    = STATE.orders.filter(o => o.status === 'active');
  const completed = STATE.orders.filter(o => o.status === 'completed');
  const occupied  = STATE.tables.filter(t => t.status === 'occupied').length;
  const revenue   = completed.reduce((s, o) => s + parseFloat(o.total), 0);
  const activeRev = active.reduce((s, o) => s + parseFloat(o.total), 0);

  setInner(`
    <div class="page-header">
      <div><h1>Dashboard</h1><p></p></div>
      <button class="btn btn-outline btn-sm" onclick="refreshDashboard()">${icons.refresh} Refresh</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Active Revenue <span style="color:var(--green)"></span></div>
        <div class="stat-value" style="color:var(--green)">NRs ${activeRev.toFixed(2)}</div>
        <div class="stat-sub">${active.length} active order${active.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tables Occupied <span></span></div>
        <div class="stat-value" style="color:var(--blue)">${occupied}/${STATE.tables.length}</div>
        <div class="stat-sub">${STATE.tables.length - occupied} available</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Orders <span></span></div>
        <div class="stat-value" style="color:var(--orange)">${active.length}</div>
        <div class="stat-sub">Currently being prepared</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Revenue <span></span></div>
        <div class="stat-value" style="color:var(--purple)">NRs ${revenue.toFixed(2)}</div>
        <div class="stat-sub">${completed.length} completed</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title">Active Orders</div></div>
        <div class="card-content">
          ${active.length === 0 ? '<div class="empty-state"><p>No active orders</p></div>' :
            active.slice(0, 5).map(o => `
              <div class="order-item-row">
                <div>
                  <div style="font-weight:500">Table ${o.table_number}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${(o.items||[]).length} items · ${new Date(o.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:600">NRs ${parseFloat(o.total).toFixed(2)}</div>
                  <span class="badge badge-orange">active</span>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Table Status</div></div>
        <div class="card-content" style="max-height:320px;overflow-y:auto">
          ${STATE.tables.map(t => `
            <div class="order-item-row">
              <div style="display:flex;align-items:center;gap:0.5rem">
                <span class="table-status-dot ${t.status === 'available' ? 'dot-green' : t.status === 'occupied' ? 'dot-red' : 'dot-yellow'}"></span>
                <div>
                  <div style="font-weight:500">Table ${t.number}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">Seats ${t.capacity}</div>
                </div>
              </div>
              <span class="badge ${t.status === 'available' ? 'badge-green' : t.status === 'occupied' ? 'badge-red' : 'badge-yellow'}">${t.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `);
}

async function refreshDashboard() {
  await loadAllData();
  renderDashboard();
  toast('Dashboard refreshed');
}

// ── Tables Page ───────────────────────────────────────────────────────────────
// ── Tables & Orders (Combined) ────────────────────────────────────────────────
function renderTablesOrders(tab = 'live') {
  const active   = STATE.orders.filter(o => o.status === 'active');
  const occupied = STATE.tables.filter(t => t.status === 'occupied').length;
  const available= STATE.tables.filter(t => t.status === 'available').length;
  const reserved = STATE.tables.filter(t => t.status === 'reserved').length;

  setInner(`
    <div class="page-header">
      <div><h1>Tables & Orders</h1></div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline btn-sm" onclick="refreshTablesOrders()">${icons.refresh} Refresh</button>
        <button class="btn btn-primary" onclick="openNewOrderModal()">${icons.plus} New Order</button>
      </div>
    </div>

    <!-- Tabs -->
    <div style="display:flex;gap:0;margin-bottom:1.5rem;border-bottom:2px solid var(--border)">
      <button onclick="renderTablesOrders('live')"
        style="padding:0.6rem 1.25rem;font-weight:600;font-size:var(--text-sm);border:none;background:none;cursor:pointer;border-bottom:${tab==='live'?'2px solid var(--orange);color:var(--orange);margin-bottom:-2px':'2px solid transparent;color:var(--text-muted)'}">
        Live Orders
      </button>
      <button onclick="renderTablesOrders('history')"
        style="padding:0.6rem 1.25rem;font-weight:600;font-size:var(--text-sm);border:none;background:none;cursor:pointer;border-bottom:${tab==='history'?'2px solid var(--orange);color:var(--orange);margin-bottom:-2px':'2px solid transparent;color:var(--text-muted)'}">
        Order History
      </button>
    </div>

    ${tab === 'live' ? `
      <!-- Summary strip -->
      <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:white;border:1px solid var(--border);border-radius:var(--radius);font-size:var(--text-sm)">
          <span class="table-status-dot dot-green"></span> <strong>${available}</strong> available
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:white;border:1px solid var(--border);border-radius:var(--radius);font-size:var(--text-sm)">
          <span class="table-status-dot dot-red"></span> <strong>${occupied}</strong> occupied
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:white;border:1px solid var(--border);border-radius:var(--radius);font-size:var(--text-sm)">
          <span class="table-status-dot dot-yellow"></span> <strong>${reserved}</strong> reserved
        </div>
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:white;border:1px solid var(--border);border-radius:var(--radius);font-size:var(--text-sm)">
          <strong>${active.length}</strong> active order${active.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div class="tables-grid" style="margin-bottom:2.5rem">
        ${STATE.tables.map(t => renderTableCard(t)).join('')}
      </div>
      ${active.length > 0 ? `
        <div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">
          <h2 style="font-size:1.1rem;font-weight:700">Active Orders</h2>
          <span style="font-size:var(--text-sm);color:var(--text-muted)">${active.length} order${active.length!==1?'s':''} in progress</span>
        </div>
        <div class="orders-grid">
          ${active.map(o => renderOrderCard(o)).join('')}
        </div>
      ` : `
        <div style="text-align:center;padding:2rem;color:var(--text-muted);background:white;border:1px dashed var(--border);border-radius:var(--radius)">
          <p style="font-size:1rem;margin-bottom:0.5rem">No active orders right now</p>
          <p style="font-size:var(--text-sm)">Click a table or press <strong>New Order</strong> to get started</p>
        </div>
      `}
      ${tableDetailModal()}
      ${newOrderModal()}
    ` : `
      <!-- Order History tab -->
      <div class="card" style="margin-bottom:1.5rem">
        <div class="card-content" style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap">
          <div class="form-group" style="margin:0;flex:1;min-width:120px">
            <label class="form-label">Status</label>
            <select class="form-select" id="oh-status" style="margin:0">
              <option value="">All past</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;flex:1;min-width:130px">
            <label class="form-label">From</label>
            <input class="form-input" type="date" id="oh-from" style="margin:0">
          </div>
          <div class="form-group" style="margin:0;flex:1;min-width:130px">
            <label class="form-label">To</label>
            <input class="form-input" type="date" id="oh-to" style="margin:0">
          </div>
          <div class="form-group" style="margin:0;flex:1;min-width:100px">
            <label class="form-label">Table #</label>
            <input class="form-input" type="number" id="oh-table" placeholder="Any" style="margin:0">
          </div>
          <button class="btn btn-primary" onclick="loadOrderHistory()">Search</button>
        </div>
      </div>
      <div id="oh-results">
        <div class="empty-state"><p>Select filters and click Search.</p></div>
      </div>
    `}
  `);

  if (tab === 'history') loadOrderHistory();
}

function renderTableCard(t) {
  const order = STATE.orders.find(o => o.table === t.id && o.status === 'active');
  const colors = {
    available: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', dot: '#16a34a' },
    occupied:  { bg: '#fef2f2', border: '#dc2626', text: '#dc2626', dot: '#dc2626' },
    reserved:  { bg: '#fffbeb', border: '#d97706', text: '#d97706', dot: '#d97706' },
  };
  const c = colors[t.status] || colors.available;
  return `
    <div class="table-card" onclick="openTableModal(${t.id})"
      style="cursor:pointer;background:${c.bg};border:1.5px solid ${c.border}">
      <div style="margin-bottom:0.5rem">
        <span style="font-weight:700;font-size:1.1rem;color:${c.text}">Table ${t.number}</span>
      </div>
      <div style="font-size:var(--text-sm);color:${c.text};opacity:0.8">${t.capacity} seats</div>
      ${order ? `
        <div style="margin-top:0.6rem;padding-top:0.6rem;border-top:1px solid ${c.border}30">
          <div style="font-size:0.75rem;color:${c.text};opacity:0.7;margin-bottom:0.2rem">${(order.items||[]).length} item${(order.items||[]).length!==1?'s':''}</div>
          <div style="font-size:0.9rem;color:${c.text};font-weight:700">NRs ${parseFloat(order.total).toFixed(2)}</div>
        </div>
     ` : ``}
    </div>
  `;
}

function tableDetailModal() {
  return `
    <div id="table-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="table-modal-title">Table Details</div>
            <div class="modal-desc" id="table-modal-desc"></div>
          </div>
          <button class="modal-close" onclick="closeModal('table-modal')">✕</button>
        </div>
        <div class="modal-body" id="table-modal-body"></div>
        <div class="modal-footer" id="table-modal-footer">
          <button class="btn btn-outline" onclick="closeModal('table-modal')">Close</button>
        </div>
      </div>
    </div>
  `;
}

function openTableModal(tableId) {
  const t = STATE.tables.find(t => t.id === tableId);
  const order = STATE.orders.find(o => o.table === tableId && o.status === 'active');

  document.getElementById('table-modal-title').textContent = `Table ${t.number}`;
  document.getElementById('table-modal-desc').textContent = `${t.capacity} seats · ${t.status}`;

  document.getElementById('table-modal-body').innerHTML = `
    <!-- Status badges -->
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <span class="badge ${t.status === 'available' ? 'badge-green' : t.status === 'occupied' ? 'badge-red' : 'badge-yellow'}" style="font-size:0.85rem;padding:0.3rem 0.75rem">${t.status}</span>
      ${order ? `<span class="badge badge-orange" style="font-size:0.85rem;padding:0.3rem 0.75rem">Order #${order.id} · NRs ${parseFloat(order.total).toFixed(2)}</span>` : ''}
    </div>

    ${order ? `
      <!-- Active order items -->
      <div>
        <div style="font-size:var(--text-sm);font-weight:600;margin-bottom:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">Current Order</div>
        ${(order.items||[]).map(item => `
          <div class="order-item-row">
            <div style="flex:1">
              <div style="font-weight:500">${item.quantity}x ${item.menu_item_name}</div>
              <div class="item-status-btns">
                ${['pending','preparing','ready','served'].map(s => `
                  <button class="item-status-btn ${item.status === s ? 'active-'+s : ''}"
                    onclick="updateItemStatusAndRefreshModal(${order.id}, ${item.id}, '${s}', ${tableId})">${s}</button>
                `).join('')}
              </div>
            </div>
            <span style="font-weight:600;margin-left:0.5rem">NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="order-total"><span>Total</span><span>NRs ${parseFloat(order.total).toFixed(2)}</span></div>
      </div>
      <!-- Order actions -->
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-primary w-full" onclick="completeOrderFromModal(${order.id})">${icons.check} Complete Order</button>
        <button class="btn btn-danger btn-sm" onclick="cancelOrderFromModal(${order.id})">${icons.x}</button>
      </div>
    ` : `
      <!-- No order — offer to create one or change status -->
      <div style="text-align:center;padding:1rem 0">
        <p style="color:var(--text-muted);font-size:var(--text-sm);margin-bottom:1rem">This table has no active order</p>
        ${t.status === 'available' ? `
          <button class="btn btn-primary w-full" onclick="closeModal('table-modal'); openNewOrderModalForTable(${t.id})">${icons.plus} Create Order for Table ${t.number}</button>
        ` : ''}
      </div>
    `}

    <!-- Change status -->
    <div>
      <div style="font-size:var(--text-sm);font-weight:500;margin-bottom:0.5rem;color:var(--text-muted)">Change Table Status</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="changeTableStatus(${t.id},'available')" ${t.status==='available'?'disabled':''}>✓ Available</button>
        <button class="btn btn-outline btn-sm" onclick="changeTableStatus(${t.id},'reserved')" ${t.status==='reserved'?'disabled':''}>Reserved</button>
        ${!order ? `<button class="btn btn-outline btn-sm" onclick="changeTableStatus(${t.id},'occupied')" ${t.status==='occupied'?'disabled':''}>Occupied</button>` : ''}
      </div>
    </div>
  `;

  openModal('table-modal');
}

async function updateItemStatusAndRefreshModal(orderId, itemId, status, tableId) {
  try {
    await api.patch(`/orders/orders/${orderId}/items/${itemId}/status/`, { status });
    const order = STATE.orders.find(o => o.id === orderId);
    if (order) { const item = (order.items||[]).find(i => i.id === itemId); if (item) item.status = status; }
    // Re-render modal in place and refresh the table cards
    openTableModal(tableId);
    document.querySelectorAll('.table-card').forEach((card, i) => {
      card.outerHTML = renderTableCard(STATE.tables[i]);
    });
  } catch { toast('Failed to update status', 'error'); }
}

async function completeOrderFromModal(orderId) {
  const order = STATE.orders.find(o => o.id === orderId);
  const notReady = (order?.items || []).filter(i => !['ready','served'].includes(i.status));
  if (notReady.length > 0) {
    const names = notReady.map(i => i.menu_item_name).join(', ');
    toast(`Kitchen hasn't finished yet: ${names}`, 'error');
    return;
  }
  try {
    await api.patch(`/orders/orders/${orderId}/complete/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('table-modal');
    renderManagerView();
    toast('Order completed — sent to cashier!');
  } catch { toast('Failed to complete order', 'error'); }
}

async function cancelOrderFromModal(orderId) {
  try {
    await api.patch(`/orders/orders/${orderId}/cancel/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('table-modal');
    renderTablesOrders();
    toast('Order cancelled');
  } catch { toast('Failed to cancel order', 'error'); }
}

async function changeTableStatus(id, status) {
  try {
    await api.patch(`/orders/tables/${id}/set-status/`, { status });
    const t = STATE.tables.find(t => t.id === id);
    if (t) t.status = status;
    closeModal('table-modal');
    renderTablesOrders();
    toast(`Table status updated to ${status}`);
  } catch { toast('Failed to update table', 'error'); }
}

async function refreshTablesOrders() {
  const [tables, orders] = await Promise.all([api.get('/orders/tables/'), api.get('/orders/orders/')]);
  STATE.tables = tables.results ?? tables;
  STATE.orders = orders.results ?? orders;
  renderTablesOrders();
  toast('Refreshed');
}

function renderOrderCard(o) {
  return `
    <div class="order-card">
      <div class="order-card-header">
        <span style="font-weight:700">Table ${o.table_number}</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">${icons.clock} ${new Date(o.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
      </div>
      <div class="order-card-body">
        ${(o.items||[]).map(item => `
          <div class="order-item-row">
            <div style="flex:1">
              <div style="font-weight:500">${item.quantity}x ${item.menu_item_name}</div>
              <div class="item-status-btns">
                ${['pending','preparing','ready','served'].map(s => `
                  <button class="item-status-btn ${item.status === s ? 'active-'+s : ''}"
                    onclick="updateItemStatus(${o.id}, ${item.id}, '${s}')">${s}</button>
                `).join('')}
              </div>
            </div>
            <span style="font-weight:600;margin-left:0.5rem">NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="order-total"><span>Total</span><span>NRs ${parseFloat(o.total).toFixed(2)}</span></div>
        <div class="order-actions">
          <button class="btn btn-primary w-full" onclick="completeOrder(${o.id})">${icons.check} Complete</button>
          <button class="btn btn-danger btn-sm" onclick="cancelOrder(${o.id})">${icons.x}</button>
        </div>
      </div>
    </div>
  `;
}

function newOrderModal(preselectedTableId = null) {
  const available = STATE.tables.filter(t => t.status === 'available' || t.status === 'reserved');
  const menuAvail = STATE.menuItems.filter(m => m.available);
  return `
    <div id="new-order-modal" class="modal-overlay hidden">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div><div class="modal-title">Create New Order</div><div class="modal-desc">Select a table and add items</div></div>
          <button class="modal-close" onclick="closeModal('new-order-modal')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Select Table</label>
            <select class="form-select" id="order-table-select">
              <option value="">Choose a table...</option>
              ${available.map(t => `<option value="${t.id}" ${preselectedTableId === t.id ? 'selected' : ''}>Table ${t.number} — seats ${t.capacity}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Menu Items</label>
            <div style="border:1px solid var(--border);border-radius:var(--radius);max-height:280px;overflow-y:auto;padding:0.5rem;display:flex;flex-direction:column;gap:0.35rem">
              ${menuAvail.map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem;background:var(--bg);border-radius:var(--radius)">
                  <div>
                    <div style="font-weight:500;font-size:var(--text-sm)">${item.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">NRs ${parseFloat(item.price).toFixed(2)}</div>
                  </div>
                  <div style="display:flex;align-items:center;gap:0.35rem" id="item-ctrl-${item.id}">
                    <button class="btn btn-primary btn-sm" onclick="addOrderItem(${item.id}, ${item.price}, '${item.name.replace(/'/g,"\\'")}')">Add</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div id="order-summary" class="hidden" style="background:var(--bg);border-radius:var(--radius);padding:1rem">
            <div style="font-weight:600;margin-bottom:0.5rem">Order Summary</div>
            <div id="order-summary-items"></div>
            <div class="order-total" id="order-summary-total"><span>Total</span><span>NRs 0.00</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('new-order-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitNewOrder()">Create Order</button>
        </div>
      </div>
    </div>
  `;
}

let orderCart = {};

function openNewOrderModal() {
  orderCart = {};
  openModal('new-order-modal');
}

function openNewOrderModalForTable(tableId) {
  orderCart = {};
  // Re-render the page with the modal pre-selecting this table
  const active = STATE.orders.filter(o => o.status === 'active');
  const occupied  = STATE.tables.filter(t => t.status === 'occupied').length;
  const available = STATE.tables.filter(t => t.status === 'available').length;
  // Append the modal fresh with the preselected table
  const existing = document.getElementById('new-order-modal');
  if (existing) existing.remove();
  document.getElementById('page-inner').insertAdjacentHTML('beforeend', newOrderModal(tableId));
  openModal('new-order-modal');
}

function addOrderItem(itemId, price, name) {
  if (orderCart[itemId]) orderCart[itemId].qty++;
  else orderCart[itemId] = { qty: 1, price: parseFloat(price), name };
  updateItemCtrl(itemId);
  updateOrderSummary();
}

function removeOrderItem(itemId) {
  if (!orderCart[itemId]) return;
  orderCart[itemId].qty--;
  if (orderCart[itemId].qty <= 0) delete orderCart[itemId];
  updateItemCtrl(itemId);
  updateOrderSummary();
}

function updateItemCtrl(itemId) {
  const ctrl = document.getElementById(`item-ctrl-${itemId}`);
  if (!ctrl) return;
  const qty = orderCart[itemId]?.qty || 0;
  if (qty === 0) {
    ctrl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="addOrderItem(${itemId}, ${STATE.menuItems.find(m=>m.id===itemId)?.price}, '${STATE.menuItems.find(m=>m.id===itemId)?.name?.replace(/'/g,"\\'")}')">Add</button>`;
  } else {
    ctrl.innerHTML = `
      <button class="btn btn-outline btn-sm" onclick="removeOrderItem(${itemId})">-</button>
      <span style="width:1.5rem;text-align:center;font-weight:600">${qty}</span>
      <button class="btn btn-outline btn-sm" onclick="addOrderItem(${itemId}, ${STATE.menuItems.find(m=>m.id===itemId)?.price}, '${STATE.menuItems.find(m=>m.id===itemId)?.name?.replace(/'/g,"\\'")}')">+</button>
    `;
  }
}

function updateOrderSummary() {
  const summary = document.getElementById('order-summary');
  const items   = document.getElementById('order-summary-items');
  const total   = document.getElementById('order-summary-total');
  const entries = Object.entries(orderCart);
  if (entries.length === 0) { summary?.classList.add('hidden'); return; }
  summary?.classList.remove('hidden');
  let totalAmt = 0;
  items.innerHTML = entries.map(([id, {qty, price, name}]) => {
    totalAmt += qty * price;
    return `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:0.25rem"><span>${qty}x ${name}</span><span>NRs ${(qty*price).toFixed(2)}</span></div>`;
  }).join('');
  total.innerHTML = `<span>Total</span><span>NRs ${totalAmt.toFixed(2)}</span>`;
}

async function submitNewOrder() {
  const tableId = document.getElementById('order-table-select').value;
  if (!tableId) { toast('Please select a table', 'error'); return; }
  if (Object.keys(orderCart).length === 0) { toast('Please add at least one item', 'error'); return; }
  try {
    await api.post('/orders/orders/', {
      table_id: parseInt(tableId),
      items: Object.entries(orderCart).map(([id, {qty}]) => ({ menu_item: parseInt(id), quantity: qty })),
    });
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('new-order-modal');
    renderTablesOrders();
    toast('Order created successfully!');
  } catch { toast('Failed to create order', 'error'); }
}

async function updateItemStatus(orderId, itemId, status) {
  try {
    await api.patch(`/orders/orders/${orderId}/items/${itemId}/status/`, { status });
    const order = STATE.orders.find(o => o.id === orderId);
    if (order) { const item = (order.items||[]).find(i => i.id === itemId); if (item) item.status = status; }
    renderTablesOrders();
  } catch { toast('Failed to update status', 'error'); }
}

async function completeOrder(orderId) {
  const order = STATE.orders.find(o => o.id === orderId);
  const notReady = (order?.items || []).filter(i => !['ready','served'].includes(i.status));
  if (notReady.length > 0) {
    const names = notReady.map(i => i.menu_item_name).join(', ');
    toast(`Kitchen hasn't finished yet: ${names}`, 'error');
    return;
  }
  try {
    await api.patch(`/orders/orders/${orderId}/complete/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    renderManagerView();
    toast('Order completed — sent to cashier!');
  } catch { toast('Failed to complete order', 'error'); }
}

async function cancelOrder(orderId) {
  try {
    await api.patch(`/orders/orders/${orderId}/cancel/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    renderTablesOrders();
    toast('Order cancelled');
  } catch { toast('Failed to cancel order', 'error'); }
}



// ── Menu Page ─────────────────────────────────────────────────────────────────
function renderMenu() {
  const categories = [...new Set(STATE.menuItems.map(m => m.category_name))].filter(Boolean);
  setInner(`
    <div class="page-header">
      <div><h1>Menu</h1><p></p></div>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <input class="form-input" id="admin-menu-search"
          placeholder="🔍 Search menu items..."
          oninput="adminFilterMenu(this.value)"
          style="width:220px;margin:0">
        <button class="btn btn-outline btn-sm" onclick="refreshMenu()">${icons.refresh} Refresh</button>
        <button class="btn btn-primary" onclick="openMenuModal()">${icons.plus} Add Item</button>
      </div>
    </div>
    <div id="admin-menu-categories">
    ${STATE.menuItems.length === 0 ? '<div class="empty-state"><p>No menu items yet</p></div>' :
      categories.map(cat => {
        const items = STATE.menuItems.filter(m => m.category_name === cat);
        return `
          <div class="menu-category" data-cat="${cat}">
            <h2>${cat}</h2>
            <div class="menu-grid">
              ${items.map(item => `
                <div class="menu-item-card" data-name="${item.name.toLowerCase()}">
                  ${item.image ? `<img src="${item.image}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0" onerror="this.style.display='none'">` : ''}
                  <div class="menu-item-top">
                    <div class="menu-item-name">${item.name}</div>
                    <span class="badge ${item.available ? 'badge-green' : 'badge-gray'} clickable-badge" onclick="toggleMenuItem(${item.id})"> ${item.available ? 'Available' : 'Off'} </span>
                  </div>
                  <div class="menu-item-desc">${item.description || ''}</div>
                  <div class="menu-item-bottom">
                    <div class="menu-item-price">NRs ${parseFloat(item.price).toFixed(2)}</div>
                    <div class="menu-item-actions">
                      <button class="icon-btn" onclick="openMenuModal(${item.id})" title="Edit">${icons.edit}</button>
                      <button class="icon-btn" onclick="deleteMenuItem(${item.id})" title="Delete">${icons.trash}</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')
    }
    </div>
    ${menuFormModal()}
  `);
}

function adminFilterMenu(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('#admin-menu-categories .menu-category').forEach(section => {
    let anyVisible = false;
    section.querySelectorAll('.menu-item-card').forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const show = !q || name.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) anyVisible = true;
    });
    section.style.display = anyVisible ? '' : 'none';
  });
}

function menuFormModal(item = null) {
  return `
    <div id="menu-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div><div class="modal-title">${item ? 'Edit' : 'Add'} Menu Item</div></div>
          <button class="modal-close" onclick="closeModal('menu-modal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="menu-item-id" value="${item?.id || ''}">
          <div class="form-group">
            <label class="form-label">Name *</label>
            <input class="form-input" id="menu-name" value="${item?.name || ''}" placeholder="Item name">
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="menu-category">
              ${STATE.menuCategories.map(c => `<option value="${c.id}" ${item?.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Price *</label>
            <input class="form-input" id="menu-price" type="number" step="0.01" value="${item?.price || ''}" placeholder="0.00">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="menu-desc" placeholder="Item description">${item?.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Food Photo</label>
            ${item?.image ? `<img src="${item.image}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius);margin-bottom:0.5rem" onerror="this.style.display='none'">` : ''}
            <input type="file" id="menu-image" accept="image/*" class="form-input" style="padding:0.25rem">
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <input type="checkbox" id="menu-available" ${(!item || item.available) ? 'checked' : ''}>
            <label for="menu-available" class="form-label" style="margin:0">Available for ordering</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('menu-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveMenuItem()">${item ? 'Update' : 'Add'} Item</button>
        </div>
      </div>
    </div>
  `;
}

function openMenuModal(itemId = null) {
  if (itemId) {
    const item = STATE.menuItems.find(m => m.id === itemId);
    document.getElementById('menu-modal')?.remove();
    document.getElementById('page-inner').insertAdjacentHTML('beforeend', menuFormModal(item));
  }
  openModal('menu-modal');
}

async function saveMenuItem() {
  const id    = document.getElementById('menu-item-id').value;
  const name  = document.getElementById('menu-name').value.trim();
  const price = document.getElementById('menu-price').value;
  const cat   = document.getElementById('menu-category').value;
  const desc  = document.getElementById('menu-desc').value;
  const avail = document.getElementById('menu-available').checked;
  if (!name || !price) { toast('Name and price are required', 'error'); return; }
  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    toast('Price must be a positive number', 'error');
    return;
  }
  if (name.length < 2) {
    toast('Name must be at least 2 characters', 'error');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', parseFloat(price));
    formData.append('category', parseInt(cat));
    formData.append('description', desc);
    formData.append('available', avail);
    const imgFile = document.getElementById('menu-image').files[0];
    if (imgFile) formData.append('image', imgFile);

    const headers = {};
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/menu/items/${id ? id + '/' : ''}`, {
        method: id ? 'PATCH' : 'POST',
        headers,
        body: formData,
    });
    if (!res.ok) throw new Error();
    const data = await api.get('/menu/items/');
    STATE.menuItems = data.results ?? data;
    closeModal('menu-modal');
    renderMenu();
    toast(id ? 'Item updated' : 'Item added');
  } catch { toast('Failed to save item', 'error'); }
}

async function toggleMenuItem(id) {
  try {
    await api.patch(`/menu/items/${id}/toggle-availability/`);
    const data = await api.get('/menu/items/');
    STATE.menuItems = data.results ?? data;
    renderMenu();
  } catch { toast('Failed to toggle item', 'error'); }
}

async function deleteMenuItem(id) {
  if (!confirm('Delete this menu item?')) return;
  try {
    await api.delete(`/menu/items/${id}/`);
    STATE.menuItems = STATE.menuItems.filter(m => m.id !== id);
    renderMenu();
    toast('Item deleted');
  } catch { toast('Failed to delete item', 'error'); }
}

async function refreshMenu() {
  const [items, cats] = await Promise.all([api.get('/menu/items/'), api.get('/menu/categories/')]);
  STATE.menuItems = items.results ?? items;
  STATE.menuCategories = cats.results ?? cats;
  renderMenu();
  toast('Menu refreshed');
}

// ── Staff Page ────────────────────────────────────────────────────────────────
function renderStaff() {
  const roleColors = { manager: '#7c3aed', waiter: '#2563eb', kitchen: '#ea580c' };
  const activeCount  = STATE.staff.filter(s => s.status === 'active').length;
  const payroll      = STATE.staff.filter(s => s.status !== 'inactive').reduce((sum, s) => sum + parseFloat(s.hourly_rate) * 8, 0);

  setInner(`
    <div class="page-header">
      <div><h1>Staff </h1><p></p></div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline btn-sm" onclick="refreshStaff()">${icons.refresh} Refresh</button>
        <button class="btn btn-primary" onclick="openStaffModal()">${icons.plus} Add Staff</button>
      </div>
    </div>
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card"><div class="stat-label">Total Staff</div><div class="stat-value">${STATE.staff.length}</div><div class="stat-sub">Team members</div></div>
      <div class="stat-card"><div class="stat-label">Active Now</div><div class="stat-value" style="color:var(--green)">${activeCount}</div><div class="stat-sub">Currently working</div></div>
      <div class="stat-card"><div class="stat-label">Est. Daily Payroll</div><div class="stat-value" style="color:var(--purple)">NRs ${payroll.toFixed(2)}</div><div class="stat-sub">Based on 8hr shift</div></div>
    </div>
    <div class="staff-grid">
      ${STATE.staff.map(s => {
        const color = roleColors[s.role] || '#6b7280';
        const initials = (s.full_name || s.user?.username || '?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
        return `
          <div class="staff-card">
            <div class="staff-card-top">
              <div style="display:flex;align-items:center">
                <div class="staff-avatar" style="background:${color}">${initials}</div>
                <div class="staff-info">
                  <div class="staff-name">${s.full_name || ''}</div>
                  <div class="staff-role-text">${s.role}</div>
                </div>
              </div>
            </div>
            <div class="staff-detail-row">${icons.mail} ${s.email || ''}</div>
            <div class="staff-detail-row">${icons.phone} ${s.phone || '—'}</div>
            <div class="staff-detail-row">${icons.calendar} ${s.shift} shift</div>
            <div class="staff-detail-row">NRs ${parseFloat(s.hourly_rate).toFixed(2)}/hr</div>
            <div class="staff-card-actions">
              <select class="form-select" style="flex:1;font-size:0.8rem;padding:0.3rem 0.5rem" onchange="updateStaffStatus(${s.id}, this.value)">
                <option value="active" ${s.status==='active'?'selected':''}>Active</option>
                <option value="inactive" ${s.status==='inactive'?'selected':''}>Inactive</option>
              </select>
              <button class="icon-btn" onclick="openStaffModal(${s.id})">${icons.edit}</button>
              <button class="icon-btn" onclick="deleteStaff(${s.id})">${icons.trash}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    ${staffFormModal()}
  `);
}

function staffFormModal(s = null) {
  return `
    <div id="staff-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div><div class="modal-title">${s ? 'Edit Staff Member' : 'Add Staff Member'}</div></div>
          <button class="modal-close" onclick="closeModal('staff-modal')">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="staff-id" value="${s?.id || ''}">

          ${!s ? `
           
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input class="form-input" id="staff-firstname" placeholder="John">
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input class="form-input" id="staff-lastname" placeholder="Doe">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email * (used to log in)</label>
              <input class="form-input" id="staff-email" type="email" placeholder="john@restaurant.com">
            </div>
            <div class="form-group">
              <label class="form-label">Password *</label>
              <input class="form-input" id="staff-password" type="password" placeholder="Min 6 characters">
            </div>
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select class="form-select" id="staff-role">
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Hire Date *</label>
              <input class="form-input" id="staff-hiredate" type="date" value="${new Date().toISOString().split('T')[0]}">
            </div>
          ` : ''}

          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-input" id="staff-phone" value="${s?.phone || ''}" placeholder="555-1234">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Hourly Rate</label>
              <input class="form-input" id="staff-rate" type="number" step="0.01" value="${s?.hourly_rate || ''}" placeholder="15.00">
            </div>
            <div class="form-group">
              <label class="form-label">Shift</label>
              <select class="form-select" id="staff-shift">
                <option value="morning"   ${s?.shift==='morning'   ?'selected':''}>Morning</option>
                <option value="afternoon" ${s?.shift==='afternoon' ?'selected':''}>Afternoon</option>
                <option value="evening"   ${s?.shift==='evening'   ?'selected':''}>Evening</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" id="staff-status">
              <option value="active"   ${s?.status==='active'   ?'selected':''}>Active</option>
              <option value="inactive" ${s?.status==='inactive' ?'selected':''}>Inactive</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('staff-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="saveStaff()">${s ? 'Update' : 'Add Staff Member'}</button>
        </div>
      </div>
    </div>
  `;
}

function openStaffModal(staffId = null) {
  if (staffId) {
    const s = STATE.staff.find(s => s.id === staffId);
    document.getElementById('staff-modal')?.remove();
    document.getElementById('page-inner').insertAdjacentHTML('beforeend', staffFormModal(s));
  }
  openModal('staff-modal');
}

async function saveStaff() {
  const id = document.getElementById('staff-id').value;

  if (id) {
    // Editing existing staff — only update employee fields
    const body = {
      phone:       document.getElementById('staff-phone').value,
      hourly_rate: parseFloat(document.getElementById('staff-rate').value) || 0,
      shift:       document.getElementById('staff-shift').value,
      status:      document.getElementById('staff-status').value,
    };
    try {
      await api.patch(`/staff/employees/${id}/`, body);
      const data = await api.get('/staff/employees/');
      STATE.staff = data.results ?? data;
      closeModal('staff-modal');
      renderStaff();
      toast('Staff member updated');
    } catch { toast('Failed to update staff', 'error'); }

  } else {
    // Adding new staff — create user + employee in one call
    const firstName = document.getElementById('staff-firstname').value.trim();
    const email     = document.getElementById('staff-email').value.trim();
    const password  = document.getElementById('staff-password').value;
    const hireDate  = document.getElementById('staff-hiredate').value;

    if (!firstName || !email || !password || !hireDate) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }

    const body = {
      first_name:  firstName,
      last_name:   document.getElementById('staff-lastname').value.trim(),
      email,
      password,
      role:        document.getElementById('staff-role').value,
      phone:       document.getElementById('staff-phone').value,
      hourly_rate: parseFloat(document.getElementById('staff-rate').value) || 0,
      shift:       document.getElementById('staff-shift').value,
      status:      document.getElementById('staff-status').value,
      hire_date:   hireDate,
    };
    try {
      await api.post('/staff/employees/', body);
      const data = await api.get('/staff/employees/');
      STATE.staff = data.results ?? data;
      closeModal('staff-modal');
      renderStaff();
      toast('Staff member added successfully!');
    } catch(e) {
      let msg = 'Failed to add staff member';
      try {
        const errData = JSON.parse(e.message);
        if (errData.email)      msg = 'Email: ' + errData.email[0];
        else if (errData.password)   msg = 'Password: ' + errData.password[0];
        else if (errData.hire_date)  msg = 'Hire date: ' + errData.hire_date[0];
        else if (errData.non_field_errors) msg = errData.non_field_errors[0];
        else if (errData.detail) msg = errData.detail;
      } catch {}
      toast(msg, 'error');
      console.error('Staff error:', e.message);
    }
  }
}

async function updateStaffStatus(id, status) {
  try {
    await api.patch(`/staff/employees/${id}/`, { status });
    const s = STATE.staff.find(s => s.id === id);
    if (s) s.status = status;
    toast('Status updated');
  } catch { toast('Failed to update status', 'error'); }
}

async function deleteStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  try {
    await api.delete(`/staff/employees/${id}/`);
    STATE.staff = STATE.staff.filter(s => s.id !== id);
    renderStaff();
    toast('Staff member removed');
  } catch { toast('Failed to delete', 'error'); }
}

async function refreshStaff() {
  const data = await api.get('/staff/employees/');
  STATE.staff = data.results ?? data;
  renderStaff();
  toast('Staff refreshed');
}

// ── Reports Page ──────────────────────────────────────────────────────────────
function renderReports() {
  const completed = STATE.orders.filter(o => o.status === 'completed');
  const active    = STATE.orders.filter(o => o.status === 'active');
  const total     = completed.reduce((s, o) => s + parseFloat(o.total), 0);
  const avgOrder  = completed.length ? total / completed.length : 0;
  const topItems  = {};
  [...completed, ...active].forEach(o => (o.items||[]).forEach(i => {
    topItems[i.menu_item_name] = (topItems[i.menu_item_name] || 0) + i.quantity;
  }));
  const sorted = Object.entries(topItems).sort((a,b) => b[1]-a[1]).slice(0, 5);
  const today = new Date().toISOString().split('T')[0];

  setInner(`
    <div class="page-header">
      <div><h1>Reports</h1></div>
      <button class="btn btn-outline btn-sm" onclick="refreshDashboard()">${icons.refresh} Refresh</button>
    </div>

    <!-- Date filter card -->
    <div class="card" style="margin-bottom:1.5rem">
      <div class="card-content" style="display:flex;gap:1rem;align-items:flex-end;flex-wrap:wrap">
        <div class="form-group" style="margin:0;flex:1;min-width:140px">
          <label class="form-label">From</label>
          <input class="form-input" type="date" id="report-from" value="${today}" style="margin:0">
        </div>
        <div class="form-group" style="margin:0;flex:1;min-width:140px">
          <label class="form-label">To</label>
          <input class="form-input" type="date" id="report-to" value="${today}" style="margin:0">
        </div>
        <button class="btn btn-primary" onclick="loadFilteredReport()">Generate Report</button>
        <button class="btn btn-outline" onclick="loadFullReport()">All Time</button>
      </div>
    </div>

    <div id="report-content">
      <!-- All time stats shown by default -->
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value" style="color:var(--green)">NRs ${total.toFixed(2)}</div><div class="stat-sub">All completed orders</div></div>
        <div class="stat-card"><div class="stat-label">Completed Orders</div><div class="stat-value">${completed.length}</div><div class="stat-sub">All time</div></div>
        <div class="stat-card"><div class="stat-label">Avg Order Value</div><div class="stat-value" style="color:var(--blue)">NRs ${avgOrder.toFixed(2)}</div></div>
        <div class="stat-card"><div class="stat-label">Tables Available</div><div class="stat-value" style="color:var(--orange)">${STATE.tables.filter(t=>t.status==='available').length}</div><div class="stat-sub">of ${STATE.tables.length} total</div></div>
      </div>
      <div class="card" style="margin-top:1rem">
        <div class="card-header"><div class="card-title">Top Menu Items (All Time)</div></div>
        <div class="card-content">
          ${sorted.length === 0 ? '<div class="empty-state"><p>No order data yet</p></div>' :
            sorted.map(([name, qty], i) => `
              <div class="order-item-row">
                <div style="display:flex;align-items:center;gap:0.75rem">
                  <span style="width:1.5rem;height:1.5rem;background:var(--orange);color:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700">${i+1}</span>
                  <span style="font-weight:500">${name}</span>
                </div>
                <span class="badge badge-orange">${qty} ordered</span>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `);
}

async function loadFilteredReport() {
  const from = document.getElementById('report-from').value;
  const to   = document.getElementById('report-to').value;
  if (!from || !to) { toast('Please select both dates', 'error'); return; }
  if (from > to) { toast('From date must be before To date', 'error'); return; }
  const resultsEl = document.getElementById('report-content');
  resultsEl.innerHTML = `<div class="empty-state"><p>Loading...</p></div>`;
  try {
    const data = await api.get(`/orders/payments/?from=${from}&to=${to}`);
    const payments = data.results ?? data;
    const paid     = payments.filter(p => p.status === 'paid');
    const refunded = payments.filter(p => p.status === 'refunded');
    const revenue  = paid.reduce((s, p) => s + parseFloat(p.grand_total), 0);
    const tips     = paid.reduce((s, p) => s + parseFloat(p.tip || 0), 0);
    const discounts= paid.reduce((s, p) => s + parseFloat(p.discount || 0), 0);
    const avg      = paid.length ? revenue / paid.length : 0;
    const cashCount= paid.filter(p => p.method === 'cash').length;
    const cardCount= paid.filter(p => p.method === 'card').length;
    const qrCount  = paid.filter(p => p.method === 'qr').length;

    resultsEl.innerHTML = `
      <div style="padding:0.5rem 0 1rem;font-size:0.85rem;color:var(--text-muted)">
        Showing results from <strong>${from}</strong> to <strong>${to}</strong>
      </div>
      <div class="stats-grid" style="margin-bottom:1rem">
        <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value" style="color:var(--green)">NRs ${revenue.toFixed(2)}</div><div class="stat-sub">${paid.length} payments</div></div>
        <div class="stat-card"><div class="stat-label">Avg Bill</div><div class="stat-value" style="color:var(--blue)">NRs ${avg.toFixed(2)}</div></div>
        <div class="stat-card"><div class="stat-label">Tips Collected</div><div class="stat-value" style="color:var(--green)">NRs ${tips.toFixed(2)}</div></div>
        <div class="stat-card"><div class="stat-label">Discounts Given</div><div class="stat-value" style="color:#dc2626">NRs ${discounts.toFixed(2)}</div></div>
      </div>
      <div class="stats-grid" style="margin-bottom:1.5rem">
        <div class="stat-card"><div class="stat-label">Cash Payments</div><div class="stat-value">${cashCount}</div></div>
        <div class="stat-card"><div class="stat-label">Card Payments</div><div class="stat-value">${cardCount}</div></div>
        <div class="stat-card"><div class="stat-label">QR Payments</div><div class="stat-value">${qrCount}</div></div>
        <div class="stat-card"><div class="stat-label">Refunds</div><div class="stat-value" style="color:#dc2626">${refunded.length}</div></div>
      </div>
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:center">
          <div class="card-title">Payment Details</div>
          <span style="font-size:0.8rem;color:var(--text-muted)">${paid.length} record${paid.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="card-content" id="report-payment-list">
          ${paid.length === 0 ? '<div class="empty-state"><p>No payments in this period</p></div>' : ''}
        </div>
        <div id="report-payment-pagination" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem;border-top:1px solid var(--border)"></div>
      </div>
    `;
    window._reportPaidPayments = paid;
    renderReportPaymentPage(paid, 1);
  } catch { toast('Failed to load report', 'error'); }
}

const REPORT_PAGE_SIZE = 8;

function renderReportPaymentPage(payments, page) {
  const totalPages = Math.ceil(payments.length / REPORT_PAGE_SIZE) || 1;
  page = Math.max(1, Math.min(page, totalPages));
  const start = (page - 1) * REPORT_PAGE_SIZE;
  const slice = payments.slice(start, start + REPORT_PAGE_SIZE);
  const listEl = document.getElementById('report-payment-list');
  const pagEl  = document.getElementById('report-payment-pagination');
  if (!listEl) return;
  if (payments.length === 0) return;
  listEl.innerHTML = slice.map(p => `
    <div class="order-item-row">
      <div>
        <div style="font-weight:600">Order #${p.order} — Table ${p.table_number}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">
          ${new Date(p.paid_at||p.created_at).toLocaleString()} · ${p.method.toUpperCase()}
        </div>
        ${parseFloat(p.tip||0) > 0 ? `<div style="font-size:0.75rem;color:var(--green)">Tip: NRs ${parseFloat(p.tip).toFixed(2)}</div>` : ''}
        ${parseFloat(p.discount||0) > 0 ? `<div style="font-size:0.75rem;color:#dc2626">Discount: NRs ${parseFloat(p.discount).toFixed(2)}</div>` : ''}
      </div>
      <div style="font-weight:700">NRs ${parseFloat(p.grand_total).toFixed(2)}</div>
    </div>
  `).join('');
  if (pagEl) {
    pagEl.innerHTML = totalPages <= 1 ? '' :
      `<button class="btn btn-outline btn-sm" ${page <= 1 ? 'disabled' : ''} onclick="renderReportPaymentPage(window._reportPaidPayments, ${page - 1})">&#8592; Prev</button>
       <span style="font-size:0.85rem;color:var(--text-muted);padding:0 0.5rem">Page ${page} of ${totalPages}</span>
       <button class="btn btn-outline btn-sm" ${page >= totalPages ? 'disabled' : ''} onclick="renderReportPaymentPage(window._reportPaidPayments, ${page + 1})">Next &#8594;</button>`;
  }
}

function loadFullReport() {
  renderReports();
}

// ── Cashier Portal ────────────────────────────────────────────────────────────
function renderCashierPortal() {
  const fullName = [STATE.user.first_name, STATE.user.last_name].filter(Boolean).join(' ') || STATE.user.username;
  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('cashier-portal').innerHTML = `
    <div class="staff-header">
      <div style="display:flex;align-items:center;gap:0.6rem">
        <div class="user-avatar" style="background:var(--orange)">${initials}</div>
        <div>
          <div style="font-weight:700">Cashier Portal</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${fullName}</div>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">${icons.logout} Logout</button>
    </div>
    <div class="staff-content" id="cashier-view"></div>
  `;
  showPage('cashier');
}

function renderCashierView(tab) {
  tab = tab || 'billing';
  const unpaid = (STATE.orders || []).filter(o => {
    if (o.status !== 'completed') return false;
    return !(STATE.payments || []).find(p => p.order === o.id && p.status === 'paid');
  });
  const paidToday = (STATE.payments || []).filter(p => {
    if (p.status !== 'paid') return false;
    return new Date(p.paid_at || p.created_at).toDateString() === new Date().toDateString();
  });
  const todayRevenue = paidToday.reduce((s,p) => s + parseFloat(p.grand_total), 0);

  const activeTakeaways   = (STATE.takeaways    || []).filter(t => !['picked_up','cancelled'].includes(t.status));
  const todayReservations = (STATE.reservations || []).filter(r => {
  if (['cancelled', 'no_show', 'completed'].includes(r.status)) return false;
  const today = new Date().toDateString();
  return new Date(r.reserved_date).toDateString() === today;
  });

  document.getElementById('cashier-view').innerHTML = `
    <div style="padding:1.5rem">

      <!-- Stats row -->
      <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:1.5rem">
        <div class="stat-card">
          <div class="stat-label">Bills Due</div>
          <div class="stat-value" style="color:var(--orange)">${unpaid.length}</div>
          <div class="stat-sub">Awaiting payment</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Revenue Today</div>
          <div class="stat-value" style="color:var(--green)">NRs ${todayRevenue.toFixed(2)}</div>
          <div class="stat-sub">${paidToday.length} payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Takeaways</div>
          <div class="stat-value" style="color:var(--blue)">${activeTakeaways.length}</div>
          <div class="stat-sub">In progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Today's Reservations</div>
          <div class="stat-value" style="color:var(--purple)">${todayReservations.length}</div>
          <div class="stat-sub">Upcoming</div>
        </div>
      </div>

      <!-- Tab bar -->
      <div style="display:flex;gap:0;border-bottom:2px solid var(--border);margin-bottom:1.5rem">
        ${[
          {id:'billing',     label:'Billing'},
          {id:'takeaway',    label:'Takeaway'},
          {id:'reservation', label:'Reservations'},
        ].map(t => `
          <button onclick="renderCashierView('${t.id}')"
            style="padding:0.6rem 1.25rem;font-weight:600;font-size:var(--text-sm);border:none;
                   background:none;cursor:pointer;border-bottom:2.5px solid ${tab===t.id ? 'var(--orange)' : 'transparent'};
                   color:${tab===t.id ? 'var(--orange)' : 'var(--text-muted)'};margin-bottom:-2px">
            ${t.label}
          </button>
        `).join('')}
        <div style="flex:1;display:flex;justify-content:flex-end;align-items:center;padding-bottom:0.4rem">
          <button class="btn btn-outline btn-sm" onclick="loadCashierData()">${icons.refresh} Refresh</button>
        </div>
      </div>

      <!-- Tab content -->
      <div id="cashier-tab-content">
        ${tab === 'billing'     ? cashierBillingTab(unpaid, paidToday)    : ''}
        ${tab === 'takeaway'    ? cashierTakeawayTab(activeTakeaways)     : ''}
        ${tab === 'reservation' ? cashierReservationTab(todayReservations): ''}
      </div>

      <!-- Modals (always in DOM) -->
      <div id="cashier-payment-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <div><div class="modal-title" id="cpm-title">Collect Payment</div><div class="modal-desc" id="cpm-desc"></div></div>
            <button class="modal-close" onclick="closeModal('cashier-payment-modal')">✕</button>
          </div>
          <div class="modal-body" id="cpm-body"></div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('cashier-payment-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="cashierSubmitPayment()">${icons.check} Confirm Payment</button>
          </div>
        </div>
      </div>

      <div id="cashier-qr-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width:380px">
          <div class="modal-header">
            <div><div class="modal-title">QR Payment</div><div class="modal-desc" id="cqr-desc"></div></div>
            <button class="modal-close" onclick="closeModal('cashier-qr-modal')">✕</button>
          </div>
          <div class="modal-body" id="cqr-body" style="text-align:center"></div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('cashier-qr-modal')">Close</button>
            <button class="btn btn-primary" onclick="cashierMarkQRPaid()">${icons.check} Mark as Paid</button>
          </div>
        </div>
      </div>

      <div id="takeaway-modal" class="modal-overlay hidden">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div><div class="modal-title">New Takeaway Order</div><div class="modal-desc">Fill customer details and select items</div></div>
            <button class="modal-close" onclick="closeModal('takeaway-modal')">✕</button>
          </div>
          <div class="modal-body" id="takeaway-modal-body">${buildTakeawayForm()}</div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('takeaway-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="submitTakeaway()"> Place Takeaway Order</button>
          </div>
        </div>
      </div>

      <div id="reservation-modal" class="modal-overlay hidden">
        <div class="modal">
          <div class="modal-header">
            <div><div class="modal-title" id="resv-modal-title">New Reservation</div></div>
            <button class="modal-close" onclick="closeModal('reservation-modal')">✕</button>
          </div>
          <div class="modal-body" id="reservation-modal-body">${buildReservationForm()}</div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="closeModal('reservation-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="submitReservation()"> Save Reservation</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ── Billing Tab ───────────────────────────────────────────────────────────────
function cashierBillingTab(unpaid, paidToday) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Bills Due for Payment</h2>
    </div>
    ${unpaid.length === 0
      ? '<div style="text-align:center;padding:2rem;background:var(--green-bg);border:1px solid var(--green-border);border-radius:var(--radius);color:var(--green);margin-bottom:1.5rem">✓ All bills are settled!</div>'
      : `<div class="orders-grid" style="margin-bottom:1.5rem">
          ${unpaid.map(o => `
            <div class="order-card" style="border:1.5px solid var(--orange)">
              <div class="order-card-header" style="background:var(--orange-light)">
                <span style="font-weight:700">Table ${o.table_number} — Order #${o.id}</span>
                <span class="badge badge-orange">Bill Due</span>
              </div>
              <div class="order-card-body">
                ${(o.items||[]).map(item => `
                  <div class="order-item-row">
                    <span>${item.quantity}x ${item.menu_item_name}</span>
                    <span>NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="order-total">
                  <span style="font-weight:700">Total</span>
                  <span style="color:var(--orange);font-size:1.1rem;font-weight:800">NRs ${parseFloat(o.total).toFixed(2)}</span>
                </div>
                <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
                  <button class="btn btn-primary w-full" onclick="cashierCollectPayment(${o.id},${o.total},${o.table_number})">${icons.check} Collect</button>
                  <button class="btn btn-outline" onclick="cashierShowQR(${o.id},${o.total},${o.table_number})">QR</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>`
    }
    <h2 style="font-size:1rem;font-weight:600;margin-bottom:1rem">Today's Payments</h2>
    ${paidToday.length === 0
      ? '<div class="empty-state"><p>No payments collected today</p></div>'
      : `<div class="card"><div class="card-content">
          ${paidToday.map(p => `
            <div class="order-item-row">
              <div>
                <div style="font-weight:600">Order #${p.order} — Table ${p.table_number}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">
                  ${new Date(p.paid_at||p.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${p.method.toUpperCase()}
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:700">NRs ${parseFloat(p.grand_total).toFixed(2)}</div>
                <span class="badge badge-green">paid</span>
              </div>
            </div>
          `).join('')}
        </div></div>`
    }
  `;
}

// ── Takeaway Tab ──────────────────────────────────────────────────────────────
function cashierTakeawayTab(activeTakeaways) {
  const statusColor = {
    pending:   {bg:'#fffbeb', border:'#d97706', badge:'badge-yellow'},
    preparing: {bg:'#eff6ff', border:'#2563eb', badge:'badge-blue'},
    ready:     {bg:'#f0fdf4', border:'#16a34a', badge:'badge-green'},
  };
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Active Takeaway Orders</h2>
      <button class="btn btn-primary btn-sm" onclick="openTakeawayModal()">New Takeaway</button>
    </div>
    ${activeTakeaways.length === 0
      ? '<div class="empty-state"><p>No active takeaway orders</p></div>'
      : `<div class="orders-grid">
          ${activeTakeaways.map(t => {
            const sc = statusColor[t.status] || {bg:'#f9f9f9', border:'#e5e7eb', badge:'badge-gray'};
            return `
              <div class="order-card" style="border:1.5px solid ${sc.border};background:${sc.bg}">
                <div class="order-card-header">
                  <div>
                    <div style="font-weight:700">#${t.id} — ${t.customer_name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">📞 ${t.customer_phone}</div>
                  </div>
                  <span class="badge ${sc.badge}">${t.status}</span>
                </div>
                <div class="order-card-body">
                  ${(t.takeaway_items||[]).map(item => `
                    <div class="order-item-row">
                      <span>${item.quantity}x ${item.menu_item_name}</span>
                      <span>NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                  <div class="order-total">
                    <span>Total</span>
                    <span style="font-weight:800">NRs ${parseFloat(t.total).toFixed(2)}</span>
                  </div>
                  <div style="font-size:0.75rem;color:var(--text-muted);margin:0.35rem 0">
                    ${t.is_paid ? ' Paid · ' : ' Unpaid · '} ${t.payment_method.toUpperCase()}
                    · ${new Date(t.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </div>

                  <!-- Kitchen status info (read-only for cashier) -->
                  ${t.status === 'pending' ? `
                    <div style="padding:0.5rem;background:#fffbeb;border:1px solid #d97706;border-radius:var(--radius);font-size:0.8rem;text-align:center;margin-bottom:0.5rem">
                       Waiting for kitchen to start preparing
                    </div>
                  ` : t.status === 'preparing' ? `
                    <div style="padding:0.5rem;background:#eff6ff;border:1px solid #2563eb;border-radius:var(--radius);font-size:0.8rem;text-align:center;margin-bottom:0.5rem">
                       Kitchen is preparing this order...
                    </div>
                  ` : t.status === 'ready' ? `
                    <div style="padding:0.5rem;background:#f0fdf4;border:1px solid #16a34a;border-radius:var(--radius);font-size:0.8rem;text-align:center;margin-bottom:0.5rem">
                       Ready for pickup!
                    </div>
                  ` : ''}

                  <!-- Cashier actions only -->
                  <div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.5rem">
                    ${t.status === 'ready' ? `
                      <button class="btn btn-primary w-full" onclick="takeawayPickedUp(${t.id},${t.is_paid})">
                         Mark Picked Up
                      </button>
                    ` : ''}
                    ${!t.is_paid ? `
                      <button class="btn btn-outline w-full btn-sm" onclick="takeawayMarkPaid(${t.id})">
                         Mark Paid
                      </button>
                    ` : ''}
                    ${t.status !== 'cancelled' ? `
                      <button class="btn btn-outline w-full btn-sm" style="color:#dc2626;border-color:#dc2626"
                        onclick="takeawaySetStatus(${t.id},'cancelled')">✕ Cancel</button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>`
    }
  `;
}

// ── Reservation Tab ───────────────────────────────────────────────────────────
function cashierReservationTab(todayReservations) {
  const statusColor = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    seated:    'badge-green',
    cancelled: 'badge-red',
    no_show:   'badge-gray',
  };
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Today's Reservations</h2>
      <button class="btn btn-primary btn-sm" onclick="openReservationModal()">New Reservation</button>
    </div>
    ${todayReservations.length === 0
      ? '<div class="empty-state"><p>No reservations for today</p></div>'
      : `<div style="display:flex;flex-direction:column;gap:0.75rem">
          ${todayReservations.map(r => `
            <div class="card" style="padding:0">
              <div style="padding:0.85rem 1rem;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem">
                <div>
                  <div style="font-weight:700;font-size:1rem">${r.customer_name}</div>
                  <div style="font-size:0.8rem;color:var(--text-muted)">
                     ${r.customer_phone}
                    ${r.customer_email ? ` · ✉️ ${r.customer_email}` : ''}
                  </div>
                  <div style="font-size:0.8rem;margin-top:0.25rem">
                     ${r.reserved_time?.slice(0,5)} · 👥 ${r.party_size} guests
                    ${r.table_number ? ` · Table ${r.table_number}` : ''}
                  </div>
                  ${r.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;font-style:italic">"${r.notes}"</div>` : ''}
                </div>
                <span class="badge ${statusColor[r.status] || 'badge-gray'}">${r.status}</span>
              </div>
              <div style="padding:0.5rem 1rem 0.85rem;display:flex;gap:0.4rem;flex-wrap:wrap">
                ${r.status === 'pending' ? `
                  <button class="btn btn-primary btn-sm" onclick="resvSetStatus(${r.id},'confirmed')">✓ Confirm</button>
                ` : ''}
                ${r.status === 'confirmed' ? `
                  <button class="btn btn-primary btn-sm" onclick="resvSetStatus(${r.id},'seated')">🍽️ Seat Guest</button>
                ` : ''}
                ${!['cancelled','no_show','seated'].includes(r.status) ? `
                  <button class="btn btn-outline btn-sm" onclick="resvSetStatus(${r.id},'no_show')">No Show</button>
                  <button class="btn btn-outline btn-sm" style="color:#dc2626;border-color:#dc2626" onclick="resvSetStatus(${r.id},'cancelled')">Cancel</button>
                ` : ''}
                <button class="btn btn-outline btn-sm" onclick="openEditReservationModal(${r.id})">Edit</button>
              </div>
            </div>
          `).join('')}
        </div>`
    }
  `;
}

// ── Takeaway Form ─────────────────────────────────────────────────────────────
function buildTakeawayForm() {
  const menu = (STATE.menuItems || []).filter(m => m.available);
  return `
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Customer Name *</label>
        <input class="form-input" id="tk-name" placeholder="Full name">
      </div>
      <div class="form-group">
        <label class="form-label">Phone *</label>
        <input class="form-input" id="tk-phone" placeholder="98XXXXXXXX">
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Payment Method</label>
        <select class="form-select" id="tk-method">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="qr">QR / Digital Wallet</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <input class="form-input" id="tk-notes" placeholder="Special instructions">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Select Items</label>
      <input class="form-input" id="tk-search" placeholder="🔍 Search menu..." oninput="tkFilterMenu(this.value)" style="margin-bottom:0.5rem">
      <div id="tk-menu-list" style="border:1px solid var(--border);border-radius:var(--radius);max-height:220px;overflow-y:auto;padding:0.4rem;display:flex;flex-direction:column;gap:0.3rem">
        ${menu.map(item => `
          <div class="tk-menu-row" data-name="${item.name.toLowerCase()}"
            style="display:flex;justify-content:space-between;align-items:center;padding:0.45rem 0.6rem;background:var(--bg);border-radius:var(--radius)">
            <div>
              <div style="font-weight:500;font-size:var(--text-sm)">${item.name}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">NRs ${parseFloat(item.price).toFixed(2)}</div>
            </div>
            <div id="tk-ctrl-${item.id}">
              <button class="btn btn-primary btn-sm" onclick="tkAddItem(${item.id},${item.price},'${item.name.replace(/'/g,"\'")}')">Add</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div id="tk-summary" class="hidden" style="background:var(--bg);border-radius:var(--radius);padding:0.75rem;margin-top:0.25rem">
      <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:0.35rem">Order Summary:</div>
      <div id="tk-summary-items"></div>
      <div class="order-total" id="tk-summary-total"><span>Total</span><span>NRs 0.00</span></div>
    </div>
  `;
}

let tkCart = {};

function openTakeawayModal() {
  tkCart = {};
  const body = document.getElementById('takeaway-modal-body');
  if (body) body.innerHTML = buildTakeawayForm();
  openModal('takeaway-modal');
}

function tkFilterMenu(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('#tk-menu-list .tk-menu-row').forEach(row => {
    row.style.display = (!q || row.getAttribute('data-name').includes(q)) ? '' : 'none';
  });
}

function tkAddItem(id, price, name) {
  if (tkCart[id]) tkCart[id].qty++;
  else tkCart[id] = { qty:1, price:parseFloat(price), name };
  const ctrl = document.getElementById('tk-ctrl-'+id);
  if (ctrl) {
    ctrl.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.3rem">
        <button class="btn btn-outline btn-sm" onclick="tkRemoveItem(${id})">-</button>
        <span style="width:1.5rem;text-align:center;font-weight:600">${tkCart[id].qty}</span>
        <button class="btn btn-outline btn-sm" onclick="tkAddItem(${id},${price},'${name.replace(/'/g,"\'")}')">+</button>
      </div>`;
  }
  tkUpdateSummary();
}

function tkRemoveItem(id) {
  if (!tkCart[id]) return;
  tkCart[id].qty--;
  if (tkCart[id].qty <= 0) delete tkCart[id];
  const item = (STATE.menuItems||[]).find(m => m.id === id);
  const ctrl = document.getElementById('tk-ctrl-'+id);
  if (ctrl) {
    if (!tkCart[id]) {
      ctrl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="tkAddItem(${id},${item?.price},'${item?.name?.replace(/'/g,"\'")}')">Add</button>`;
    } else {
      ctrl.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.3rem">
          <button class="btn btn-outline btn-sm" onclick="tkRemoveItem(${id})">-</button>
          <span style="width:1.5rem;text-align:center;font-weight:600">${tkCart[id].qty}</span>
          <button class="btn btn-outline btn-sm" onclick="tkAddItem(${id},${item?.price},'${item?.name?.replace(/'/g,"\'")}')">+</button>
        </div>`;
    }
  }
  tkUpdateSummary();
}

function tkUpdateSummary() {
  const summary  = document.getElementById('tk-summary');
  const itemsDiv = document.getElementById('tk-summary-items');
  const totalDiv = document.getElementById('tk-summary-total');
  const entries  = Object.entries(tkCart);
  if (!entries.length) { summary?.classList.add('hidden'); return; }
  summary?.classList.remove('hidden');
  let tot = 0;
  if (itemsDiv) itemsDiv.innerHTML = entries.map(([id,{qty,price,name}]) => {
    tot += qty * price;
    return `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:0.2rem"><span>${qty}x ${name}</span><span>NRs ${(qty*price).toFixed(2)}</span></div>`;
  }).join('');
  if (totalDiv) totalDiv.innerHTML = `<span>Total</span><span>NRs ${tot.toFixed(2)}</span>`;
}

async function submitTakeaway() {
  const name   = document.getElementById('tk-name')?.value.trim();
  const phone  = document.getElementById('tk-phone')?.value.trim();
  const method = document.getElementById('tk-method')?.value;
  const notes  = document.getElementById('tk-notes')?.value || '';
  if (!name)  { toast('Customer name is required', 'error'); return; }
  if (!phone) { toast('Phone number is required',  'error'); return; }
  if (!Object.keys(tkCart).length) { toast('Please add at least one item', 'error'); return; }
  try {
    await api.post('/orders/takeaways/', {
      customer_name: name, customer_phone: phone,
      payment_method: method, notes,
      items: Object.entries(tkCart).map(([id,{qty}]) => ({ menu_item: parseInt(id), quantity: qty })),
    });
    closeModal('takeaway-modal');
    toast('Takeaway order placed!');
    loadCashierData();
  } catch(e) {
    try { const err = JSON.parse(e.message); toast(Object.values(err).flat()[0] || 'Failed', 'error'); }
    catch { toast('Failed to place takeaway order', 'error'); }
  }
}

async function takeawaySetStatus(id, newStatus) {
  try {
    await api.patch('/orders/takeaways/'+id+'/set-status/', { status: newStatus });
    toast('Takeaway updated!');
    loadCashierData();
  } catch { toast('Failed to update takeaway', 'error'); }
}

async function takeawayPickedUp(id, isPaid) {
  if (!isPaid) {
    if (!confirm('This order is not yet paid. Mark as picked up anyway?')) return;
  }
  await takeawaySetStatus(id, 'picked_up');
}

async function takeawayMarkPaid(id) {
  const method = prompt('Payment method? (cash / card / qr)', 'cash');
  if (!method) return;
  try {
    await api.patch('/orders/takeaways/'+id+'/mark-paid/', { payment_method: method });
    toast('Marked as paid!');
    loadCashierData();
  } catch { toast('Failed to mark as paid', 'error'); }
}

// ── Reservation Form ──────────────────────────────────────────────────────────
function buildReservationForm(r) {
  const today = new Date().toISOString().split('T')[0];
  return `
    <input type="hidden" id="resv-id" value="${r?.id || ''}">
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Customer Name *</label>
        <input class="form-input" id="resv-name" value="${r?.customer_name || ''}" placeholder="Full name">
      </div>
      <div class="form-group">
        <label class="form-label">Phone *</label>
        <input class="form-input" id="resv-phone" value="${r?.customer_phone || ''}" placeholder="98XXXXXXXX">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Email (optional)</label>
      <input class="form-input" id="resv-email" type="email" value="${r?.customer_email || ''}" placeholder="customer@email.com">
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Date *</label>
        <input class="form-input" id="resv-date" type="date" value="${r?.reserved_date || today}" min="${today}">
      </div>
      <div class="form-group">
        <label class="form-label">Time *</label>
        <input class="form-input" id="resv-time" type="time" value="${r?.reserved_time?.slice(0,5) || ''}">
      </div>
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Party Size *</label>
        <input class="form-input" id="resv-party" type="number" min="1" value="${r?.party_size || 2}">
      </div>
      <div class="form-group">
        <label class="form-label">Table (optional)</label>
        <select class="form-select" id="resv-table">
          <option value="">Auto-assign</option>
          ${(STATE.tables||[]).map(t => `<option value="${t.id}" ${r?.table === t.id ? 'selected':''}>Table ${t.number} (${t.capacity} seats)</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <textarea class="form-textarea" id="resv-notes" placeholder="Dietary requirements, special occasion...">${r?.notes || ''}</textarea>
    </div>
  `;
}

function openReservationModal() {
  document.getElementById('resv-modal-title').textContent = 'New Reservation';
  document.getElementById('reservation-modal-body').innerHTML = buildReservationForm();
  openModal('reservation-modal');
}

function openEditReservationModal(resvId) {
  const r = (STATE.reservations||[]).find(r => r.id === resvId);
  if (!r) return;
  document.getElementById('resv-modal-title').textContent = 'Edit Reservation';
  document.getElementById('reservation-modal-body').innerHTML = buildReservationForm(r);
  openModal('reservation-modal');
}

async function submitReservation() {
  const id     = document.getElementById('resv-id')?.value;
  const name   = document.getElementById('resv-name')?.value.trim();
  const phone  = document.getElementById('resv-phone')?.value.trim();
  const email  = document.getElementById('resv-email')?.value.trim();
  const date   = document.getElementById('resv-date')?.value;
  const time   = document.getElementById('resv-time')?.value;
  const party  = document.getElementById('resv-party')?.value;
  const table  = document.getElementById('resv-table')?.value;
  const notes  = document.getElementById('resv-notes')?.value || '';
  if (!name)  { toast('Customer name is required', 'error'); return; }
  if (!phone) { toast('Phone number is required',  'error'); return; }
  if (!date)  { toast('Date is required',          'error'); return; }
  if (!time)  { toast('Time is required',          'error'); return; }
  const body = {
    customer_name: name, customer_phone: phone,
    customer_email: email, reserved_date: date,
    reserved_time: time, party_size: parseInt(party),
    table: table ? parseInt(table) : null, notes,
  };
  try {
    if (id) {
      await api.patch('/orders/reservations/'+id+'/', body);
    } else {
      const newResv = await api.post('/orders/reservations/', body);
      const assignedTable = newResv.table_number
        ? `Table ${newResv.table_number} assigned.`
        : 'No available table found — please assign manually.';
      closeModal('reservation-modal');
      toast(`Reservation saved! ${assignedTable}`);
      // Refresh tables so admin/waiter see the reserved table
      const tables = await api.get('/orders/tables/');
      STATE.tables = tables.results ?? tables;
      try { _syncChannel.postMessage('tables_updated'); } catch(e) {}
      loadCashierData();
      return;
    }
    closeModal('reservation-modal');
    toast(id ? 'Reservation updated!' : 'Reservation saved!');
    loadCashierData();
  } catch(e) {
    try { const err = JSON.parse(e.message); toast(Object.values(err).flat()[0] || 'Failed', 'error'); }
    catch { toast('Failed to save reservation', 'error'); }
  }
}

async function resvSetStatus(id, newStatus) {
  try {
    await api.patch('/orders/reservations/'+id+'/set-status/', { status: newStatus });

const tables = await api.get('/orders/tables/');
    STATE.tables = tables.results ?? tables;
    try { _syncChannel.postMessage('tables_updated'); } catch(e) {}

    toast('Reservation updated!');
    loadCashierData();
  } catch { toast('Failed to update reservation', 'error'); }
}

// ── Cashier Payment Functions ─────────────────────────────────────────────────
let _cPayOrderId = null;
let _cPayAmount  = null;
let _cQROrderId  = null;
let _cQRAmount   = null;

function cashierCollectPayment(orderId, amount, tableNum) {
  _cPayOrderId = orderId;
  _cPayAmount  = parseFloat(amount);
  document.getElementById('cpm-title').textContent = `Collect Payment — Table ${tableNum}`;
  document.getElementById('cpm-desc').textContent  = `Order #${orderId}`;
  document.getElementById('cpm-body').innerHTML = `
    <div style="background:var(--bg);border-radius:var(--radius);padding:1rem;margin-bottom:1rem;text-align:center">
      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem">Bill Amount</div>
      <div style="font-size:2rem;font-weight:800;color:var(--orange)">NRs ${_cPayAmount.toFixed(2)}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Payment Method</label>
      <div style="display:flex;gap:0.5rem">
        <button id="cpm-cash" class="btn btn-primary w-full" onclick="cSelectMethod('cash')">💵 Cash</button>
        <button id="cpm-card" class="btn btn-outline w-full" onclick="cSelectMethod('card')">💳 Card</button>
        <button id="cpm-qr"   class="btn btn-outline w-full" onclick="cSelectMethod('qr')">QR</button>
      </div>
      <input type="hidden" id="cpm-method" value="cash">
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Tip (NRs)</label>
        <input class="form-input" type="number" id="cpm-tip" value="0" min="0" oninput="cUpdateTotal()">
      </div>
      <div class="form-group">
        <label class="form-label">Discount (NRs)</label>
        <input class="form-input" type="number" id="cpm-discount" value="0" min="0" oninput="cUpdateTotal()">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Note (optional)</label>
      <input class="form-input" id="cpm-note" placeholder="e.g. paid by card">
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
      <span style="font-weight:600">Grand Total</span>
      <span style="font-size:1.3rem;font-weight:800;color:var(--green)" id="cpm-grand">NRs ${_cPayAmount.toFixed(2)}</span>
    </div>
  `;
  openModal('cashier-payment-modal');
}

function cSelectMethod(m) {
  document.getElementById('cpm-method').value = m;
  ['cash','card','qr'].forEach(x => {
    const btn = document.getElementById('cpm-'+x);
    if (btn) btn.className = x === m ? 'btn btn-primary w-full' : 'btn btn-outline w-full';
  });
}

function cUpdateTotal() {
  const tip      = parseFloat(document.getElementById('cpm-tip')?.value)      || 0;
  const discount = parseFloat(document.getElementById('cpm-discount')?.value) || 0;
  const grand    = Math.max(0, _cPayAmount + tip - discount);
  const el = document.getElementById('cpm-grand');
  if (el) el.textContent = 'NRs ' + grand.toFixed(2);
}

async function cashierSubmitPayment() {
  const method   = document.getElementById('cpm-method').value;
  const tip      = parseFloat(document.getElementById('cpm-tip').value)      || 0;
  const discount = parseFloat(document.getElementById('cpm-discount').value) || 0;
  const note     = document.getElementById('cpm-note').value;
  try {
    await api.post('/orders/payments/', { order_id: _cPayOrderId, method, tip, discount, note });
    closeModal('cashier-payment-modal');
    toast('Payment recorded successfully!');
    loadCashierData();
  } catch(e) {
    try { const err = JSON.parse(e.message); toast(Object.values(err).flat()[0] || 'Payment failed', 'error'); }
    catch { toast('Failed to record payment', 'error'); }
  }
}

function cashierShowQR(orderId, amount, tableNum) {
  _cQROrderId = orderId;
  _cQRAmount  = parseFloat(amount);
  document.getElementById('cqr-desc').textContent = 'Table ' + tableNum + ' — Order #' + orderId;
  document.getElementById('cqr-body').innerHTML = `
    <div style="margin-bottom:1rem">
      <div style="font-size:0.85rem;color:var(--text-muted)">Amount Due</div>
      <div style="font-size:2rem;font-weight:800;color:var(--orange)">NRs ${_cQRAmount.toFixed(2)}</div>
    </div>
    <div id="cqr-canvas" style="display:flex;justify-content:center;margin:1rem 0"></div>
    <p style="font-size:0.8rem;color:var(--text-muted)">Scan to pay via eSewa / Khalti / IME Pay</p>
  `;
  const qrData = encodeURIComponent('FEASTIO|Order#'+orderId+'|Table'+tableNum+'|NRs'+_cQRAmount.toFixed(2));
  const img = document.createElement('img');
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='+qrData+'&bgcolor=ffffff&color=1a1a1a&margin=10';
  img.style.cssText = 'width:200px;height:200px;border-radius:8px;border:2px solid var(--border)';
  img.alt = 'QR Code';
  document.getElementById('cqr-canvas').appendChild(img);
  openModal('cashier-qr-modal');
}

async function cashierMarkQRPaid() {
  try {
    await api.post('/orders/payments/', { order_id: _cQROrderId, method: 'qr', tip:0, discount:0, note:'Paid via QR' });
    closeModal('cashier-qr-modal');
    toast('QR payment confirmed!');
    loadCashierData();
  } catch { toast('Failed to mark as paid', 'error'); }
}

// ── Staff Portal ──────────────────────────────────────────────────────────────

function renderStaffPortal() {
  const role     = STATE.user.role;
  const fullName = [STATE.user.first_name, STATE.user.last_name].filter(Boolean).join(' ') || STATE.user.username;
  const initials = fullName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const portalLabel = role === 'kitchen' ? 'Kitchen' : 'Waiter';
  const portalIcon  = role === 'kitchen' ? icons.chef : icons.waiter;
  document.getElementById('staff-portal').innerHTML = `
    <div class="staff-header">
      <div style="display:flex;align-items:center;gap:0.6rem">
        <div class="sidebar-logo-icon" style="width:1.75rem;height:1.75rem;font-size:0.9rem">${portalIcon}</div>
        <div>
          <div style="font-weight:700">${portalLabel} Portal</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${fullName}</div>
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logout()">${icons.logout} Logout</button>
    </div>
    <div class="staff-content" id="staff-view"></div>
  `;
  showPage('staff');
}


function renderWaiterView() {
  const active    = STATE.orders.filter(o => o.status === 'active');
  const available = STATE.tables.filter(t => t.status === 'available');

  document.getElementById('staff-view').innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat-card"><div class="stat-label">Available Tables</div><div class="stat-value" style="color:var(--green)">${available.length}</div></div>
      <div class="stat-card"><div class="stat-label">Active Orders</div><div class="stat-value" style="color:var(--orange)">${active.length}</div></div>
      <div class="stat-card" style="display:flex;align-items:center;justify-content:center">
        <button class="btn btn-primary w-full" onclick="openWaiterOrderModal()">${icons.plus} New Order</button>
      </div>
      <div class="stat-card" style="display:flex;align-items:center;justify-content:center">
        <button class="btn btn-outline w-full" onclick="toggleWaiterHistory()">${icons.orders} Order History</button>
      </div>
    </div>

    <!-- Order History (hidden by default) -->
<div id="waiter-history-section" class="hidden" style="margin-bottom:2rem">

  <!-- Header -->
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
    <h2 style="font-size:1.1rem;font-weight:700">Order History</h2>
    <button class="btn btn-outline btn-sm" onclick="toggleWaiterHistory()">✕ Close</button>
  </div>

  <!-- Filters -->
  <div style="background:white;border:1px solid var(--border);border-radius:var(--radius);padding:1rem;margin-bottom:1rem">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:0.75rem;align-items:flex-end">
      <div class="form-group" style="margin:0">
        <label class="form-label">From</label>
        <input class="form-input" type="date" id="wh-from" style="margin:0">
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label">To</label>
        <input class="form-input" type="date" id="wh-to" style="margin:0">
      </div>
      <div class="form-group" style="margin:0">
        <label class="form-label">Status</label>
        <select class="form-select" id="wh-status" style="margin:0">
          <option value="">All past</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="loadWaiterHistory(1)" style="white-space:nowrap">
        Search
      </button>
    </div>
  </div>

  <!-- Results -->
  <div id="wh-results">
    <div class="empty-state"><p>Select dates and click Search.</p></div>
  </div>

</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Tables <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted)">(tap a table to manage)</span></h2>
      <button class="btn btn-outline btn-sm" onclick="loadStaffData()">${icons.refresh} Refresh</button>
    </div>
    <div class="tables-grid" style="margin-bottom:1.5rem">
      ${STATE.tables.map(t => {
        const order = STATE.orders.find(o => o.table === t.id && o.status === 'active');
        const colors = {
          available: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d' },
          occupied:  { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' },
          reserved:  { bg: '#fffbeb', border: '#d97706', text: '#d97706' },
        };
        const c = colors[t.status] || colors.available;
        return `
          <div class="table-card" onclick="waiterOpenTableModal(${t.id})"
            style="cursor:pointer;background:${c.bg};border:1.5px solid ${c.border};text-align:center">
            <div class="table-status-dot ${t.status==='available'?'dot-green':t.status==='occupied'?'dot-red':'dot-yellow'}" style="margin:0 auto 0.35rem"></div>
            <div style="font-weight:700;color:${c.text}">Table ${t.number}</div>
            <div style="font-size:0.75rem;color:${c.text};opacity:0.8">${t.capacity} seats</div>
            <div style="font-size:0.7rem;margin-top:0.2rem;color:${c.text};opacity:0.7">${t.status}</div>
            ${order ? `<div style="font-size:0.8rem;color:${c.text};font-weight:700;margin-top:0.3rem">NRs ${parseFloat(order.total).toFixed(2)}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Active Orders</h2>
    </div>
    <div class="orders-grid">
      ${active.length === 0 ? '<div class="empty-state"><p>No active orders</p></div>' :
        active.map(o => `
          <div class="order-card">
            <div class="order-card-header">
              <span style="font-weight:700">Table ${o.table_number}</span>
              <span class="badge badge-orange">${new Date(o.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div class="order-card-body">
              ${(o.items||[]).map(item => `
                <div class="order-item-row">
                  <span>${item.quantity}x ${item.menu_item_name}</span>
                  <span class="badge ${item.status==='ready'?'badge-green':item.status==='preparing'?'badge-blue':'badge-yellow'}">${item.status}</span>
                </div>
              `).join('')}
              <div class="order-total"><span>Total</span><span>NRs ${parseFloat(o.total).toFixed(2)}</span></div>
              <div class="order-actions" style="margin-top:0.5rem">
                <button class="btn btn-outline w-full btn-sm" onclick="waiterOpenTableModal(${o.table})">${icons.orders} Manage Table</button>
              </div>
            </div>
          </div>
        `).join('')}
    </div>
    ${waiterOrderModal()}
    ${waiterTableModal()}
  `;
}

function toggleWaiterHistory() {
  const section = document.getElementById('waiter-history-section');
  if (!section) return;
  const isHidden = section.classList.contains('hidden');
  section.classList.toggle('hidden');
  if (isHidden) loadWaiterHistory();
}
// ── Waiter Order History with Pagination ──────────────────────────────────────
let _whOrders  = [];
let _whPage    = 1;
const _whPageSize = 8;

async function loadWaiterHistory(page = 1) {
  const fromVal   = document.getElementById('wh-from')?.value;
  const toVal     = document.getElementById('wh-to')?.value;
  const statusVal = document.getElementById('wh-status')?.value;
  const resultsEl = document.getElementById('wh-results');
  if (!resultsEl) return;

  if (page === 1) {
    resultsEl.innerHTML = `<div class="empty-state"><p>Loading...</p></div>`;
    try {
      let url = '/orders/orders/';
      if (statusVal) url += `?status=${statusVal}`;
      const data = await api.get(url);
      _whOrders = (data.results ?? data).filter(o => o.status !== 'active');
      if (fromVal) _whOrders = _whOrders.filter(o => new Date(o.created_at) >= new Date(fromVal));
      if (toVal)   _whOrders = _whOrders.filter(o => new Date(o.created_at) <= new Date(toVal + 'T23:59:59'));
    } catch {
      resultsEl.innerHTML = `<div class="empty-state"><p style="color:#dc2626">Failed to load.</p></div>`;
      return;
    }
  }

  _whPage = page;

  if (_whOrders.length === 0) {
    resultsEl.innerHTML = `<div class="empty-state"><p>No orders found.</p></div>`;
    return;
  }

  const totalPages = Math.ceil(_whOrders.length / _whPageSize);
  const start      = (page - 1) * _whPageSize;
  const end        = start + _whPageSize;
  const pageOrders = _whOrders.slice(start, end);

  resultsEl.innerHTML = `
    <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:0.75rem">
      Showing ${start + 1}–${Math.min(end, _whOrders.length)} of ${_whOrders.length} orders
    </div>

    <div class="card">
      <div class="card-content">
        ${pageOrders.map(o => `
          <div class="order-item-row" style="flex-direction:column;align-items:stretch;padding:0.75rem 0;cursor:pointer"
            onclick="toggleOrderHistoryDetail('wh-${o.id}')">

            <!-- Top row — looks exactly like payment history -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:600">
                  Order #${o.id} — Table ${o.table_number}
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.15rem">
                  ${new Date(o.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                  · ${(o.items||[]).length} item${(o.items||[]).length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0">
                <div style="text-align:right">
                  <div style="font-weight:700">NRs ${parseFloat(o.total).toFixed(2)}</div>
                  <span class="badge ${o.status === 'completed' ? 'badge-green' : 'badge-red'}">${o.status}</span>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted)" id="oh-toggle-wh-${o.id}">▼</span>
              </div>
            </div>

            <!-- Expandable items section -->
            <div id="oh-detail-wh-${o.id}" class="hidden"
              style="margin-top:0.75rem;padding:0.75rem;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
              ${(o.items||[]).map(item => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.3rem 0;border-bottom:1px solid var(--border)">
                  <span style="font-size:var(--text-sm)">${item.quantity}x ${item.menu_item_name}</span>
                  <span style="font-size:var(--text-sm);font-weight:600">NRs ${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div style="display:flex;justify-content:space-between;font-weight:700;padding-top:0.5rem;margin-top:0.25rem">
                <span>Total</span>
                <span>NRs ${parseFloat(o.total).toFixed(2)}</span>
              </div>
              ${o.completed_at ? `
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.35rem">
                  Completed: ${new Date(o.completed_at).toLocaleString()}
                </div>
              ` : ''}
            </div>

          </div>
        `).join('')}
      </div>
    </div>

    <!-- Pagination -->
    ${totalPages > 1 ? `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem;flex-wrap:wrap;gap:0.5rem">
        <div style="font-size:var(--text-sm);color:var(--text-muted)">Page ${page} of ${totalPages}</div>
        <div style="display:flex;gap:0.35rem">
          <button class="btn btn-outline btn-sm" onclick="loadWaiterHistory(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹ Prev</button>
          ${Array.from({length: totalPages}, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map(p => p === '...'
              ? `<span style="padding:0 0.25rem;color:var(--text-muted)">…</span>`
              : `<button class="btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}"
                  onclick="loadWaiterHistory(${p})">${p}</button>`
            ).join('')}
          <button class="btn btn-outline btn-sm" onclick="loadWaiterHistory(${page + 1})" ${page === totalPages ? 'disabled' : ''}>Next ›</button>
        </div>
      </div>
    ` : ''}
  `;
}
// ── Waiter Table Modal ────────────────────────────────────────────────────────
function waiterTableModal() {
  return `
    <div id="waiter-table-modal" class="modal-overlay hidden">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div>
            <div class="modal-title" id="wtm-title">Table</div>
            <div class="modal-desc" id="wtm-desc"></div>
          </div>
          <button class="modal-close" onclick="closeModal('waiter-table-modal')">✕</button>
        </div>
        <div class="modal-body" id="wtm-body" style="padding-top:0"></div>
        <div class="modal-footer" id="wtm-footer">
          <button class="btn btn-outline" onclick="closeModal('waiter-table-modal')">Close</button>
        </div>
      </div>
    </div>
  `;
}

function waiterOpenTableModal(tableId) {
  const t     = STATE.tables.find(t => t.id === tableId);
  const order = STATE.orders.find(o => o.table === tableId && o.status === 'active');
  if (!t) return;

  document.getElementById('wtm-title').textContent = `Table ${t.number}`;
  document.getElementById('wtm-desc').textContent  = `${t.capacity} seats`;

  const menuAvail = STATE.menuItems.filter(m => m.available);

  // colour helpers
  const statusColor = { available:'#16a34a', occupied:'#dc2626', reserved:'#d97706' };
  const statusBg    = { available:'#f0fdf4', occupied:'#fef2f2', reserved:'#fffbeb' };
  const sc = statusColor[t.status] || '#888';
  const sb = statusBg[t.status]   || '#f9f9f9';

  // build menu rows HTML (shared between new-order and add-items sections)
  function menuRows(idPrefix) {
    return menuAvail.map(item => `
      <div class="wtm-menu-row" data-name="${item.name.toLowerCase()}"
        style="display:flex;justify-content:space-between;align-items:center;
               padding:0.5rem 0.6rem;background:var(--bg);border-radius:var(--radius)">
        <div>
          <div style="font-weight:500;font-size:var(--text-sm)">${item.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">NRs ${parseFloat(item.price).toFixed(2)}</div>
        </div>
        <div id="${idPrefix}-ctrl-${item.id}">
          <button class="btn btn-primary btn-sm"
            onclick="wtmAddItem(${item.id}, ${item.price}, '${item.name.replace(/'/g,"\\'")}', '${idPrefix}')">Add</button>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('wtm-body').innerHTML = `

    <!-- ── Top bar: status pill + change-status buttons ── -->
    <div style="background:${sb};border-bottom:1px solid var(--border);
                padding:0.75rem 1.25rem;display:flex;align-items:center;
                justify-content:space-between;flex-wrap:wrap;gap:0.5rem">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <span style="width:10px;height:10px;border-radius:50%;background:${sc};display:inline-block"></span>
        <span style="font-weight:700;color:${sc};text-transform:capitalize">${t.status}</span>
        ${order ? `<span style="font-size:0.75rem;color:var(--text-muted)">· Order #${order.id}</span>` : ''}
      </div>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
        <span style="font-size:0.75rem;color:var(--text-muted);align-self:center">Change status:</span>
        ${t.status !== 'available' ? `
          <button class="btn btn-sm" onclick="wtmChangeStatus(${t.id},'available')"
            style="background:#f0fdf4;color:#16a34a;border:1px solid #16a34a;font-size:0.75rem;padding:0.2rem 0.6rem">
            ✓ Available
          </button>` : ''}
        ${t.status !== 'reserved' ? `
          <button class="btn btn-sm" onclick="wtmChangeStatus(${t.id},'reserved')"
            style="background:#fffbeb;color:#d97706;border:1px solid #d97706;font-size:0.75rem;padding:0.2rem 0.6rem">
            🔒 Reserved
          </button>` : ''}
        ${t.status !== 'occupied' ? `
          <button class="btn btn-sm" onclick="wtmChangeStatus(${t.id},'occupied')"
            style="background:#fef2f2;color:#dc2626;border:1px solid #dc2626;font-size:0.75rem;padding:0.2rem 0.6rem">
            🔴 Occupied
          </button>` : ''}
      </div>
    </div>

    <div style="padding:1rem 1.25rem">

    ${order ? `
      <!-- ── EXISTING ORDER section ── -->
      <div style="margin-bottom:1rem">
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;color:var(--text-muted);
                    text-transform:uppercase;margin-bottom:0.6rem">Current Order</div>
        ${(order.items||[]).map(item => `
          <div class="order-item-row">
            <div style="flex:1">
              <div style="font-weight:500">${item.quantity}x ${item.menu_item_name}</div>
              <span class="badge ${item.status==='ready'?'badge-green':item.status==='preparing'?'badge-blue':item.status==='served'?'badge-gray':'badge-yellow'}">${item.status}</span>
            </div>
            <span style="font-weight:600">NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="order-total">
          <span>Current Total</span>
          <span style="color:var(--orange);font-weight:800">NRs ${parseFloat(order.total).toFixed(2)}</span>
        </div>
      </div>

      <!-- ── Add more items ── -->
      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;color:var(--text-muted);
                  text-transform:uppercase;margin-bottom:0.5rem">Add More Items</div>
      <input class="form-input" id="wtm-search-add" placeholder="🔍 Search menu..."
        oninput="wtmFilterMenu('add')"
        style="margin-bottom:0.5rem;width:100%;box-sizing:border-box">
      <div id="wtm-menu-add"
        style="border:1px solid var(--border);border-radius:var(--radius);
               max-height:200px;overflow-y:auto;padding:0.4rem;
               display:flex;flex-direction:column;gap:0.3rem">
        ${menuRows('add')}
      </div>
      <div id="wtm-add-summary" class="hidden"
        style="background:var(--bg);border-radius:var(--radius);padding:0.75rem;margin-top:0.5rem">
        <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:0.35rem">Adding to order:</div>
        <div id="wtm-add-items"></div>
      </div>
      <button class="btn btn-primary w-full" style="margin-top:0.75rem"
        onclick="wtmSubmitAddItems(${order.id}, ${tableId})">
        ${icons.plus} Add Items to Order
      </button>

    ` : `
      <!-- ── NEW ORDER section ── -->
      ${t.status !== 'available' ? `
        <div style="padding:0.5rem 0.75rem;background:#fffbeb;border:1px solid #d97706;
                    border-radius:var(--radius);font-size:var(--text-sm);color:#92400e;margin-bottom:0.75rem">
           Table is <strong>${t.status}</strong> — you can still place an order.
        </div>` : ''}

      <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;color:var(--text-muted);
                  text-transform:uppercase;margin-bottom:0.5rem">Select Items</div>
      <input class="form-input" id="wtm-search-new" placeholder="🔍 Search menu..."
        oninput="wtmFilterMenu('new')"
        style="margin-bottom:0.5rem;width:100%;box-sizing:border-box">
      <div id="wtm-menu-new"
        style="border:1px solid var(--border);border-radius:var(--radius);
               max-height:240px;overflow-y:auto;padding:0.4rem;
               display:flex;flex-direction:column;gap:0.3rem">
        ${menuRows('new')}
      </div>
      <div id="wtm-add-summary" class="hidden"
        style="background:var(--bg);border-radius:var(--radius);padding:0.75rem;margin-top:0.5rem">
        <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:0.35rem">Order Summary:</div>
        <div id="wtm-add-items"></div>
        <div class="order-total" id="wtm-new-total"><span>Total</span><span>NRs 0.00</span></div>
      </div>
    `}

    </div>
  `;

  document.getElementById('wtm-footer').innerHTML = order ? `
    <button class="btn btn-outline" onclick="closeModal('waiter-table-modal')">Close</button>
    <button class="btn btn-outline" style="color:#dc2626;border-color:#dc2626" onclick="wtmCancelOrder(${order.id})">Cancel Order</button>
    <button class="btn btn-primary" onclick="wtmCompleteAndPay(${order.id}, ${order.total}, ${t.number})">
      ${icons.check} Complete & Pay
    </button>
  ` : `
    <button class="btn btn-outline" onclick="closeModal('waiter-table-modal')">Cancel</button>
    <button class="btn btn-primary" onclick="wtmSubmitNewOrder(${tableId})">${icons.plus} Place Order</button>
  `;

  wtmCart = {};
  openModal('waiter-table-modal');
}

// ── Waiter Complete Order & Pay ──────────────────────────────────────────────
async function wtmCompleteAndPay(orderId, amount, tableNum) {
  const order = STATE.orders.find(o => o.id === orderId);
  const notReady = (order?.items || []).filter(i => !['ready','served'].includes(i.status));
  if (notReady.length > 0) {
    const names = notReady.map(i => i.menu_item_name).join(', ');
    toast(`Kitchen hasn't finished yet: ${names}`, 'error');
    return;
  }
  if (!confirm(`Complete order for Table ${tableNum}`)) return;
  try {
    await api.patch(`/orders/orders/${orderId}/complete/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    toast('Order completed !');
    closeModal('waiter-table-modal');
    renderWaiterView();
  } catch { toast('Failed to complete order', 'error'); }
}

async function wtmCancelOrder(orderId) {
  if (!confirm('Cancel this order?')) return;
  try {
    await api.patch(`/orders/orders/${orderId}/cancel/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('waiter-table-modal');
    renderWaiterView();
    toast('Order cancelled');
  } catch { toast('Failed to cancel order', 'error'); }
}

// ── Menu search filter ────────────────────────────────────────────────────────
function wtmFilterMenu(prefix) {
  const input = document.getElementById(`wtm-search-${prefix}`);
  const menu  = document.getElementById(`wtm-menu-${prefix}`);
  if (!input || !menu) return;
  const q = input.value.toLowerCase().trim();
  menu.querySelectorAll('.wtm-menu-row').forEach(row => {
    const name = row.getAttribute('data-name') || '';
    row.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

// ── Change table status ───────────────────────────────────────────────────────
async function wtmChangeStatus(tableId, newStatus) {
  try {
    await api.patch(`/orders/tables/${tableId}/`, { status: newStatus });
    const tables = await api.get('/orders/tables/');
    STATE.tables = tables.results ?? tables;
    toast(`Table marked as ${newStatus}`);
    closeModal('waiter-table-modal');
    renderWaiterView();
  } catch { toast('Failed to update table status', 'error'); }
}

// ── Cart logic ────────────────────────────────────────────────────────────────
let wtmCart = {};

function wtmAddItem(itemId, price, name, prefix) {
  if (wtmCart[itemId]) wtmCart[itemId].qty++;
  else wtmCart[itemId] = { qty: 1, price: parseFloat(price), name };
  const ctrl = document.getElementById(`${prefix}-ctrl-${itemId}`);
  if (ctrl) {
    const qty = wtmCart[itemId].qty;
    ctrl.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.3rem">
        <button class="btn btn-outline btn-sm" onclick="wtmRemoveItem(${itemId},'${prefix}')">-</button>
        <span style="width:1.5rem;text-align:center;font-weight:600">${qty}</span>
        <button class="btn btn-outline btn-sm" onclick="wtmAddItem(${itemId},${price},'${name.replace(/'/g,"\'")}','${prefix}')">+</button>
      </div>`;
  }
  wtmUpdateSummary();
}

function wtmRemoveItem(itemId, prefix) {
  if (!wtmCart[itemId]) return;
  wtmCart[itemId].qty--;
  if (wtmCart[itemId].qty <= 0) delete wtmCart[itemId];
  const item = STATE.menuItems.find(m => m.id === itemId);
  const ctrl = document.getElementById(`${prefix}-ctrl-${itemId}`);
  if (ctrl) {
    if (!wtmCart[itemId]) {
      ctrl.innerHTML = `<button class="btn btn-primary btn-sm"
        onclick="wtmAddItem(${itemId},${item?.price},'${item?.name?.replace(/'/g,"\'")}','${prefix}')">Add</button>`;
    } else {
      const qty = wtmCart[itemId].qty;
      ctrl.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.3rem">
          <button class="btn btn-outline btn-sm" onclick="wtmRemoveItem(${itemId},'${prefix}')">-</button>
          <span style="width:1.5rem;text-align:center;font-weight:600">${qty}</span>
          <button class="btn btn-outline btn-sm" onclick="wtmAddItem(${itemId},${item?.price},'${item?.name?.replace(/'/g,"\'")}','${prefix}')">+</button>
        </div>`;
    }
  }
  wtmUpdateSummary();
}

function wtmUpdateSummary() {
  const summary  = document.getElementById('wtm-add-summary');
  const itemsDiv = document.getElementById('wtm-add-items');
  const totalDiv = document.getElementById('wtm-new-total');
  const entries  = Object.entries(wtmCart);
  if (!entries.length) { summary?.classList.add('hidden'); return; }
  summary?.classList.remove('hidden');
  let tot = 0;
  if (itemsDiv) {
    itemsDiv.innerHTML = entries.map(([id,{qty,price,name}]) => {
      tot += qty * price;
      return `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:0.2rem">
        <span>${qty}x ${name}</span><span>NRs ${(qty*price).toFixed(2)}</span></div>`;
    }).join('');
  }
  if (totalDiv) totalDiv.innerHTML = `<span>Total</span><span>NRs ${tot.toFixed(2)}</span>`;
}

async function wtmSubmitNewOrder(tableId) {
  if (!Object.keys(wtmCart).length) { toast('Please add at least one item', 'error'); return; }
  try {
    await api.post('/orders/orders/', {
      table_id: parseInt(tableId),
      items: Object.entries(wtmCart).map(([id,{qty}]) => ({ menu_item: parseInt(id), quantity: qty })),
    });
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('waiter-table-modal');
    renderWaiterView();
    toast('Order placed successfully!');
  } catch(e) {
    try { const err = JSON.parse(e.message); toast(Object.values(err).flat()[0] || 'Failed to place order', 'error'); }
    catch { toast('Failed to place order', 'error'); }
  }
}

async function wtmSubmitAddItems(orderId, tableId) {
  if (!Object.keys(wtmCart).length) { toast('Please select items to add', 'error'); return; }
  try {
    await api.post(`/orders/orders/${orderId}/add-items/`, {
      items: Object.entries(wtmCart).map(([id,{qty}]) => ({ menu_item: parseInt(id), quantity: qty })),
    });
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('waiter-table-modal');
    renderWaiterView();
    toast('Items added to order!');
  } catch { toast('Failed to add items', 'error'); }
}

async function waiterMarkServed(orderId, itemId) {
  try {
    await api.patch(`/orders/orders/${orderId}/items/${itemId}/status/`, { status: 'served' });
    const order = STATE.orders.find(o => o.id === orderId);
    if (order) {
      const item = (order.items || []).find(i => i.id === itemId);
      if (item) item.status = 'served';
    }
    renderWaiterView();
    toast('Item marked as served!');
  } catch { toast('Failed to update item', 'error'); }
}

function waiterOrderModal() {
  const available = STATE.tables.filter(t => t.status === 'available');
  const menuAvail = STATE.menuItems.filter(m => m.available);
  return `
    <div id="waiter-order-modal" class="modal-overlay hidden">
      <div class="modal modal-lg">
        <div class="modal-header">
          <div><div class="modal-title">New Order</div></div>
          <button class="modal-close" onclick="closeModal('waiter-order-modal')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Table</label>
            <select class="form-select" id="waiter-table-select">
              <option value="">Choose a table...</option>
              ${available.map(t => `<option value="${t.id}">Table ${t.number} — seats ${t.capacity}</option>`).join('')}
            </select>
          </div>
          <div style="border:1px solid var(--border);border-radius:var(--radius);max-height:260px;overflow-y:auto;padding:0.5rem;display:flex;flex-direction:column;gap:0.35rem">
            ${menuAvail.map(item => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem;background:var(--bg);border-radius:var(--radius)">
                <div><div style="font-weight:500;font-size:var(--text-sm)">${item.name}</div><div style="font-size:0.75rem;color:var(--text-muted)">NRs ${parseFloat(item.price).toFixed(2)}</div></div>
                <div id="witem-ctrl-${item.id}">
                  <button class="btn btn-primary btn-sm" onclick="waiterAddItem(${item.id}, ${item.price}, '${item.name.replace(/'/g,"\\'")}')">Add</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div id="waiter-order-summary" class="hidden" style="background:var(--bg);border-radius:var(--radius);padding:1rem">
            <div style="font-weight:600;margin-bottom:0.5rem">Summary</div>
            <div id="waiter-summary-items"></div>
            <div class="order-total" id="waiter-summary-total"><span>Total</span><span>NRs 0.00</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('waiter-order-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitWaiterOrder()">Place Order</button>
        </div>
      </div>
    </div>
  `;
}

let waiterCart = {};

function openWaiterOrderModal() { waiterCart = {}; openModal('waiter-order-modal'); }

function waiterAddItem(id, price, name) {
  if (waiterCart[id]) waiterCart[id].qty++;
  else waiterCart[id] = { qty: 1, price: parseFloat(price), name };
  const ctrl = document.getElementById(`witem-ctrl-${id}`);
  if (ctrl) {
    const qty = waiterCart[id].qty;
    ctrl.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.35rem">
        <button class="btn btn-outline btn-sm" onclick="waiterRemoveItem(${id})">-</button>
        <span style="width:1.5rem;text-align:center;font-weight:600">${qty}</span>
        <button class="btn btn-outline btn-sm" onclick="waiterAddItem(${id}, ${price}, '${name.replace(/'/g,"\\'")}')">+</button>
      </div>`;
  }
  updateWaiterSummary();
}

function waiterRemoveItem(id) {
  if (!waiterCart[id]) return;
  waiterCart[id].qty--;
  if (waiterCart[id].qty <= 0) delete waiterCart[id];
  const item = STATE.menuItems.find(m => m.id === id);
  const ctrl = document.getElementById(`witem-ctrl-${id}`);
  if (ctrl && !waiterCart[id]) ctrl.innerHTML = `<button class="btn btn-primary btn-sm" onclick="waiterAddItem(${id}, ${item?.price}, '${item?.name?.replace(/'/g,"\\'")}')">Add</button>`;
  else if (ctrl) ctrl.querySelector('span').textContent = waiterCart[id]?.qty;
  updateWaiterSummary();
}

function updateWaiterSummary() {
  const s = document.getElementById('waiter-order-summary');
  const items = document.getElementById('waiter-summary-items');
  const total = document.getElementById('waiter-summary-total');
  const entries = Object.entries(waiterCart);
  if (!entries.length) { s?.classList.add('hidden'); return; }
  s?.classList.remove('hidden');
  let tot = 0;
  items.innerHTML = entries.map(([id,{qty,price,name}]) => { tot+=qty*price; return `<div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:0.25rem"><span>${qty}x ${name}</span><span>NRs ${(qty*price).toFixed(2)}</span></div>`; }).join('');
  total.innerHTML = `<span>Total</span><span>NRs ${tot.toFixed(2)}</span>`;
}

async function submitWaiterOrder() {
  const tableId = document.getElementById('waiter-table-select').value;
  if (!tableId) { toast('Select a table', 'error'); return; }
  if (!Object.keys(waiterCart).length) { toast('Add at least one item', 'error'); return; }
  try {
    await api.post('/orders/orders/', {
      table_id: parseInt(tableId),
      items: Object.entries(waiterCart).map(([id,{qty}]) => ({ menu_item: parseInt(id), quantity: qty })),
    });
    closeModal('waiter-order-modal');
    loadStaffData();
    toast('Order placed!');
  } catch { toast('Failed to place order', 'error'); }
}

function renderKitchenView() {
  const active    = STATE.orders.filter(o => o.status === 'active');
  const takeaways = (STATE.takeaways || []).filter(t => ['pending','preparing'].includes(t.status));

  const pending   = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='pending').length, 0)
                  + takeaways.filter(t => t.status === 'pending').length;
  const preparing = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='preparing').length, 0)
                  + takeaways.filter(t => t.status === 'preparing').length;
  const ready     = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='ready').length, 0);

  document.getElementById('staff-view').innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem">
      <div class="stat-card" style="background:var(--yellow-bg)"><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--yellow)">${pending}</div></div>
      <div class="stat-card" style="background:var(--blue-bg)"><div class="stat-label">Preparing</div><div class="stat-value" style="color:var(--blue)">${preparing}</div></div>
      <div class="stat-card" style="background:var(--green-bg)"><div class="stat-label">Ready</div><div class="stat-value" style="color:var(--green)">${ready}</div></div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Dine-In Orders</h2>
      <button class="btn btn-outline btn-sm" onclick="kitchenRefreshAll()">${icons.refresh} Refresh</button>
    </div>
    ${active.length === 0
      ? '<div class="empty-state" style="margin-bottom:1.5rem"><p>No dine-in orders</p></div>'
      : `<div class="kitchen-grid" style="margin-bottom:1.5rem">
          ${active.map(o => `
            <div class="kitchen-card">
              <div class="kitchen-card-header">
                <span style="font-weight:700">Table ${o.table_number}</span>
                <span style="font-size:0.75rem;color:var(--text-muted)">${new Date(o.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              ${(o.items||[]).map(item => `
                <div class="kitchen-item">
                  <div class="kitchen-item-name">${item.quantity}x ${item.menu_item_name}</div>
                  <span class="badge ${item.status==='pending'?'badge-yellow':item.status==='preparing'?'badge-blue':item.status==='ready'?'badge-green':'badge-gray'}">${item.status}</span>
                  ${item.status !== 'served' ? `
                    <button class="btn btn-outline btn-sm w-full" style="margin-top:0.5rem"
                      onclick="kitchenUpdateItem(${o.id}, ${item.id}, '${item.status}')">
                      ${item.status==='pending'?'Start Preparing':item.status==='preparing'?'Mark Ready':'Mark Served'}
                    </button>
                  ` : `<div style="font-size:0.75rem;text-align:center;color:var(--text-muted);margin-top:0.5rem">✓ Served</div>`}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>`
    }

    <!-- Takeaway orders section -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">
        Takeaway Orders
        ${takeaways.length > 0 ? `<span class="badge badge-orange" style="margin-left:0.5rem">${takeaways.length}</span>` : ''}
      </h2>
    </div>
    ${takeaways.length === 0
      ? '<div class="empty-state"><p>No takeaway orders to prepare</p></div>'
      : `<div class="kitchen-grid">
          ${takeaways.map(t => `
            <div class="kitchen-card" style="border-color:var(--orange)">
              <div class="kitchen-card-header" style="background:var(--orange-light)">
                <div>
                  <span style="font-weight:700">🥡 Takeaway #${t.id}</span>
                  <div style="font-size:0.72rem;color:var(--text-muted)">${t.customer_name} · 📞 ${t.customer_phone}</div>
                </div>
                <span style="font-size:0.75rem;color:var(--text-muted)">${new Date(t.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
              </div>
              ${(t.takeaway_items||[]).map(item => `
                <div class="kitchen-item">
                  <div class="kitchen-item-name">${item.quantity}x ${item.menu_item_name}</div>
                </div>
              `).join('')}
              <div style="padding:0.5rem 1rem">
                ${t.status === 'pending' ? `
                  <button class="btn btn-primary w-full" onclick="kitchenTakeawayUpdate(${t.id},'preparing')">
                    Start Preparing
                  </button>
                ` : t.status === 'preparing' ? `
                  <button class="btn btn-primary w-full" onclick="kitchenTakeawayUpdate(${t.id},'ready')">
                    Mark Ready
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>`
    }
  `;
}

async function kitchenTakeawayUpdate(takeawayId, newStatus) {
  try {
    await api.patch(`/orders/takeaways/${takeawayId}/set-status/`, { status: newStatus });
    const t = (STATE.takeaways||[]).find(t => t.id === takeawayId);
    if (t) t.status = newStatus;
    renderKitchenView();
    toast(newStatus === 'ready' ? 'Takeaway marked ready!' : 'Takeaway started!');
  } catch { toast('Failed to update takeaway', 'error'); }
}

async function kitchenRefreshAll() {
  try {
    const [orders, takeaways] = await Promise.all([
      api.get('/orders/orders/'),
      api.get('/orders/takeaways/'),
    ]);
    STATE.orders   = orders.results   ?? orders;
    STATE.takeaways = takeaways.results ?? takeaways;
    renderKitchenView();
    toast('Refreshed');
  } catch { toast('Failed to refresh', 'error'); }
}

const nextStatusMap = { pending: 'preparing', preparing: 'ready', ready: 'served' };
async function kitchenUpdateItem(orderId, itemId, currentStatus) {
  const next = nextStatusMap[currentStatus];
  if (!next) return;
  try {
    await api.patch(`/orders/orders/${orderId}/items/${itemId}/status/`, { status: next });
    const order = STATE.orders.find(o => o.id === orderId);
    if (order) { const item = (order.items||[]).find(i => i.id === itemId); if (item) item.status = next; }
    renderKitchenView();
  } catch { toast('Failed to update', 'error'); }
}

// ── Modal Helpers ─────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar?.classList.remove('open');
  if (overlay) overlay.style.display = 'none';
}
// ── Landing Page Logic ────────────────────────────────────────────────────────
function initLanding() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel).classList.remove('hidden');
    });
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Logging in...';
    try {
      const data = await api.post('/auth/login/', {
        username: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value,
      });
      TokenStorage.set(data.access, data.refresh);
      STATE.user = data.user;
      document.getElementById('loading-screen').classList.remove('hidden');
      afterLogin();
    } catch {
      toast('Invalid email or password', 'error');
      btn.disabled = false; btn.textContent = 'Login';
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Registering...';
    const name = document.getElementById('reg-name').value.trim().split(' ');
    try {
      await api.post('/auth/register/', {
        username:   document.getElementById('reg-email').value,
        email:      document.getElementById('reg-email').value,
        password:   document.getElementById('reg-password').value,
        first_name: name[0] || '',
        last_name:  name.slice(1).join(' ') || '',
        role:       document.getElementById('reg-role').value,
      });
      const data = await api.post('/auth/login/', {
        username: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
      });
      TokenStorage.set(data.access, data.refresh);
      STATE.user = data.user;
      document.getElementById('loading-screen').classList.remove('hidden');
      afterLogin();
    } catch {
      toast('Registration failed. Email may already exist.', 'error');
      btn.disabled = false; btn.textContent = 'Register';
    }
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  checkAuth();
});

// ── Payment System ────────────────────────────────────────────────────────────

// payment icon
icons.payment = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
icons.qr = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="3" y="3" width="3" height="3" fill="currentColor"/><rect x="14" y="3" width="3" height="3" fill="currentColor"/><rect x="3" y="14" width="3" height="3" fill="currentColor"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17h1M17 14h1"/></svg>`;

// ── MANAGER: Add Payments nav item ───────────────────────────────────────────
const _origRenderManagerShell = renderManagerShell;
renderManagerShell = function() {
  _origRenderManagerShell();
  // inject payments nav button after reports
  const nav = document.querySelector('.sidebar-nav');
  if (nav && !nav.querySelector('[onclick="navigateTo(\'payments\')"]')) {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.setAttribute('onclick', "navigateTo('payments')");
    btn.innerHTML = `${icons.payment} Payments`;
    nav.appendChild(btn);
  }
  // register route
  const _origNavigateTo = window.navigateTo;
  window.navigateTo = function(page) {
    if (page === 'payments') {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelector(`.nav-item[onclick="navigateTo('payments')"]`)?.classList.add('active');
      renderPayments();
    } else {
      _origNavigateTo(page);
    }
  };
};

// ── Payments Page (Manager) ──────────────────────────────────────────────────
async function renderPayments() {
  let payments = [];
  try {
    const data = await api.get('/orders/payments/');
    payments = data.results ?? data;
  } catch { toast('Failed to load payments', 'error'); }

  const paid      = payments.filter(p => p.status === 'paid');
  const pending   = payments.filter(p => p.status === 'pending');
  const refunded  = payments.filter(p => p.status === 'refunded');
  const totalRev  = paid.reduce((s, p) => s + parseFloat(p.grand_total), 0);

  // also get completed orders without payment for "Bill Due" section
  let completedOrders = [];
  try {
    const data = await api.get('/orders/orders/?status=completed');
    const allOrders = data.results ?? data;
    completedOrders = allOrders.filter(o => !payments.find(p => p.order === o.id && p.status === 'paid'));
  } catch {}

  setInner(`
    <div class="page-header">
      <div><h1>Payments & Billing</h1><p>Manage bills, collect payments, generate QR codes</p></div>
      <button class="btn btn-outline btn-sm" onclick="renderPayments()">${icons.refresh} Refresh</button>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card">
        <div class="stat-label">Total Collected</div>
        <div class="stat-value" style="color:var(--green)">NRs ${totalRev.toFixed(2)}</div>
        <div class="stat-sub">${paid.length} payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bills Due</div>
        <div class="stat-value" style="color:var(--orange)">${completedOrders.length}</div>
        <div class="stat-sub">Awaiting payment</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Refunded</div>
        <div class="stat-value" style="color:var(--red, #dc2626)">${refunded.length}</div>
        <div class="stat-sub">Total refunds</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Bill</div>
        <div class="stat-value" style="color:var(--blue)">${paid.length ? 'NRs ' + (totalRev/paid.length).toFixed(2) : '—'}</div>
        <div class="stat-sub">Per completed order</div>
      </div>
    </div>

    <!-- Bills Due -->
    ${completedOrders.length > 0 ? `
      <div style="margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between">
        <h2 style="font-size:1.05rem;font-weight:700;color:var(--orange)">⚡ Bills Due — Collect Payment</h2>
      </div>
      <div class="orders-grid" style="margin-bottom:2rem">
        ${completedOrders.map(o => `
          <div class="order-card" style="border:1.5px solid var(--orange)">
            <div class="order-card-header">
              <span style="font-weight:700">Table ${o.table_number} — Order #${o.id}</span>
              <span style="font-size:0.75rem;color:var(--text-muted)">${new Date(o.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div class="order-card-body">
              ${(o.items||[]).map(item => `
                <div class="order-item-row">
                  <span>${item.quantity}x ${item.menu_item_name}</span>
                  <span>NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="order-total"><span>Bill Total</span><span style="color:var(--orange);font-size:1.1rem">NRs ${parseFloat(o.total).toFixed(2)}</span></div>
              <div class="order-actions" style="flex-direction:column;gap:0.5rem">
                <div style="text-align:center;padding:0.5rem;background:var(--orange-light);border-radius:var(--radius);font-size:0.85rem;color:var(--orange);font-weight:600">
                  Awaiting cashier payment
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `<div style="text-align:center;padding:1.5rem;background:var(--green-bg,#f0fdf4);border:1px solid var(--green);border-radius:var(--radius);margin-bottom:2rem;color:var(--green)">✓ All bills are settled!</div>`}

    <!-- Payment History -->
    <div style="margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between">
      <h2 style="font-size:1.05rem;font-weight:700">Payment History</h2>
      <span style="font-size:0.8rem;color:var(--text-muted)" id="payment-history-count"></span>
    </div>
    <div class="card">
      <div class="card-content" id="payment-history-list"></div>
      <div id="payment-pagination" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem;border-top:1px solid var(--border)"></div>
    </div>

    <!-- Modals -->
    <div id="payment-modal" class="modal-overlay hidden">
      <div class="modal">
        <div class="modal-header">
          <div><div class="modal-title" id="pm-title">Collect Payment</div><div class="modal-desc" id="pm-desc"></div></div>
          <button class="modal-close" onclick="closeModal('payment-modal')">✕</button>
        </div>
        <div class="modal-body" id="pm-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('payment-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitPayment()">${icons.payment} Confirm Payment</button>
        </div>
      </div>
    </div>

    <div id="qr-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          <div><div class="modal-title">QR Payment Code</div><div class="modal-desc" id="qr-desc"></div></div>
          <button class="modal-close" onclick="closeModal('qr-modal')">✕</button>
        </div>
        <div class="modal-body" id="qr-body" style="text-align:center"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal('qr-modal')">Close</button>
          <button class="btn btn-primary" onclick="markQRPaid()">${icons.check} Mark as Paid</button>
        </div>
      </div>
    </div>
  `);
  // initialise paginated history
  _initPaymentHistory(paid, refunded);
}

// ── Payment History Pagination ────────────────────────────────────────────────
const PAYMENT_PAGE_SIZE = 5;

function renderPaymentHistoryPage(allPayments, page) {
  const total      = allPayments.length;
  const totalPages = Math.ceil(total / PAYMENT_PAGE_SIZE) || 1;
  page = Math.max(1, Math.min(page, totalPages));
  const start = (page - 1) * PAYMENT_PAGE_SIZE;
  const slice = allPayments.slice(start, start + PAYMENT_PAGE_SIZE);
  const countEl = document.getElementById('payment-history-count');
  const listEl  = document.getElementById('payment-history-list');
  const pagEl   = document.getElementById('payment-pagination');
  if (!listEl) return;
  if (countEl) countEl.textContent = total + ' record' + (total !== 1 ? 's' : '');
  if (total === 0) {
    listEl.innerHTML = '<div class="empty-state"><p>No payments recorded yet</p></div>';
    if (pagEl) pagEl.innerHTML = '';
    return;
  }
  listEl.innerHTML = slice.map(function(p) {
    return '<div class="order-item-row">' +
      '<div>' +
        '<div style="font-weight:600">Order #' + p.order + ' — Table ' + p.table_number + '</div>' +
        '<div style="font-size:0.75rem;color:var(--text-muted)">' + new Date(p.created_at).toLocaleString() + ' · ' + p.method.toUpperCase() + '</div>' +
        (p.tip > 0 ? '<div style="font-size:0.75rem;color:var(--green)">Tip: NRs ' + parseFloat(p.tip).toFixed(2) + '</div>' : '') +
        (p.discount > 0 ? '<div style="font-size:0.75rem;color:var(--blue)">Discount: NRs ' + parseFloat(p.discount).toFixed(2) + '</div>' : '') +
        (p.note ? '<div style="font-size:0.75rem;color:var(--text-muted);font-style:italic">"' + p.note + '"</div>' : '') +
      '</div>' +
      '<div style="text-align:right">' +
        '<div style="font-weight:700;font-size:1rem">NRs ' + parseFloat(p.grand_total).toFixed(2) + '</div>' +
        '<span class="badge ' + (p.status === 'paid' ? 'badge-green' : 'badge-red') + '">' + p.status + '</span>' +
        (p.status === 'paid' ? '<div style="margin-top:0.25rem"><button class="btn btn-outline btn-sm" style="font-size:0.7rem;padding:0.2rem 0.5rem" onclick="refundPayment(' + p.id + ')">Refund</button></div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
  if (pagEl) {
    pagEl.innerHTML =
      '<button class="btn btn-outline btn-sm" ' + (page <= 1 ? 'disabled' : '') + ' onclick="renderPaymentHistoryPage(window._cachedPayments,' + (page-1) + ')">&#8592; Prev</button>' +
      '<span style="font-size:0.85rem;color:var(--text-muted);padding:0 0.5rem">Page ' + page + ' of ' + totalPages + '</span>' +
      '<button class="btn btn-outline btn-sm" ' + (page >= totalPages ? 'disabled' : '') + ' onclick="renderPaymentHistoryPage(window._cachedPayments,' + (page+1) + ')">Next &#8594;</button>';
  }
  window._cachedPayments = allPayments;
}

// called from renderPayments after setInner
function _initPaymentHistory(paid, refunded) {
  const all = [...paid, ...refunded].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  window._cachedPayments = all;
  renderPaymentHistoryPage(all, 1);
}

let _paymentOrderId = null;
let _paymentAmount  = null;

function openPaymentModal(orderId, amount, tableNum) {
  _paymentOrderId = orderId;
  _paymentAmount  = parseFloat(amount);
  document.getElementById('pm-title').textContent = `Collect Payment — Table ${tableNum}`;
  document.getElementById('pm-desc').textContent  = `Order #${orderId}`;
  document.getElementById('pm-body').innerHTML = `
    <div style="background:var(--bg);border-radius:var(--radius);padding:1rem;margin-bottom:1rem;text-align:center">
      <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem">Bill Amount</div>
      <div style="font-size:2rem;font-weight:800;color:var(--orange)">NRs ${_paymentAmount.toFixed(2)}</div>
    </div>
    <div class="form-group">
      <label class="form-label">Payment Method</label>
      <div style="display:flex;gap:0.5rem">
        <button id="pm-cash" class="btn btn-primary w-full" onclick="selectPayMethod('cash')">💵 Cash</button>
        <button id="pm-card" class="btn btn-outline w-full" onclick="selectPayMethod('card')">💳 Card</button>
        <button id="pm-qr"   class="btn btn-outline w-full" onclick="selectPayMethod('qr')">${icons.qr} QR</button>
      </div>
      <input type="hidden" id="pm-method" value="cash">
    </div>
    <div class="form-grid-2">
      <div class="form-group">
        <label class="form-label">Tip (NRs)</label>
        <input class="form-input" type="number" id="pm-tip" value="0" min="0" step="1" oninput="updateGrandTotal()">
      </div>
      <div class="form-group">
        <label class="form-label">Discount (NRs)</label>
        <input class="form-input" type="number" id="pm-discount" value="0" min="0" step="1" oninput="updateGrandTotal()">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Note (optional)</label>
      <input class="form-input" id="pm-note" placeholder="e.g. paid by card ending 4242">
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;background:var(--bg);border-radius:var(--radius);border:1px solid var(--border)">
      <span style="font-weight:600">Grand Total</span>
      <span style="font-size:1.3rem;font-weight:800;color:var(--green)" id="pm-grand-total">NRs ${_paymentAmount.toFixed(2)}</span>
    </div>
  `;
  openModal('payment-modal');
}

function selectPayMethod(method) {
  document.getElementById('pm-method').value = method;
  ['cash','card','qr'].forEach(m => {
    const btn = document.getElementById(`pm-${m}`);
    if (btn) btn.className = m === method ? 'btn btn-primary w-full' : 'btn btn-outline w-full';
  });
}

function updateGrandTotal() {
  const tip      = parseFloat(document.getElementById('pm-tip')?.value) || 0;
  const discount = parseFloat(document.getElementById('pm-discount')?.value) || 0;
  const grand    = _paymentAmount + tip - discount;
  const el = document.getElementById('pm-grand-total');
  if (el) el.textContent = `NRs ${Math.max(0, grand).toFixed(2)}`;
}

async function submitPayment() {
  const method   = document.getElementById('pm-method').value;
  const tip      = parseFloat(document.getElementById('pm-tip').value) || 0;
  const discount = parseFloat(document.getElementById('pm-discount').value) || 0;
  const note     = document.getElementById('pm-note').value;
  try {
    await api.post('/orders/payments/', {
      order_id: _paymentOrderId,
      method, tip, discount, note,
    });
    closeModal('payment-modal');
    toast('Payment recorded successfully!');
    renderPayments();
  } catch(e) {
    try { const err = JSON.parse(e.message); toast(Object.values(err).flat()[0] || 'Payment failed', 'error'); }
    catch { toast('Failed to record payment', 'error'); }
  }
}

// QR modal
let _qrOrderId = null, _qrAmount = null;

function openQRModal(orderId, amount, tableNum) {
  _qrOrderId = orderId;
  _qrAmount  = parseFloat(amount);
  document.getElementById('qr-desc').textContent = `Table ${tableNum} — Order #${orderId}`;
  document.getElementById('qr-body').innerHTML = `
    <div style="margin-bottom:1rem">
      <div style="font-size:0.85rem;color:var(--text-muted)">Amount Due</div>
      <div style="font-size:2rem;font-weight:800;color:var(--orange)">NRs ${_qrAmount.toFixed(2)}</div>
    </div>
    <div id="qr-canvas-container" style="display:flex;justify-content:center;margin:1rem 0"></div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">Scan to pay via eSewa / Khalti / IME Pay</p>
  `;
  // generate QR using free API (no library needed)
  const qrData = encodeURIComponent(`FEASTIO|Order#${orderId}|Table${tableNum}|NRs${_qrAmount.toFixed(2)}`);
  const img = document.createElement('img');
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=ffffff&color=1a1a1a&margin=10`;
  img.style.cssText = 'width:200px;height:200px;border-radius:8px;border:2px solid var(--border)';
  img.alt = 'QR Code for payment';
  document.getElementById('qr-canvas-container').appendChild(img);
  openModal('qr-modal');
}

async function markQRPaid() {
  try {
    await api.post('/orders/payments/', {
      order_id: _qrOrderId,
      method: 'qr',
      tip: 0, discount: 0, note: 'Paid via QR',
    });
    closeModal('qr-modal');
    toast('QR payment marked as paid!');
    renderPayments();
  } catch { toast('Failed to mark as paid', 'error'); }
}

async function refundPayment(paymentId) {
  if (!confirm('Refund this payment?')) return;
  try {
    await api.patch(`/orders/payments/${paymentId}/refund/`);
    toast('Payment refunded');
    renderPayments();
  } catch { toast('Failed to refund', 'error'); }
}

// ── WAITER: Payment button on orders ─────────────────────────────────────────

// Override renderWaiterView to also inject payment buttons after render
const _origRenderWaiterView = renderWaiterView;
renderWaiterView = function() {
  _origRenderWaiterView();
  injectWaiterPaymentButtons();
};
async function injectWaiterPaymentButtons() {
  // fetch completed orders awaiting payment
  try {
    const data = await api.get('/orders/orders/?status=completed');
    const completed = data.results ?? data;
    const paymentsData = await api.get('/orders/payments/');
    const payments = paymentsData.results ?? paymentsData;
    const unpaid = completed.filter(o => !payments.find(p => p.order === o.id && p.status === 'paid'));
    if (unpaid.length === 0) return;
    const view = document.getElementById('staff-view');
    if (!view) return;
    const section = document.createElement('div');
    section.style.cssText = 'margin-top:1.5rem';
    section.innerHTML = `
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:1rem;color:var(--orange)">⚡ Bills Ready for Payment</h2>
      <div class="orders-grid">
        ${unpaid.map(o => `
          <div class="order-card" style="border:1.5px solid var(--orange)">
            <div class="order-card-header">
              <span style="font-weight:700">Table ${o.table_number} — Order #${o.id}</span>
              <span class="badge badge-orange">Bill Due</span>
            </div>
            <div class="order-card-body">
              ${(o.items||[]).map(item => `
                <div class="order-item-row">
                  <span>${item.quantity}x ${item.menu_item_name}</span>
                  <span>NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div class="order-total"><span>Total Bill</span><span style="color:var(--orange);font-weight:800">NRs ${parseFloat(o.total).toFixed(2)}</span></div>
              <div style="display:flex;gap:0.5rem;margin-top:0.75rem">
                <button class="btn btn-primary w-full" onclick="waiterCollectPayment(${o.id}, ${o.total}, ${o.table_number})">${icons.payment} Collect</button>
                <button class="btn btn-outline w-full" onclick="openQRModal(${o.id}, ${o.total}, ${o.table_number})">${icons.qr} QR</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div id="waiter-qr-modal" style="display:none"></div>
    `;
    view.appendChild(section);
    // Inject QR modal into DOM if not present
    if (!document.getElementById('qr-modal')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="qr-modal" class="modal-overlay hidden">
          <div class="modal" style="max-width:420px">
            <div class="modal-header">
              <div><div class="modal-title">QR Payment Code</div><div class="modal-desc" id="qr-desc"></div></div>
              <button class="modal-close" onclick="closeModal('qr-modal')">✕</button>
            </div>
            <div class="modal-body" id="qr-body" style="text-align:center"></div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="closeModal('qr-modal')">Close</button>
              <button class="btn btn-primary" onclick="markQRPaid()">${icons.check} Mark as Paid</button>
            </div>
          </div>
        </div>
      `);
    }
    if (!document.getElementById('payment-modal')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="payment-modal" class="modal-overlay hidden">
          <div class="modal">
            <div class="modal-header">
              <div><div class="modal-title" id="pm-title">Collect Payment</div><div class="modal-desc" id="pm-desc"></div></div>
              <button class="modal-close" onclick="closeModal('payment-modal')">✕</button>
            </div>
            <div class="modal-body" id="pm-body"></div>
            <div class="modal-footer">
              <button class="btn btn-outline" onclick="closeModal('payment-modal')">Cancel</button>
              <button class="btn btn-primary" onclick="submitPayment()">Confirm Payment</button>
            </div>
          </div>
        </div>
      `);
    }
  } catch(e) { console.error('Payment buttons error', e); }
}

function waiterCollectPayment(orderId, amount, tableNum) {
  openPaymentModal(orderId, amount, tableNum);
}

// ── Manager Order History with Pagination ─────────────────────────────────────
let _ohOrders = [];
let _ohPage   = 1;
const _ohPageSize = 10;

async function loadOrderHistory(page = 1) {
  const statusVal = document.getElementById('oh-status')?.value;
  const fromVal   = document.getElementById('oh-from')?.value;
  const toVal     = document.getElementById('oh-to')?.value;
  const tableVal  = document.getElementById('oh-table')?.value;
  const resultsEl = document.getElementById('oh-results');
  if (!resultsEl) return;

  // Only fetch from API on first load or when filters change
  if (page === 1) {
    resultsEl.innerHTML = `<div class="empty-state"><p>Loading...</p></div>`;
    try {
      let url = '/orders/orders/';
      if (statusVal) url += `?status=${statusVal}`;
      const data = await api.get(url);
      _ohOrders = (data.results ?? data).filter(o => o.status !== 'active');
      if (fromVal)  _ohOrders = _ohOrders.filter(o => new Date(o.created_at) >= new Date(fromVal));
      if (toVal)    _ohOrders = _ohOrders.filter(o => new Date(o.created_at) <= new Date(toVal + 'T23:59:59'));
      if (tableVal) _ohOrders = _ohOrders.filter(o => String(o.table_number) === String(tableVal));
    } catch {
      resultsEl.innerHTML = `<div class="empty-state"><p style="color:#dc2626">Failed to load orders.</p></div>`;
      return;
    }
  }

  _ohPage = page;

  if (_ohOrders.length === 0) {
    resultsEl.innerHTML = `<div class="empty-state"><p>No orders found for the selected filters.</p></div>`;
    return;
  }

  // Pagination calculations
  const totalPages = Math.ceil(_ohOrders.length / _ohPageSize);
  const start      = (page - 1) * _ohPageSize;
  const end        = start + _ohPageSize;
  const pageOrders = _ohOrders.slice(start, end);

  // Summary stats (always over full results)
  const completed = _ohOrders.filter(o => o.status === 'completed');
  const cancelled = _ohOrders.filter(o => o.status === 'cancelled');
  const totalRev  = completed.reduce((s, o) => s + parseFloat(o.total), 0);

  resultsEl.innerHTML = `
    <div class="stats-grid" style="margin-bottom:1.5rem">
      <div class="stat-card"><div class="stat-label">Total Found</div><div class="stat-value">${_ohOrders.length}</div></div>
      <div class="stat-card"><div class="stat-label">Completed</div><div class="stat-value" style="color:var(--green)">${completed.length}</div></div>
      <div class="stat-card"><div class="stat-label">Cancelled</div><div class="stat-value" style="color:#dc2626">${cancelled.length}</div></div>
      <div class="stat-card"><div class="stat-label">Revenue</div><div class="stat-value" style="color:var(--green)">NRs ${totalRev.toFixed(2)}</div></div>
    </div>

    <div class="card">
      <div class="card-content" style="padding:0">
        ${pageOrders.map(o => `
          <div style="padding:1rem;border-bottom:1px solid var(--border);cursor:pointer"
            onclick="toggleOrderHistoryDetail(${o.id})"
            onmouseover="this.style.background='var(--bg)'"
            onmouseout="this.style.background=''">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
              <div style="display:flex;align-items:center;gap:0.75rem">
                <span style="font-weight:700">Order #${o.id}</span>
                <span class="badge ${o.status==='completed'?'badge-green':'badge-red'}">${o.status}</span>
                <span style="font-size:0.8rem;color:var(--text-muted)">Table ${o.table_number}</span>
              </div>
              <div style="display:flex;align-items:center;gap:1rem">
                <span style="font-weight:700;color:var(--orange)">NRs ${parseFloat(o.total).toFixed(2)}</span>
                <span style="font-size:0.75rem;color:var(--text-muted)">${new Date(o.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                <span style="font-size:0.75rem;color:var(--text-muted)" id="oh-toggle-${o.id}">▼ Details</span>
              </div>
            </div>
            <div id="oh-detail-${o.id}" class="hidden" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border)">
              ${(o.items||[]).map(item => `
                <div class="order-item-row" style="padding:0.25rem 0">
                  <span style="font-size:var(--text-sm)">${item.quantity}x ${item.menu_item_name}</span>
                  <span style="font-size:var(--text-sm);font-weight:600">NRs ${(parseFloat(item.price)*item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <div style="display:flex;justify-content:space-between;font-weight:700;margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border)">
                <span>Total</span><span>NRs ${parseFloat(o.total).toFixed(2)}</span>
              </div>
              ${o.completed_at ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem">Completed: ${new Date(o.completed_at).toLocaleString()}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Pagination controls -->
    ${totalPages > 1 ? `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:1rem;flex-wrap:wrap;gap:0.5rem">
        <div style="font-size:var(--text-sm);color:var(--text-muted)">
          Showing ${start + 1}–${Math.min(end, _ohOrders.length)} of ${_ohOrders.length} orders
        </div>
        <div style="display:flex;gap:0.35rem;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="loadOrderHistory(1)" ${page===1?'disabled':''}>««</button>
          <button class="btn btn-outline btn-sm" onclick="loadOrderHistory(${page-1})" ${page===1?'disabled':''}>‹ Prev</button>
          ${Array.from({length: totalPages}, (_,i) => i+1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx-1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map(p => p === '...'
              ? `<span style="padding:0 0.25rem;color:var(--text-muted)">…</span>`
              : `<button class="btn btn-sm ${p===page?'btn-primary':'btn-outline'}"
                  onclick="loadOrderHistory(${p})">${p}</button>`
            ).join('')}
          <button class="btn btn-outline btn-sm" onclick="loadOrderHistory(${page+1})" ${page===totalPages?'disabled':''}>Next ›</button>
          <button class="btn btn-outline btn-sm" onclick="loadOrderHistory(${totalPages})" ${page===totalPages?'disabled':''}>»»</button>
        </div>
      </div>
    ` : ''}
  `;
}

function toggleOrderHistoryDetail(orderId) {
  // Handles both manager history (oh-detail-123) and waiter history (oh-detail-wh-123)
  const detail = document.getElementById(`oh-detail-${orderId}`) ||
                 document.getElementById(`oh-detail-wh-${orderId}`);
  const toggle = document.getElementById(`oh-toggle-${orderId}`) ||
                 document.getElementById(`oh-toggle-wh-${orderId}`);
  if (!detail) return;
  const isHidden = detail.classList.contains('hidden');
  detail.classList.toggle('hidden');
  if (toggle) toggle.textContent = isHidden ? '▲ Hide' : '▼ Details';
}