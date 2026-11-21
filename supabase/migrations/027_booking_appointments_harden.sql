-- Harden booking appointments: stop open INSERT; require service-role / API path.
-- Overlap exclusion ideally needs btree_gist + tstzrange; apply when extension available.

DROP POLICY IF EXISTS "Anyone can insert booking appointments" ON public.booking_appointments;
DROP POLICY IF EXISTS "Public can insert appointments" ON public.booking_appointments;

-- Authenticated sellers may still manage their own rows via dashboard APIs (service role preferred).
-- Public booking MUST go through /api/booking/appointments (service role).

CREATE POLICY "Sellers can insert own appointments"
  ON public.booking_appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

-- Helpful lookup index for overlap checks used by the API
CREATE INDEX IF NOT EXISTS booking_appointments_seller_time_idx
  ON public.booking_appointments (seller_id, starts_at, ends_at)
  WHERE status = 'booked';
