-- ===========================================
-- Loan Tracker — Database Schema
-- ===========================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ===========================================

-- Create the loan_records table
CREATE TABLE loan_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT,
  loan_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  interest_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  interest_type TEXT NOT NULL DEFAULT 'one_time' CHECK (interest_type IN ('monthly', 'one_time')),
  interest_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update the updated_at timestamp on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loan_records_set_updated_at
  BEFORE UPDATE ON loan_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (required by Supabase)
-- Open policy since this is a personal-use app with no auth
ALTER TABLE loan_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for personal use"
  ON loan_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===========================================
-- Payment History Table
-- ===========================================

CREATE TABLE payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES loan_records(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_time TIME NOT NULL DEFAULT CURRENT_TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on payment_history"
  ON payment_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_payment_history_record ON payment_history(record_id);

-- ===========================================
-- Migration SQL (for existing databases)
-- ===========================================
-- If you already have the loan_records table, run this instead:
--
-- ALTER TABLE loan_records
--   ADD COLUMN interest_type TEXT NOT NULL DEFAULT 'one_time'
--   CHECK (interest_type IN ('monthly', 'one_time'));
--
-- Then create the payment_history table above.
