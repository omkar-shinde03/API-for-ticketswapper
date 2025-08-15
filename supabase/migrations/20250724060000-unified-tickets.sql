-- Create unified tickets table for all transport modes
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number TEXT NOT NULL,
  transport_mode TEXT NOT NULL CHECK (transport_mode IN ('bus', 'train', 'plane')),
  status TEXT NOT NULL CHECK (status IN ('available', 'sold', 'cancelled')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  api_verified BOOLEAN,
  api_provider TEXT,
  verification_confidence NUMERIC,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  seller_id UUID,
  -- Bus fields
  bus_operator TEXT,
  -- Train fields
  train_number TEXT,
  railway_operator TEXT,
  platform_number TEXT,
  coach_class TEXT,
  berth_type TEXT,
  railway_zone TEXT,
  is_tatkal BOOLEAN,
  -- Plane fields
  flight_number TEXT,
  airline_operator TEXT,
  cabin_class TEXT,
  airport_terminal TEXT,
  baggage_allowance TEXT,
  -- Common travel fields
  departure_date DATE,
  departure_time TIME,
  from_location TEXT,
  to_location TEXT,
  passenger_name TEXT,
  seat_number TEXT,
  ticket_price NUMERIC,
  selling_price NUMERIC
);

-- Indexes for performance
CREATE INDEX idx_tickets_pnr ON public.tickets(pnr_number);
CREATE INDEX idx_tickets_departure ON public.tickets(departure_date, departure_time);
CREATE INDEX idx_tickets_transport_mode ON public.tickets(transport_mode);

-- Enable Row Level Security (public access for API)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policies for public access
CREATE POLICY "Allow public read access to tickets" 
ON public.tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to tickets" 
ON public.tickets 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to tickets" 
ON public.tickets 
FOR DELETE 
USING (true);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER publication supabase_realtime ADD TABLE public.tickets;
