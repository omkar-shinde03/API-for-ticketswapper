-- Create plane_tickets table
CREATE TABLE public.plane_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number TEXT NOT NULL UNIQUE,
  flight_number TEXT NOT NULL,
  airline_name TEXT NOT NULL,
  source_airport TEXT NOT NULL,
  destination_airport TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  departure_time TIME NOT NULL,
  departure_date DATE NOT NULL,
  seat_number TEXT NOT NULL,
  gate_number TEXT,
  ticket_price DECIMAL(10,2) NOT NULL,
  ticket_class TEXT NOT NULL CHECK (ticket_class IN ('Economy', 'Premium Economy', 'Business', 'First Class')),
  baggage_allowance TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_plane_tickets_pnr ON public.plane_tickets(pnr_number);
CREATE INDEX idx_plane_tickets_departure ON public.plane_tickets(departure_date, departure_time);
CREATE INDEX idx_plane_tickets_flight_number ON public.plane_tickets(flight_number);

-- Enable Row Level Security (but make it public access)
ALTER TABLE public.plane_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access to plane tickets" 
ON public.plane_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to plane tickets" 
ON public.plane_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to plane tickets" 
ON public.plane_tickets 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to plane tickets" 
ON public.plane_tickets 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_plane_tickets_updated_at
  BEFORE UPDATE ON public.plane_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER publication supabase_realtime ADD TABLE public.plane_tickets;


