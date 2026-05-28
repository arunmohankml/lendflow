// ===========================================
// Loan Tracker — Main App Controller
// ===========================================

import { addRoute, navigate, initRouter, resolve } from './router.js';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getPayments,
  addPayment,
  deletePayment,
  downloadAllPDF
} from './api.js';
import {
  icons,
  formatCurrency,
  formatDate,
  showToast,
  showConfirm,
  openBottomSheet,
  closeBottomSheet,
  renderSkeletons,
  renderEmptyState,
  renderRecordCard,
  renderDetailView,
  renderForm,
  renderPaymentForm,
  setupCalcPreview,
  setupInterestToggle
} from './ui.js';

// ------------------------------------
// Global State
// ------------------------------------
let allRecords = [];
let currentSearch = '';
let currentStatus = 'all';
let isShellRendered = false;

// ------------------------------------
// Render the static App Shell
// ------------------------------------
function ensureShellRendered() {
  if (isShellRendered) return;

  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <header class="header" id="app-header">
      <div class="header-inner">
        <h1 class="header-title">Loan Tracker</h1>
        <div class="header-actions">
          <button id="btn-export" class="header-btn" title="Export PDF">
            ${icons.download}
          </button>
        </div>
      </div>
    </header>

    <main class="app-container">
      <!-- Search Section -->
      <section class="search-section">
        <div class="search-bar">
          ${icons.search}
          <input type="text" id="search-input" placeholder="Search customer name..." autocomplete="off">
          <button id="search-clear" class="search-clear" aria-label="Clear search">
            ${icons.close}
          </button>
        </div>
      </section>

      <!-- Filter Chips -->
      <section class="filter-section">
        <div class="filter-chips">
          <button class="chip active" data-status="all">
            All <span class="chip-count" id="count-all">0</span>
          </button>
          <button class="chip" data-status="active">
            Active <span class="chip-count" id="count-active">0</span>
          </button>
          <button class="chip" data-status="pending">
            Pending <span class="chip-count" id="count-pending">0</span>
          </button>
          <button class="chip" data-status="paid">
            Paid <span class="chip-count" id="count-paid">0</span>
          </button>
        </div>
      </section>

      <!-- Summary Metrics -->
      <section class="summary-bar">
        <div class="summary-cards">
          <div class="summary-card primary">
            <div class="label">Total Loan</div>
            <div class="value" id="summary-total">₹0</div>
          </div>
          <div class="summary-card success">
            <div class="label">Paid</div>
            <div class="value" id="summary-paid">₹0</div>
          </div>
          <div class="summary-card warning">
            <div class="label">Balance</div>
            <div class="value" id="summary-balance">₹0</div>
          </div>
        </div>
      </section>

      <!-- Records List -->
      <section class="records-section">
        <div id="records-list" class="records-list"></div>
      </section>
    </main>

    <!-- Floating Action Button -->
    <a href="/add" class="fab" id="fab-add" data-link title="Add Record">
      ${icons.plus}
    </a>
  `;

  // Setup Event Listeners
  setupShellListeners();

  // Remove initial splash loader
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.classList.add('hidden');
    // Allow animation to finish before removing from DOM
    setTimeout(() => loader.remove(), 400);
  }

  isShellRendered = true;
}

// ------------------------------------
// Setup App Shell Event Listeners
// ------------------------------------
function setupShellListeners() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const exportBtn = document.getElementById('btn-export');
  const header = document.getElementById('app-header');

  // Sticky header shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Debounced search input handler
  const performSearch = debounce(() => {
    currentSearch = searchInput.value.trim();
    loadData();
  }, 250);

  searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
      searchClear.classList.add('visible');
    } else {
      searchClear.classList.remove('visible');
    }
    performSearch();
  });

  // Clear search input handler
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    currentSearch = '';
    loadData();
    searchInput.focus();
  });

  // Filter chips click handler
  const chipContainer = document.querySelector('.filter-chips');
  chipContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    // Toggle active class visually
    chipContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    // Update state and re-render
    currentStatus = chip.getAttribute('data-status');
    renderDashboard();
  });

  // Export PDF handler
  exportBtn.addEventListener('click', () => {
    downloadAllPDF();
  });
}

// ------------------------------------
// Render dynamic dashboard content
// ------------------------------------
function renderDashboard() {
  const recordsListEl = document.getElementById('records-list');
  if (!recordsListEl) return;

  // 1. Calculate status counts
  const counts = {
    all: allRecords.length,
    active: allRecords.filter(r => r.status === 'active').length,
    pending: allRecords.filter(r => r.status === 'pending').length,
    paid: allRecords.filter(r => r.status === 'paid').length
  };

  // Update count badges
  document.getElementById('count-all').textContent = counts.all;
  document.getElementById('count-active').textContent = counts.active;
  document.getElementById('count-pending').textContent = counts.pending;
  document.getElementById('count-paid').textContent = counts.paid;

  // 2. Calculate summary totals (accross all loaded items matching current search)
  const totals = allRecords.reduce((acc, r) => {
    acc.total += parseFloat(r.loan_amount) || 0;
    acc.paid += parseFloat(r.paid_amount) || 0;
    acc.balance += parseFloat(r.balance_amount) || 0;
    return acc;
  }, { total: 0, paid: 0, balance: 0 });

  // Update summary values
  document.getElementById('summary-total').textContent = formatCurrency(totals.total);
  document.getElementById('summary-paid').textContent = formatCurrency(totals.paid);
  document.getElementById('summary-balance').textContent = formatCurrency(totals.balance);

  // 3. Filter records for rendering
  const filtered = currentStatus === 'all'
    ? allRecords
    : allRecords.filter(r => r.status === currentStatus);

  // 4. Render cards or empty state
  if (filtered.length === 0) {
    const isFiltered = !!currentSearch || currentStatus !== 'all';
    recordsListEl.innerHTML = renderEmptyState(isFiltered);
  } else {
    recordsListEl.innerHTML = filtered.map(r => renderRecordCard(r)).join('');
  }
}

// ------------------------------------
// Load data from Backend API
// ------------------------------------
async function loadData() {
  const recordsListEl = document.getElementById('records-list');
  if (!recordsListEl) return;

  // Show skeleton loaders during fetch
  recordsListEl.innerHTML = renderSkeletons(3);

  try {
    const res = await getRecords({ search: currentSearch });
    allRecords = res.data || [];
    renderDashboard();
  } catch (err) {
    console.error('loadData error:', err);
    showToast(err.message || 'Error connecting to database', 'error');
    recordsListEl.innerHTML = `
      <div class="text-center text-muted mt-lg">
        <p>${err.message || 'Could not load records. Please check database connection.'}</p>
        <button class="btn btn-ghost btn-sm mt-md" onclick="window.location.reload()">Retry</button>
      </div>
    `;
  }
}

// ------------------------------------
// Debounce Utility helper
// ------------------------------------
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===========================================
// Form Submissions Event Delegation
// ===========================================
document.addEventListener('submit', async (e) => {
  const form = e.target.closest('#record-form');
  if (!form) return;

  e.preventDefault();

  const id = form.getAttribute('data-id');
  const mode = form.getAttribute('data-mode'); // 'add', 'edit', 'paid'
  const submitBtn = form.querySelector('#submit-btn');

  // Disable button and show spinner
  const originalBtnHTML = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner-sm"></span> Saving...`;

  try {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (['loan_amount', 'interest_percentage', 'paid_amount'].includes(key)) {
        data[key] = parseFloat(value) || 0;
      } else {
        data[key] = value;
      }
    });

    if (mode === 'add') {
      await createRecord(data);
      showToast('New loan record created');
    } else if (mode === 'edit') {
      await updateRecord(id, data);
      showToast('Record updated successfully');
    } else if (mode === 'paid') {
      await updateRecord(id, { paid_amount: data.paid_amount });
      showToast('Payment updated successfully');
    }

    closeBottomSheet();
    loadData();
  } catch (err) {
    console.error('Form submit error:', err);
    showToast(err.message || 'Operation failed. Try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHTML;
  }
});

