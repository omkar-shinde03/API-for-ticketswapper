-- Create train_tickets table
CREATE TABLE public.train_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number TEXT NOT NULL UNIQUE,
  train_number TEXT NOT NULL,
  train_name TEXT NOT NULL,
  source_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  departure_time TIME NOT NULL,
  departure_date DATE NOT NULL,
  seat_number TEXT NOT NULL,
  coach_number TEXT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  ticket_class TEXT NOT NULL CHECK (ticket_class IN ('AC First Class', 'AC 2 Tier', 'AC 3 Tier', 'Sleeper Class', 'General')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_train_tickets_pnr ON public.train_tickets(pnr_number);
CREATE INDEX idx_train_tickets_departure ON public.train_tickets(departure_date, departure_time);
CREATE INDEX idx_train_tickets_train_number ON public.train_tickets(train_number);

-- Enable Row Level Security (but make it public access)
ALTER TABLE public.train_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access to train tickets" 
ON public.train_tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to train tickets" 
ON public.train_tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to train tickets" 
ON public.train_tickets 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to train tickets" 
ON public.train_tickets 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_train_tickets_updated_at
  BEFORE UPDATE ON public.train_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER publication supabase_realtime ADD TABLE public.train_tickets;


