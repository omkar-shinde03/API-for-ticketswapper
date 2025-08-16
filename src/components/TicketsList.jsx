import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Calendar, Clock, MapPin, User, CreditCard, Hash, Bus, Train, Plane } from "lucide-react";

export function TicketsList({ ticketType = "bus", refreshTrigger }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Unified icon and color config
  const typeConfig = {
    bus: { title: "Bus Tickets", icon: Bus, color: "text-blue-600" },
    train: { title: "Train Tickets", icon: Train, color: "text-green-600" },
    plane: { title: "Plane Tickets", icon: Plane, color: "text-purple-600" },
  };
  const config = typeConfig[ticketType];
  const Icon = config.icon;

  // Fetch tickets from unified table, filtered by transport_mode
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("transport_mode", ticketType)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch tickets: ${error.message}`,
        variant: "destructive",
      });
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    try {
      const { error } = await supabase
        .from("tickets")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [refreshTrigger, ticketType]);

  // Real-time subscription for unified table
  useEffect(() => {
    const channel = supabase
      .channel(`tickets-changes-${ticketType}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `transport_mode=eq.${ticketType}`,
        },
        (payload) => {
          fetchTickets();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketType]);

  // Remove status from TICKET_FIELDS and all display logic
  const TICKET_FIELDS = {
    bus: [
      { key: "pnr_number", label: "PNR Number" },
      { key: "bus_operator", label: "Bus Operator" },
      { key: "from_location", label: "From" },
      { key: "to_location", label: "To" },
      { key: "departure_date", label: "Departure Date" },
      { key: "departure_time", label: "Departure Time" },
      { key: "passenger_name", label: "Passenger" },
      { key: "seat_number", label: "Seat" },
      { key: "ticket_price", label: "Ticket Price" },
    ],
    train: [
      { key: "pnr_number", label: "PNR Number" },
      { key: "train_number", label: "Train Number" },
      { key: "railway_operator", label: "Railway Operator" },
      { key: "coach_class", label: "Coach/Class" },
      { key: "berth_type", label: "Berth Type" },
      { key: "platform_number", label: "Platform" },
      { key: "from_location", label: "From" },
      { key: "to_location", label: "To" },
      { key: "departure_date", label: "Departure Date" },
      { key: "departure_time", label: "Departure Time" },
      { key: "passenger_name", label: "Passenger" },
      { key: "seat_number", label: "Seat" },
      { key: "ticket_price", label: "Ticket Price" },
    ],
    plane: [
      { key: "pnr_number", label: "PNR Number" },
      { key: "flight_number", label: "Flight Number" },
      { key: "airline_operator", label: "Airline" },
      { key: "cabin_class", label: "Cabin Class" },
      { key: "terminal", label: "Terminal" },
      { key: "baggage_allowance", label: "Baggage" },
      { key: "from_location", label: "From" },
      { key: "to_location", label: "To" },
      { key: "departure_date", label: "Departure Date" },
      { key: "departure_time", label: "Departure Time" },
      { key: "passenger_name", label: "Passenger" },
      { key: "seat_number", label: "Seat" },
      { key: "ticket_price", label: "Ticket Price" },
    ],
  };

  const TICKET_ICONS = {
    bus: <Bus className="h-6 w-6 text-blue-600" />,
    train: <Train className="h-6 w-6 text-green-600" />,
    plane: <Plane className="h-6 w-6 text-purple-600" />,
  };

  // SVG background images for each ticket type (soft, semi-transparent)
  const BG_IMAGES = {
    train: (
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-0 w-32 h-16 opacity-20 pointer-events-none select-none">
        <rect x="10" y="30" width="100" height="18" rx="6" fill="#4ade80" />
        <rect x="20" y="20" width="80" height="18" rx="6" fill="#22d3ee" />
        <rect x="30" y="10" width="60" height="18" rx="6" fill="#a3e635" />
        <circle cx="30" cy="48" r="6" fill="#64748b" />
        <circle cx="90" cy="48" r="6" fill="#64748b" />
      </svg>
    ),
    bus: (
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-0 w-32 h-16 opacity-20 pointer-events-none select-none">
        <rect x="10" y="30" width="100" height="18" rx="8" fill="#60a5fa" />
        <rect x="20" y="20" width="80" height="14" rx="7" fill="#fbbf24" />
        <rect x="30" y="10" width="60" height="10" rx="5" fill="#f87171" />
        <circle cx="30" cy="48" r="6" fill="#64748b" />
        <circle cx="90" cy="48" r="6" fill="#64748b" />
      </svg>
    ),
    plane: (
      <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 bottom-0 w-32 h-16 opacity-20 pointer-events-none select-none">
        <rect x="10" y="30" width="100" height="18" rx="9" fill="#818cf8" />
        <rect x="20" y="20" width="80" height="10" rx="5" fill="#f472b6" />
        <polygon points="60,10 70,40 50,40" fill="#facc15" />
        <rect x="55" y="40" width="10" height="8" rx="4" fill="#64748b" />
      </svg>
    ),
  };

  const renderTicketCard = (ticket) => {
    const fields = TICKET_FIELDS[ticket.transport_mode] || [];
    return (
      <div key={ticket.id} className="relative flex flex-row max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 my-2 min-h-[120px]">
        {/* Background image */}
        {BG_IMAGES[ticket.transport_mode]}
        {/* Main ticket content */}
        <div className="flex-1 flex flex-row items-center p-4 pr-0 z-10">
          {/* Left: Icon and PNR */}
          <div className="flex flex-col items-center justify-center px-4">
            {TICKET_ICONS[ticket.transport_mode]}
            <span className="text-base font-bold tracking-widest mt-1 mb-2">{ticket.pnr_number}</span>
            <Badge variant="secondary" className="mb-1">{ticket.transport_mode}</Badge>
          </div>
          {/* Center: Main Info */}
          <div className="flex-1 flex flex-col gap-1 px-4">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col flex-1 min-w-[80px]">
                <span className="text-xs text-gray-400">From</span>
                <span className="font-semibold text-base truncate">{ticket.from_location}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-[80px]">
                <span className="text-xs text-gray-400">To</span>
                <span className="font-semibold text-base truncate">{ticket.to_location}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-[80px]">
                <span className="text-xs text-gray-400">Passenger</span>
                <span className="font-medium truncate">{ticket.passenger_name}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-[60px]">
                <span className="text-xs text-gray-400">Seat</span>
                <span className="font-medium">{ticket.seat_number}</span>
              </div>
            </div>
            <div className="flex gap-4 items-center mt-1">
              <div className="flex flex-col flex-1 min-w-[80px]">
                <span className="text-xs text-gray-400">Departure</span>
                <span className="font-medium">{ticket.departure_date ? new Date(ticket.departure_date).toLocaleDateString() : '-'}</span>
                <span className="text-xs text-gray-500">{ticket.departure_time}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-[60px]">
                <span className="text-xs text-gray-400">Price</span>
                <span className="font-bold text-lg text-green-700">₹{ticket.ticket_price}</span>
              </div>
            </div>
          </div>
          {/* Right: Details and stub */}
          <div className="flex flex-col items-center justify-between bg-gray-50 border-l border-dashed border-gray-300 p-2 min-w-[90px] h-full relative">
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              {/* Details section: only show extra fields for this ticket type */}
              <div className="w-full text-[11px] text-gray-600 space-y-1">
                {fields.map(({ key, label }) =>
                  ["pnr_number", "from_location", "to_location", "passenger_name", "seat_number", "departure_date", "departure_time", "ticket_price"].includes(key)
                    ? null
                    : ticket[key] !== undefined && ticket[key] !== "" && (
                        <div key={key} className="flex flex-col">
                          <span className="text-gray-400">{label}</span>
                          <span className="font-medium truncate">{key.includes("date") ? (ticket[key] ? new Date(ticket[key]).toLocaleDateString() : "-") : ticket[key]}</span>
                        </div>
                      )
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="mt-2"
              onClick={() => deleteTicket(ticket.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading {config.title.toLowerCase()}...</div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="text-lg text-muted-foreground">No {config.title.toLowerCase()} found</div>
          <div className="text-sm text-muted-foreground mt-2">
            Create your first {config.title.toLowerCase().replace(' tickets', ' ticket')} using the form above
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          {config.title} ({tickets.length})
        </h2>
        <Button onClick={fetchTickets} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
      <div className="grid gap-4">
        {tickets.map(renderTicketCard)}
      </div>
    </div>
  );
}