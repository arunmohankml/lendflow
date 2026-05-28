// ===========================================
// Loan Tracker — UI Components & Helpers
// ===========================================

import { navigate } from './router.js';

// ------------------------------------
// SVG Icons (inline for zero-dependency)
// ------------------------------------
export const icons = {
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  money: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

// ------------------------------------
// Format helpers
// ------------------------------------
export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function debounce(fn, ms = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ------------------------------------
// Escape HTML to prevent XSS
// ------------------------------------
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ------------------------------------
// Toast Notifications
// ------------------------------------
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const icon = type === 'success' ? icons.check : icons.alert;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon}<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('exiting');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

// ------------------------------------
// Confirm Dialog
// ------------------------------------
export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-dialog');
    const msgEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');

    msgEl.textContent = message;
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');

    function close(result) {
      if (document.activeElement && overlay.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      overlay.classList.remove('visible');
      overlay.setAttribute('aria-hidden', 'true');
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onOk);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    }

    function onCancel() { close(false); }
    function onOk() { close(true); }
    function onOverlay(e) {
      if (e.target === overlay) close(false);
    }

    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onOk);
    overlay.addEventListener('click', onOverlay);
  });
}

// ------------------------------------
// Bottom Sheet
// ------------------------------------
export function openBottomSheet(contentHTML) {
  const overlay = document.getElementById('overlay');
  const sheet = document.getElementById('bottom-sheet');
  const body = document.getElementById('bottom-sheet-content');

  body.innerHTML = contentHTML;
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    sheet.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    sheet.setAttribute('aria-hidden', 'false');
  });

  function onOverlayClick() {
    closeBottomSheet();
  }
  overlay.addEventListener('click', onOverlayClick);

  sheet._cleanup = () => {
    overlay.removeEventListener('click', onOverlayClick);
  };
}

export function closeBottomSheet() {
  const overlay = document.getElementById('overlay');
  const sheet = document.getElementById('bottom-sheet');

  // Blur active element if it's inside the sheet to prevent accessibility focus warnings
  if (document.activeElement && sheet.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  overlay.classList.remove('visible');
  sheet.classList.remove('visible');
  overlay.setAttribute('aria-hidden', 'true');
  sheet.setAttribute('aria-hidden', 'true');

  if (sheet._cleanup) {
    sheet._cleanup();
    sheet._cleanup = null;
  }

  if (location.pathname !== '/' && !location.pathname.startsWith('/detail')) {
    navigate('/');
  }
}

// ------------------------------------
// Skeleton Loaders
// ------------------------------------
export function renderSkeletons(count = 4) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card" style="animation-delay: ${i * 80}ms">
        <div class="skeleton-header">
          <div class="skeleton-circle"></div>
          <div style="flex:1">
            <div class="skeleton-line w-60"></div>
            <div class="skeleton-line w-40" style="margin-top:8px;height:10px"></div>
          </div>
        </div>
        <div class="skeleton-line w-100"></div>
        <div class="skeleton-line w-80"></div>
        <div class="skeleton-line w-60"></div>
      </div>`;
  }
  return html;
}

// ------------------------------------
// Empty State
// ------------------------------------
export function renderEmptyState(isFiltered = false) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icons.empty}</div>
      <h3 class="empty-state-title">${isFiltered ? 'No results found' : 'No records yet'}</h3>
      <p class="empty-state-text">${isFiltered
        ? 'Try changing your search or filter'
        : 'Tap the + button to add your first loan record'
      }</p>
    </div>`;
}

// ------------------------------------
// Record Card (clickable for detail view)
// ------------------------------------
export function renderRecordCard(record) {
  const initials = getInitials(record.customer_name);
  const date = formatDate(record.loan_date);
  const interestLabel = record.interest_type === 'monthly' ? 'Monthly' : 'One-Time';

  return `
    <div class="record-card" data-id="${record.id}" onclick="window.__openDetail('${record.id}')">
      <div class="record-card-header">
        <div class="avatar">${initials}</div>
        <div class="record-name-group">
          <div class="record-name">${escapeHTML(record.customer_name)}</div>
          <div class="record-date">${date} · ${interestLabel} ${parseFloat(record.interest_percentage)}%</div>
        </div>
        <span class="status-badge ${record.status}">
          <span class="status-dot"></span>
          ${record.status}
        </span>
      </div>

      <div class="record-details">
        <div class="detail-item">
          <span class="detail-label">Loan</span>
          <span class="detail-value">${formatCurrency(record.loan_amount)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Total</span>
          <span class="detail-value highlight">${formatCurrency(record.total_amount)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Paid</span>
          <span class="detail-value success">${formatCurrency(record.paid_amount)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Balance</span>
          <span class="detail-value ${parseFloat(record.balance_amount) > 0 ? 'danger' : 'success'}">${formatCurrency(record.balance_amount)}</span>
        </div>
      </div>
    </div>`;
}

