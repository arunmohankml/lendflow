// ===========================================
// Loan Tracker — Express Backend
// ===========================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ------------------------------------
// Validate environment
// ------------------------------------
const { SUPABASE_URL, SUPABASE_ANON_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌  Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file.');
  console.error('    Copy .env.example → .env and fill in your Supabase credentials.\n');
  process.exit(1);
}

// ------------------------------------
// Supabase client (server-side only)
// ------------------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

// ------------------------------------
// Express app setup
// ------------------------------------
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ------------------------------------
// Helpers: formatting for PDF
// ------------------------------------
function fmtCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0]);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ------------------------------------
// Helper: calculate loan fields
// ------------------------------------
function calculateLoanFields(record) {
  const loanAmount = parseFloat(record.loan_amount) || 0;
  const interestPct = parseFloat(record.interest_percentage) || 0;
  const paidAmount = parseFloat(record.paid_amount) || 0;
  const interestType = record.interest_type || 'one_time';

  let interestAmount;
  if (interestType === 'monthly') {
    const loanDate = new Date(record.loan_date || Date.now());
    const now = new Date();
    const months = Math.max(1,
      (now.getFullYear() - loanDate.getFullYear()) * 12 +
      (now.getMonth() - loanDate.getMonth()) + 1
    );
    interestAmount = (loanAmount * interestPct / 100) * months;
  } else {
    interestAmount = (loanAmount * interestPct) / 100;
  }

  const totalAmount = loanAmount + interestAmount;
  const balanceAmount = totalAmount - paidAmount;

  let status = 'active';
  if (balanceAmount <= 0) status = 'paid';
  else if (paidAmount > 0) status = 'pending';

  return {
    interest_amount: Math.round(interestAmount * 100) / 100,
    total_amount: Math.round(totalAmount * 100) / 100,
    balance_amount: Math.round(Math.max(0, balanceAmount) * 100) / 100,
    status,
  };
}

/** Recalculate monthly-interest records on the fly */
function recalcRecords(records) {
  return records.map(r => {
    if (r.interest_type === 'monthly') {
      return { ...r, ...calculateLoanFields(r) };
    }
    return r;
  });
}

// ===========================================
// RECORDS API
// ===========================================

