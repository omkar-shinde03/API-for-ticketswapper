-- Fix function security: set search_path parameter for update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;