// ------------------------------------
// Detail View (full page)
// ------------------------------------
export function renderDetailView(record, payments = []) {
  const initials = getInitials(record.customer_name);
  const interestLabel = record.interest_type === 'monthly' ? 'Monthly' : 'One-Time';

  const phoneLink = record.phone
    ? `<a href="tel:${record.phone}" class="record-phone">${icons.phone} ${escapeHTML(record.phone)}</a>`
    : '';

  const notesHTML = record.notes
    ? `<div class="detail-notes">
        <div class="detail-notes-card">
          <div class="detail-notes-label">Notes</div>
          <div class="detail-notes-text">${escapeHTML(record.notes)}</div>
        </div>
      </div>`
    : '';

  let timelineHTML = '';
  if (payments.length === 0) {
    timelineHTML = `
      <div class="timeline-empty">
        <div class="timeline-empty-icon">${icons.calendar}</div>
        <div class="timeline-empty-text">No payments recorded yet</div>
        <div class="timeline-empty-hint">Tap "Record Payment" to add the first entry</div>
      </div>`;
  } else {
    timelineHTML = `<div class="timeline">`;
    payments.forEach((p) => {
      timelineHTML += `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <button class="timeline-delete-btn" onclick="event.stopPropagation(); window.__deletePayment('${record.id}', '${p.id}')" title="Delete payment">
              ${icons.close}
            </button>
            <div class="timeline-amount">${formatCurrency(p.amount)}</div>
            <div class="timeline-date">${formatDate(p.payment_date)}${p.payment_time ? ' at ' + formatTime(p.payment_time) : ''}</div>
            ${p.notes ? `<div class="timeline-notes">${escapeHTML(p.notes)}</div>` : ''}
          </div>
        </div>`;
    });
    timelineHTML += `</div>`;
  }

  return `
    <div class="detail-view">
      <div class="detail-header-bar">
        <div class="detail-header-inner">
          <button class="back-btn" onclick="window.__goBack()" type="button">${icons.back}</button>
          <div class="detail-header-title">${escapeHTML(record.customer_name)}</div>
          <button class="header-btn" onclick="window.__downloadPersonPDF('${record.id}')" title="Download PDF">
            ${icons.pdf}
          </button>
        </div>
      </div>

      <div class="detail-profile">
        <div class="avatar large">${initials}</div>
        <div class="detail-name">${escapeHTML(record.customer_name)}</div>
        ${phoneLink}
        <div class="detail-badge-row">
          <span class="status-badge ${record.status}"><span class="status-dot"></span>${record.status}</span>
          <span class="interest-badge">${interestLabel} · ${parseFloat(record.interest_percentage)}%</span>
        </div>
      </div>

      <div class="detail-stats-grid">
        <div class="detail-stat">
          <div class="label">Loan Amount</div>
          <div class="value primary">${formatCurrency(record.loan_amount)}</div>
        </div>
        <div class="detail-stat">
          <div class="label">Interest</div>
          <div class="value">${formatCurrency(record.interest_amount)}</div>
        </div>
        <div class="detail-stat">
          <div class="label">Total</div>
          <div class="value primary">${formatCurrency(record.total_amount)}</div>
        </div>
        <div class="detail-stat">
          <div class="label">Paid</div>
          <div class="value success">${formatCurrency(record.paid_amount)}</div>
        </div>
        <div class="detail-stat full-width">
          <div class="label">Balance Remaining</div>
          <div class="value ${parseFloat(record.balance_amount) > 0 ? 'danger' : 'success'}">${formatCurrency(record.balance_amount)}</div>
        </div>
      </div>

      ${notesHTML}

      <div class="detail-actions-bar">
        <button class="btn btn-ghost btn-sm" onclick="window.__editRecord('${record.id}')" type="button">
          ${icons.edit} Edit
        </button>
        <button class="btn btn-primary btn-sm" onclick="window.__recordPayment('${record.id}')" type="button">
          ${icons.money} Record Payment
        </button>
        <button class="btn btn-ghost btn-sm" onclick="window.__downloadPersonPDF('${record.id}')" type="button">
          ${icons.pdf} Download PDF
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="window.__deleteRecord('${record.id}')" type="button">
          ${icons.trash} Delete
        </button>
      </div>

      <div class="timeline-section">
        <div class="timeline-header">
          <div class="timeline-title">Payment History</div>
          <div class="timeline-count">${payments.length} payment${payments.length !== 1 ? 's' : ''}</div>
        </div>
        ${timelineHTML}
      </div>
    </div>`;
}