// ===========================================
// Exposed Global Event Handlers for UI Buttons
// ===========================================
window.__editRecord = (id) => {
  navigate(`/edit/${id}`);
};

window.__openDetail = (id) => {
  navigate(`/detail/${id}`);
};

window.__goBack = () => {
  window.history.back();
};

window.__recordPayment = async (id) => {
  try {
    const res = await getRecord(id);
    openBottomSheet(renderPaymentForm(res.data));
    
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const payData = Object.fromEntries(formData.entries());
      try {
        await addPayment(id, payData);
        showToast('Payment recorded');
        closeBottomSheet();
        // Refresh detail view if on that page
        if (location.pathname.includes('/detail/')) {
          resolve(); 
        } else {
          loadData();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  } catch (err) {
    showToast('Failed to load record', 'error');
  }
};

window.__deletePayment = async (recordId, paymentId) => {
  const confirmed = await showConfirm('Delete this payment entry?');
  if (!confirmed) return;
  try {
    await deletePayment(recordId, paymentId);
    showToast('Payment deleted');
    resolve(); // Re-render current route
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.__downloadPersonPDF = (id) => {
  window.open(`/api/records/${id}/pdf`, '_blank');
};

window.__updatePaid = async (id) => {
  try {
    let record = allRecords.find(r => r.id === id);
    if (!record) {
      const res = await getRecord(id);
      record = res.data;
    }
    openBottomSheet(renderForm(record, 'paid'));
    setupCalcPreview();
  } catch (err) {
    showToast(err.message || 'Failed to load record', 'error');
  }
};

window.__deleteRecord = async (id) => {
  const confirmed = await showConfirm('Are you sure you want to delete this record? This action cannot be undone.');
  if (!confirmed) return;

  try {
    await deleteRecord(id);
    showToast('Record deleted successfully');
    navigate('/');
  } catch (err) {
    showToast(err.message || 'Failed to delete record', 'error');
  }
};

window.__closeSheet = () => {
  closeBottomSheet();
};

// ===========================================
// SPA Route Registration
// ===========================================

// Home view
addRoute('/', () => {
  ensureShellRendered();
  closeBottomSheet();
  loadData();
});

// Add Record view
addRoute('/add', () => {
  ensureShellRendered();
  loadData(); // Ensure background is loaded
  openBottomSheet(renderForm(null, 'add'));
  setupCalcPreview();
  setupInterestToggle();
});

// Edit Record view
addRoute('/edit/:id', async (params) => {
  ensureShellRendered();
  loadData(); // Ensure background is loaded

  const id = params.id;
  let record = allRecords.find(r => r.id === id);

  if (!record) {
    // If direct load, fetch from API
    try {
      const res = await getRecord(id);
      record = res.data;
    } catch (err) {
      showToast('Failed to load record', 'error');
      navigate('/');
      return;
    }
  }

  openBottomSheet(renderForm(record, 'edit'));
  setupCalcPreview();
  setupInterestToggle();
});

// Detail view
addRoute('/detail/:id', async (params) => {
  const appEl = document.getElementById('app');
  appEl.innerHTML = `
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;color:var(--text-secondary);gap:var(--space-md)">
      <span class="spinner-sm"></span>
      <span style="font-size:var(--fs-md)">Loading details...</span>
    </div>
  `;
  isShellRendered = false; // Reset shell status so returning home re-renders it

  try {
    const id = params.id;
    const [recordRes, paymentsRes] = await Promise.all([
      getRecord(id),
      getPayments(id)
    ]);
    appEl.innerHTML = renderDetailView(recordRes.data, paymentsRes.data || []);
  } catch (err) {
    console.error('Detail view error:', err);
    showToast(err.message || 'Failed to load details', 'error');
    navigate('/');
  }
});

// Initialize Router
initRouter();

// ===========================================
// Service Worker Registration
// ===========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker registered. Scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}
