// ── State ─────────────────────────────────────────────────────────────────────
let STATE = {
  user: null,
  tables: [], orders: [], menuItems: [], menuCategories: [], staff: [],
  currentPage: 'landing',
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

function afterLogin() {
  hideLoading();
  if (STATE.user.role === 'manager') {
    renderManagerShell();
    loadAllData().then(() => renderDashboard());
  } else {
    renderStaffPortal();
    loadStaffData();
  }
}

function logout() {
  TokenStorage.clear();
  STATE.user = null;
  STATE.tables = []; STATE.orders = []; STATE.menuItems = []; STATE.staff = [];
  showPage('landing');
  document.getElementById('app-shell').innerHTML = '';
  document.getElementById('staff-portal').innerHTML = '';
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
    const [tables, orders, items] = await Promise.all([
      api.get('/orders/tables/'),
      api.get('/orders/orders/'),
      api.get('/menu/items/'),
    ]);
    STATE.tables    = (tables.results ?? tables);
    STATE.orders    = (orders.results ?? orders);
    STATE.menuItems = (items.results  ?? items);
    if (STATE.user.role === 'waiter') renderWaiterView();
    else renderKitchenView();
  } catch(e) { toast('Failed to load data', 'error'); }
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
function renderTablesOrders() {
  const active = STATE.orders.filter(o => o.status === 'active');
  const occupied  = STATE.tables.filter(t => t.status === 'occupied').length;
  const available = STATE.tables.filter(t => t.status === 'available').length;
  const reserved  = STATE.tables.filter(t => t.status === 'reserved').length;

  setInner(`
    <div class="page-header">
      <div><h1>Tables & Orders</h1><p></p></div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline btn-sm" onclick="refreshTablesOrders()">${icons.refresh} Refresh</button>
        <button class="btn btn-primary" onclick="openNewOrderModal()">${icons.plus} New Order</button>
      </div>
    </div>

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

    <!-- Tables grid -->
    <div class="tables-grid" style="margin-bottom:2.5rem">
      ${STATE.tables.map(t => renderTableCard(t)).join('')}
    </div>

    <!-- Active orders -->
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

    <!-- Modals -->
    ${tableDetailModal()}
    ${newOrderModal()}
  `);
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
  try {
    await api.patch(`/orders/orders/${orderId}/complete/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    closeModal('table-modal');
    renderTablesOrders();
    toast('Order completed!');
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
  try {
    await api.patch(`/orders/orders/${orderId}/complete/`);
    const [orders, tables] = await Promise.all([api.get('/orders/orders/'), api.get('/orders/tables/')]);
    STATE.orders = orders.results ?? orders;
    STATE.tables = tables.results ?? tables;
    renderTablesOrders();
    toast('Order completed!');
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
      <div><h1>Menu </h1><p></p></div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline btn-sm" onclick="refreshMenu()">${icons.refresh} Refresh</button>
        <button class="btn btn-primary" onclick="openMenuModal()">${icons.plus} Add Item</button>
      </div>
    </div>
    ${STATE.menuItems.length === 0 ? '<div class="empty-state"><p>No menu items yet</p></div>' :
      categories.map(cat => {
        const items = STATE.menuItems.filter(m => m.category_name === cat);
        return `
          <div class="menu-category">
            <h2>${cat}</h2>
            <div class="menu-grid">
              ${items.map(item => `
                <div class="menu-item-card">
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
    ${menuFormModal()}
  `);
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
    const body = { name, price: parseFloat(price), category: parseInt(cat), description: desc, available: avail };
    if (id) await api.patch(`/menu/items/${id}/`, body);
    else    await api.post('/menu/items/', body);
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
            <div class="staff-detail-row">${icons.dollar} NRs ${parseFloat(s.hourly_rate).toFixed(2)}/hr</div>
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

  setInner(`
    <div class="page-header"><div><h1>Reports</h1><p></p></div></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-value" style="color:var(--green)">NRs ${total.toFixed(2)}</div><div class="stat-sub">From completed orders</div></div>
      <div class="stat-card"><div class="stat-label">Completed Orders</div><div class="stat-value">${completed.length}</div><div class="stat-sub">All time</div></div>
      <div class="stat-card"><div class="stat-label">Avg Order Value</div><div class="stat-value" style="color:var(--blue)">NRs ${avgOrder.toFixed(2)}</div></div>
      <div class="stat-card"><div class="stat-label">Tables Available</div><div class="stat-value" style="color:var(--orange)">${STATE.tables.filter(t=>t.status==='available').length}</div><div class="stat-sub">of ${STATE.tables.length} total</div></div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Top Menu Items</div></div>
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
  `);
}

// ── Staff Portal ──────────────────────────────────────────────────────────────
function renderStaffPortal() {
  const role     = STATE.user.role;
  const fullName = [STATE.user.first_name, STATE.user.last_name].filter(Boolean).join(' ') || STATE.user.username;
  const initials = fullName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('staff-portal').innerHTML = `
    <div class="staff-header">
      <div style="display:flex;align-items:center;gap:0.6rem">
        <div class="sidebar-logo-icon" style="width:1.75rem;height:1.75rem;font-size:0.9rem">${role === 'kitchen' ? icons.chef : icons.waiter}</div>
        <div>
          <div style="font-weight:700">${role === 'kitchen' ? 'Kitchen' : 'Waiter'} Portal</div>
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
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card"><div class="stat-label">Available Tables</div><div class="stat-value" style="color:var(--green)">${available.length}</div></div>
      <div class="stat-card"><div class="stat-label">Active Orders</div><div class="stat-value" style="color:var(--orange)">${active.length}</div></div>
      <div class="stat-card" style="display:flex;align-items:center;justify-content:center">
        <button class="btn btn-primary w-full" onclick="openWaiterOrderModal()">${icons.plus} New Order</button>
      </div>
    </div>
    <h2 style="font-size:1rem;font-weight:600;margin-bottom:1rem">Tables</h2>
    <div class="tables-grid" style="margin-bottom:1.5rem">
      ${STATE.tables.map(t => {
        const order = STATE.orders.find(o => o.table === t.id && o.status === 'active');
        return `
          <div class="table-card ${t.status}" style="text-align:center">
            <div class="table-status-dot ${t.status==='available'?'dot-green':t.status==='occupied'?'dot-red':'dot-yellow'}" style="margin:0 auto 0.35rem"></div>
            <div style="font-weight:700">Table ${t.number}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${t.capacity} seats</div>
            ${order ? `<div style="font-size:0.75rem;color:var(--orange);margin-top:0.25rem">NRs ${parseFloat(order.total).toFixed(2)}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Your Active Orders</h2>
      <button class="btn btn-outline btn-sm" onclick="loadStaffData()">${icons.refresh} Refresh</button>
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
            </div>
          </div>
        `).join('')}
    </div>
    ${waiterOrderModal()}
  `;
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
  const active = STATE.orders.filter(o => o.status === 'active');
  const pending   = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='pending').length, 0);
  const preparing = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='preparing').length, 0);
  const ready     = active.reduce((s,o) => s + (o.items||[]).filter(i=>i.status==='ready').length, 0);

  document.getElementById('staff-view').innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:1.5rem">
      <div class="stat-card" style="background:var(--yellow-bg)"><div class="stat-label">Pending</div><div class="stat-value" style="color:var(--yellow)">${pending}</div></div>
      <div class="stat-card" style="background:var(--blue-bg)"><div class="stat-label">Preparing</div><div class="stat-value" style="color:var(--blue)">${preparing}</div></div>
      <div class="stat-card" style="background:var(--green-bg)"><div class="stat-label">Ready</div><div class="stat-value" style="color:var(--green)">${ready}</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2 style="font-size:1rem;font-weight:600">Incoming Orders</h2>
      <button class="btn btn-outline btn-sm" onclick="loadStaffData()">${icons.refresh} Refresh</button>
    </div>
    ${active.length === 0 ? '<div class="empty-state"><p>Kitchen is clear! 🍽️</p></div>' : `
      <div class="kitchen-grid">
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
      </div>
    `}
  `;
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