// ------------------------------------
// Payment Entry Form (bottom sheet)
// ------------------------------------
export function renderPaymentForm(record) {
  const today = new Date().toISOString().split('T')[0];

  return `
    <h2 class="form-title">Record Payment</h2>
    <div style="margin-bottom:var(--space-xl)">
      <p style="font-size:var(--fs-md);color:var(--text-secondary);margin-bottom:4px">Customer</p>
      <p style="font-size:var(--fs-lg);font-weight:600">${escapeHTML(record.customer_name)}</p>
    </div>
    <div style="margin-bottom:var(--space-md)">
      <p style="font-size:var(--fs-md);color:var(--text-secondary)">Balance: <strong style="color:var(--danger)">${formatCurrency(record.balance_amount)}</strong></p>
    </div>
    <form id="payment-form" data-record-id="${record.id}">
      <div class="form-group">
        <label class="form-label" for="pay_amount">Payment Amount *</label>
        <input class="form-input" type="number" id="pay_amount" name="amount"
          min="0" step="any" placeholder="Enter amount paid" required autofocus>
      </div>
      <div class="form-group">
        <label class="form-label" for="pay_date">Payment Date</label>
        <input class="form-input" type="date" id="pay_date" name="payment_date" value="${today}">
      </div>
      <div class="form-group">
        <label class="form-label" for="pay_notes">Notes</label>
        <textarea class="form-input" id="pay_notes" name="notes" placeholder="Optional notes"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" onclick="window.__closeSheet()">Cancel</button>
        <button type="submit" class="btn btn-primary" id="pay-submit-btn">Save Payment</button>
      </div>
    </form>`;
}

