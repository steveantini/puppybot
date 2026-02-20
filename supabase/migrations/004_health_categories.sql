-- ============================================================
-- Migration 004: Health Tracker Category Redesign
-- Changes type values from (immunization, vet_visit, medication)
-- to (vaccination, parasite_prevention, medication, general)
-- Adds optional clinic_name field for vet-visit distinction
-- ============================================================

-- Add clinic_name column for optional vet visit identification
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS clinic_name text DEFAULT '';

-- Migrate existing type values to new categories
UPDATE health_records SET type = 'vaccination' WHERE type = 'immunization';
UPDATE health_records SET type = 'general' WHERE type = 'vet_visit';
