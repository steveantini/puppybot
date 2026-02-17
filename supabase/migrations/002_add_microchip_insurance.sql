-- ============================================================
-- Migration: Add microchip and insurance fields to puppies table
-- ============================================================

ALTER TABLE puppies ADD COLUMN IF NOT EXISTS microchip_number text;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS microchip_company text;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS insurance_carrier text;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS insurance_policy_number text;