// ------------------------------------
// Record Form (with Interest Type Toggle)
// ------------------------------------
export function renderForm(record = null, mode = 'add') {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Record' : 'New Loan Record';

  const v = {
    customer_name: record?.customer_name || '',
    phone: record?.phone || '',
    loan_amount: record?.loan_amount || '',
    interest_percentage: record?.interest_percentage || '',
    interest_type: record?.interest_type || 'one_time',
    loan_date: record?.loan_date || new Date().toISOString().split('T')[0],
    paid_amount: record?.paid_amount || 0,
    notes: record?.notes || '',
  };

  return `
    <h2 class="form-title">${title}</h2>
    <form id="record-form" data-id="${record?.id || ''}" data-mode="${mode}">
      <div class="form-group">
        <label class="form-label" for="customer_name">Customer Name *</label>
        <input class="form-input" type="text" id="customer_name" name="customer_name"
          value="${escapeHTML(v.customer_name)}" placeholder="Enter name" required ${!isEdit ? 'autofocus' : ''}>
      </div>

      <div class="form-group">
        <label class="form-label" for="phone">Phone Number</label>
        <input class="form-input" type="tel" id="phone" name="phone"
          value="${escapeHTML(v.phone)}" placeholder="Optional">
      </div>

      <div class="form-group">
        <label class="form-label">Interest Type</label>
        <input type="hidden" id="interest_type" name="interest_type" value="${v.interest_type}">
        <div class="interest-toggle" id="interest-toggle">
          <button type="button" class="interest-option ${v.interest_type === 'one_time' ? 'active' : ''}" data-value="one_time">
            <span class="interest-option-icon">💰</span>
            One-Time
          </button>
          <button type="button" class="interest-option ${v.interest_type === 'monthly' ? 'active' : ''}" data-value="monthly">
            <span class="interest-option-icon">📅</span>
            Monthly
          </button>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="loan_amount">Loan Amount *</label>
          <input class="form-input" type="number" id="loan_amount" name="loan_amount"
            value="${v.loan_amount}" min="0" step="any" placeholder="₹ 0" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="interest_percentage">Interest %  *</label>
          <input class="form-input" type="number" id="interest_percentage" name="interest_percentage"
            value="${v.interest_percentage}" min="0" max="100" step="any" placeholder="0 %" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="loan_date">Loan Date *</label>
          <input class="form-input" type="date" id="loan_date" name="loan_date"
            value="${v.loan_date}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="paid_amount">Paid Amount</label>
          <input class="form-input" type="number" id="paid_amount" name="paid_amount"
            value="${v.paid_amount}" min="0" step="any" placeholder="₹ 0">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="notes">Notes</label>
        <textarea class="form-input" id="notes" name="notes"
          placeholder="Optional notes">${escapeHTML(v.notes)}</textarea>
      </div>

      <div class="calc-preview" id="calc-preview">
        <div class="calc-preview-title">Calculation Preview</div>
        <div class="calc-row">
          <span class="calc-label">Loan Amount</span>
          <span class="calc-value" id="calc-loan">${formatCurrency(v.loan_amount)}</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Interest</span>
          <span class="calc-value" id="calc-interest">—</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Total</span>
          <span class="calc-value" id="calc-total">—</span>
        </div>
        <div class="calc-row">
          <span class="calc-label">Paid</span>
          <span class="calc-value" id="calc-paid">${formatCurrency(v.paid_amount)}</span>
        </div>
        <div class="calc-row total">
          <span class="calc-label">Balance</span>
          <span class="calc-value" id="calc-balance">—</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-ghost" onclick="window.__closeSheet()">Cancel</button>
        <button type="submit" class="btn btn-primary" id="submit-btn">
          ${isEdit ? 'Save Changes' : 'Add Record'}
        </button>
      </div>
    </form>`;
}

// ------------------------------------
// Calculation Preview (real-time)
// ------------------------------------
export function setupCalcPreview() {
  const form = document.getElementById('record-form');
  if (!form) return;

  const update = () => {
    const loanInput = document.getElementById('loan_amount');
    const interestInput = document.getElementById('interest_percentage');
    const paidInput = document.getElementById('paid_amount');
    const interestTypeInput = document.getElementById('interest_type');

    if (!loanInput || !interestInput) return;

    const loan = parseFloat(loanInput.value) || 0;
    const pct = parseFloat(interestInput.value) || 0;
    const paid = parseFloat(paidInput?.value) || 0;
    const iType = interestTypeInput?.value || 'one_time';

    let interest;
    if (iType === 'monthly') {
      // For preview, show 1 month worth with a note
      interest = (loan * pct / 100);
    } else {
      interest = (loan * pct) / 100;
    }

    const total = loan + interest;
    const balance = Math.max(0, total - paid);

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatCurrency(val);
    };

    setVal('calc-loan', loan);
    setVal('calc-interest', interest);
    setVal('calc-total', total);
    setVal('calc-paid', paid);
    setVal('calc-balance', balance);
  };

  // Listen to all relevant inputs
  const inputs = form.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener('input', update);
  });

  // Initial calculation
  update();
}

// ------------------------------------
// Interest Toggle Setup
// ------------------------------------
export function setupInterestToggle() {
  const toggle = document.getElementById('interest-toggle');
  const hiddenInput = document.getElementById('interest_type');
  if (!toggle || !hiddenInput) return;

  toggle.addEventListener('click', (e) => {
    const option = e.target.closest('.interest-option');
    if (!option) return;

    toggle.querySelectorAll('.interest-option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');
    hiddenInput.value = option.getAttribute('data-value');

    // Trigger recalculation
    const loanInput = document.getElementById('loan_amount');
    if (loanInput) loanInput.dispatchEvent(new Event('input'));
  });
}
