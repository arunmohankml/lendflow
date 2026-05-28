// ===========================================
// Loan Tracker — API Client
// All backend communication goes through here
// ===========================================

const BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE}${endpoint}`;

  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  // Don't set Content-Type for GET/DELETE (no body)
  if (!options.body) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('Unable to connect. Please check your internet.');
    }
    throw err;
  }
}

// ===========================================
// Records CRUD
// ===========================================

/** Get all records with optional search and status filter */
export async function getRecords({ search = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'all') params.set('status', status);

  const query = params.toString();
  return request(`/records${query ? `?${query}` : ''}`);
}

/** Get a single record by ID */
export async function getRecord(id) {
  return request(`/records/${id}`);
}

/** Create a new record */
export async function createRecord(data) {
  return request('/records', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update an existing record */
export async function updateRecord(id, data) {
  return request(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Delete a record */
export async function deleteRecord(id) {
  return request(`/records/${id}`, {
    method: 'DELETE',
  });
}

// ===========================================
// Payment History
// ===========================================

/** Get payment history for a record */
export async function getPayments(recordId) {
  return request(`/records/${recordId}/payments`);
}

/** Add a new payment to a record */
export async function addPayment(recordId, data) {
  return request(`/records/${recordId}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Delete a payment entry */
export async function deletePayment(recordId, paymentId) {
  return request(`/records/${recordId}/payments/${paymentId}`, {
    method: 'DELETE',
  });
}

// ===========================================
// PDF Downloads
// ===========================================

/** Download PDF for a single person */
export function downloadPersonPDF(recordId) {
  const link = document.createElement('a');
  link.href = `${BASE}/records/${recordId}/pdf`;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download PDF for all records */
export function downloadAllPDF() {
  const link = document.createElement('a');
  link.href = `${BASE}/records/export/pdf`;
  link.download = 'loan_records.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
