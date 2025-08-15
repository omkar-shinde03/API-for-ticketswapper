-- Create bus_tickets table
CREATE TABLE public.bus_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number TEXT NOT NULL UNIQUE,
  bus_operator TEXT NOT NULL,
  source_location TEXT NOT NULL,
  destination_location TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  departure_time TIME NOT NULL,
  departure_date DATE NOT NULL,
  seat_number TEXT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_bus_tickets_pnr ON public.bus_tickets(pnr_number);
CREATE INDEX idx_bus_tickets_departure ON public.bus_tickets(departure_date, departure_time);

-- Enable Row Level Security (but make it public access)
ALTER TABLE public.bus_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access to bus tickets" 
ON public.bus_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to bus tickets" 
ON public.bus_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to bus tickets" 
ON public.bus_tickets 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to bus tickets" 
ON public.bus_tickets 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bus_tickets_updated_at
  BEFORE UPDATE ON public.bus_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER publication supabase_realtime ADD TABLE public.bus_tickets;