// GET /api/records — list all (with optional search & status filter)
app.get('/api/records', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = supabase
      .from('loan_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) query = query.ilike('customer_name', `%${search}%`);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: recalcRecords(data || []) });
  } catch (err) {
    console.error('GET /api/records error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/records/export/pdf — PDF of all records (MUST be before :id)
app.get('/api/records/export/pdf', async (req, res) => {
  try {
    const { data: records, error: recErr } = await supabase
      .from('loan_records').select('*').order('created_at', { ascending: false });
    if (recErr) throw recErr;

    const finalRecords = recalcRecords(records || []);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="all_loan_records.pdf"');
    doc.pipe(res);

    if (finalRecords.length === 0) {
      doc.fontSize(16).fillColor('#5f6368').text('No records found.', { align: 'center' });
    } else {
      for (let i = 0; i < finalRecords.length; i++) {
        const { data: payments } = await supabase
          .from('payment_history').select('*').eq('record_id', finalRecords[i].id)
          .order('payment_date', { ascending: true }).order('payment_time', { ascending: true });
        generateRecordPDF(doc, finalRecords[i], payments || [], i === 0);
      }
    }

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// GET /api/records/:id — single record
app.get('/api/records/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loan_records').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    const result = data.interest_type === 'monthly' ? { ...data, ...calculateLoanFields(data) } : data;
    res.json({ data: result });
  } catch (err) {
    console.error('GET /api/records/:id error:', err.message);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// POST /api/records — create new record
app.post('/api/records', async (req, res) => {
  try {
    const { customer_name, phone, loan_amount, interest_percentage, interest_type, paid_amount, loan_date, notes } = req.body;

    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ error: 'Customer name is required.' });
    }
    if (loan_amount == null || isNaN(loan_amount) || parseFloat(loan_amount) < 0) {
      return res.status(400).json({ error: 'Valid loan amount is required.' });
    }
    if (interest_percentage == null || isNaN(interest_percentage) || parseFloat(interest_percentage) < 0) {
      return res.status(400).json({ error: 'Valid interest percentage is required.' });
    }

    const calculated = calculateLoanFields({
      loan_amount, interest_percentage,
      interest_type: interest_type || 'one_time',
      paid_amount: paid_amount || 0,
      loan_date: loan_date || new Date().toISOString().split('T')[0],
    });

    const record = {
      customer_name: customer_name.trim(),
      phone: phone?.trim() || null,
      loan_amount: parseFloat(loan_amount),
      interest_percentage: parseFloat(interest_percentage),
      interest_type: interest_type || 'one_time',
      paid_amount: parseFloat(paid_amount) || 0,
      loan_date: loan_date || new Date().toISOString().split('T')[0],
      notes: notes?.trim() || null,
      ...calculated,
    };

    const { data, error } = await supabase.from('loan_records').insert([record]).select();
    if (error) throw error;
    res.status(201).json({ data: data[0] });
  } catch (err) {
    console.error('POST /api/records error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/records/:id — update record
app.put('/api/records/:id', async (req, res) => {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('loan_records').select('*').eq('id', req.params.id).single();
    if (fetchErr) throw fetchErr;

    const merged = { ...existing, ...req.body };
    if (merged.customer_name) merged.customer_name = merged.customer_name.trim();
    if (merged.phone) merged.phone = merged.phone.trim();
    if (merged.notes) merged.notes = merged.notes.trim();

    const calculated = calculateLoanFields({
      loan_amount: merged.loan_amount,
      interest_percentage: merged.interest_percentage,
      interest_type: merged.interest_type || 'one_time',
      paid_amount: merged.paid_amount,
      loan_date: merged.loan_date,
    });

    const updateData = {
      customer_name: merged.customer_name,
      phone: merged.phone || null,
      loan_amount: parseFloat(merged.loan_amount),
      interest_percentage: parseFloat(merged.interest_percentage),
      interest_type: merged.interest_type || 'one_time',
      paid_amount: parseFloat(merged.paid_amount) || 0,
      loan_date: merged.loan_date,
      notes: merged.notes || null,
      ...calculated,
    };

    const { data, error } = await supabase
      .from('loan_records').update(updateData).eq('id', req.params.id).select();
    if (error) throw error;
    const result = data[0];
    res.json({ data: result.interest_type === 'monthly' ? { ...result, ...calculateLoanFields(result) } : result });
  } catch (err) {
    console.error('PUT /api/records/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/records/:id — delete record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loan_records').delete().eq('id', req.params.id).select();
    if (error) throw error;
    res.json({ data: data[0] });
  } catch (err) {
    console.error('DELETE /api/records/:id error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// PAYMENT HISTORY API
// ===========================================

// GET /api/records/:id/payments
app.get('/api/records/:id/payments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('record_id', req.params.id)
      .order('payment_date', { ascending: false })
      .order('payment_time', { ascending: false });
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (err) {
    console.error('GET payments error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/records/:id/payments — add payment & update loan record
app.post('/api/records/:id/payments', async (req, res) => {
  try {
    const recordId = req.params.id;
    const { amount, payment_date, notes } = req.body;

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    // 1. Insert payment
    const { data: payment, error: insertErr } = await supabase
      .from('payment_history')
      .insert([{
        record_id: recordId,
        amount: parseFloat(amount),
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        notes: notes?.trim() || null,
      }])
      .select();
    if (insertErr) throw insertErr;

    // 2. Sum all payments for this record
    const { data: allPayments, error: sumErr } = await supabase
      .from('payment_history').select('amount').eq('record_id', recordId);
    if (sumErr) throw sumErr;

    const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // 3. Update loan record's paid_amount and recalculate
    const { data: record, error: fetchErr } = await supabase
      .from('loan_records').select('*').eq('id', recordId).single();
    if (fetchErr) throw fetchErr;

    const calculated = calculateLoanFields({ ...record, paid_amount: totalPaid });

    const { error: updateErr } = await supabase
      .from('loan_records')
      .update({ paid_amount: totalPaid, ...calculated })
      .eq('id', recordId);
    if (updateErr) throw updateErr;

    res.status(201).json({ data: payment[0] });
  } catch (err) {
    console.error('POST payment error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/records/:id/payments/:paymentId
app.delete('/api/records/:id/payments/:paymentId', async (req, res) => {
  try {
    const recordId = req.params.id;
    const paymentId = req.params.paymentId;

    // 1. Delete the payment
    const { data: deleted, error: delErr } = await supabase
      .from('payment_history').delete().eq('id', paymentId).select();
    if (delErr) throw delErr;

    // 2. Re-sum remaining payments
    const { data: remaining, error: sumErr } = await supabase
      .from('payment_history').select('amount').eq('record_id', recordId);
    if (sumErr) throw sumErr;

    const totalPaid = remaining.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    // 3. Update loan record
    const { data: record, error: fetchErr } = await supabase
      .from('loan_records').select('*').eq('id', recordId).single();
    if (fetchErr) throw fetchErr;

    const calculated = calculateLoanFields({ ...record, paid_amount: totalPaid });

    const { error: updateErr } = await supabase
      .from('loan_records')
      .update({ paid_amount: totalPaid, ...calculated })
      .eq('id', recordId);
    if (updateErr) throw updateErr;

    res.json({ data: deleted[0] });
  } catch (err) {
    console.error('DELETE payment error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===========================================
// PDF GENERATION
// ===========================================

/** Generate a single record's PDF page */
function generateRecordPDF(doc, record, payments, isFirst = true) {
  if (!isFirst) doc.addPage();

  const pw = doc.page.width;

  // Header band
  doc.rect(0, 0, pw, 80).fill('#1a73e8');
  doc.fontSize(22).fillColor('#ffffff').text('Loan Record', 50, 22, { width: pw - 100, align: 'center' });
  doc.fontSize(11).text(record.customer_name, 50, 50, { width: pw - 100, align: 'center' });

  doc.fillColor('#1f1f1f');
  let y = 100;

  // Section: Loan Details
  doc.fontSize(12).fillColor('#1a73e8').text('LOAN DETAILS', 50, y);
  y += 20;
  doc.moveTo(50, y).lineTo(pw - 50, y).strokeColor('#e8eaed').lineWidth(1).stroke();
  y += 12;

  const row = (label, value, color = '#1f1f1f') => {
    doc.fontSize(10).fillColor('#5f6368').text(label, 50, y, { width: 160, continued: false });
    doc.fontSize(10.5).fillColor(color).text(String(value), 220, y, { width: 300 });
    y += 20;
  };

  row('Customer Name', record.customer_name);
  row('Phone', record.phone || '—');
  row('Loan Date', fmtDate(record.loan_date));
  row('Interest Type', record.interest_type === 'monthly' ? 'Monthly' : 'One-Time');
  row('Interest Rate', `${parseFloat(record.interest_percentage)}%`);

  y += 4;
  doc.moveTo(50, y).lineTo(pw - 50, y).strokeColor('#e8eaed').lineWidth(0.5).stroke();
  y += 12;

  row('Loan Amount', fmtCurrency(record.loan_amount), '#1a73e8');
  row('Interest Amount', fmtCurrency(record.interest_amount), '#5f6368');
  row('Total Amount', fmtCurrency(record.total_amount), '#1a73e8');
  row('Paid Amount', fmtCurrency(record.paid_amount), '#1e8e3e');
  row('Balance', fmtCurrency(record.balance_amount), parseFloat(record.balance_amount) > 0 ? '#d93025' : '#1e8e3e');
  row('Status', record.status.charAt(0).toUpperCase() + record.status.slice(1));

  if (record.notes) {
    y += 2;
    row('Notes', record.notes, '#5f6368');
  }

  // Section: Payment History
  y += 16;
  doc.fontSize(12).fillColor('#1a73e8').text('PAYMENT HISTORY', 50, y);
  y += 20;
  doc.moveTo(50, y).lineTo(pw - 50, y).strokeColor('#e8eaed').lineWidth(1).stroke();
  y += 12;

  if (!payments || payments.length === 0) {
    doc.fontSize(10).fillColor('#9aa0a6').text('No payments recorded yet.', 50, y);
    y += 20;
  } else {
    // Table header
    doc.fontSize(8.5).fillColor('#5f6368');
    doc.text('#', 50, y, { width: 25 });
    doc.text('Date', 78, y, { width: 90 });
    doc.text('Time', 170, y, { width: 70 });
    doc.text('Amount', 245, y, { width: 100 });
    doc.text('Notes', 350, y, { width: 190 });
    y += 6;
    doc.moveTo(50, y + 8).lineTo(pw - 50, y + 8).strokeColor('#e8eaed').lineWidth(0.5).stroke();
    y += 16;

    payments.forEach((p, i) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(9).fillColor('#1f1f1f');
      doc.text(`${i + 1}`, 50, y, { width: 25 });
      doc.text(fmtDate(p.payment_date), 78, y, { width: 90 });
      doc.text(fmtTime(p.payment_time), 170, y, { width: 70 });
      doc.fillColor('#1e8e3e').text(fmtCurrency(p.amount), 245, y, { width: 100 });
      doc.fillColor('#5f6368').text(p.notes || '—', 350, y, { width: 190 });
      y += 17;
    });

    y += 8;
    doc.moveTo(50, y).lineTo(pw - 50, y).strokeColor('#e8eaed').lineWidth(1).stroke();
    y += 10;
    const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    doc.fontSize(10.5).fillColor('#1e8e3e').text(`Total Paid: ${fmtCurrency(totalPaid)}`, 50, y);
  }

  // Footer
  const footerY = doc.page.height - 35;
  doc.fontSize(7.5).fillColor('#9aa0a6').text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    50, footerY, { width: pw - 100, align: 'center' }
  );
}

// GET /api/records/:id/pdf — single person PDF
app.get('/api/records/:id/pdf', async (req, res) => {
  try {
    const { data: record, error: recErr } = await supabase
      .from('loan_records').select('*').eq('id', req.params.id).single();
    if (recErr) throw recErr;

    const finalRecord = record.interest_type === 'monthly'
      ? { ...record, ...calculateLoanFields(record) } : record;

    const { data: payments, error: payErr } = await supabase
      .from('payment_history').select('*').eq('record_id', req.params.id)
      .order('payment_date', { ascending: true }).order('payment_time', { ascending: true });
    if (payErr) throw payErr;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const safeName = finalRecord.customer_name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_loan_record.pdf"`);
    doc.pipe(res);
    generateRecordPDF(doc, finalRecord, payments || []);
    doc.end();
  } catch (err) {
    console.error('PDF generation error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ------------------------------------
// SPA fallback — serve index.html for all non-API routes
// ------------------------------------
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ------------------------------------
// Start server
// ------------------------------------
app.listen(PORT, () => {
  console.log(`\n✅  Loan Tracker running at http://localhost:${PORT}\n`);
});
