import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Bus, Train, Plane } from "lucide-react";

export function TicketForm({ ticketType = "bus", onTicketAdded }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Unified form data structure for all ticket types
  const [formData, setFormData] = useState({
    pnr_number: "",
    transport_mode: ticketType,
    api_verified: false,
    api_provider: "",
    verification_confidence: null,
    verified_at: null,
    seller_id: "",
    bus_operator: "",
    train_number: "",
    railway_operator: "",
    platform_number: "",
    coach_class: "",
    berth_type: "",
    railway_zone: "",
    is_tatkal: false,
    flight_number: "",
    airline_operator: "",
    cabin_class: "",
    airport_terminal: "",
    baggage_allowance: "",
    departure_date: "",
    departure_time: "",
    from_location: "",
    to_location: "",
    passenger_name: "",
    seat_number: "",
    ticket_price: 0,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      transport_mode: ticketType,
      // Reset type-specific fields
      bus_operator: "",
      train_number: "",
      railway_operator: "",
      platform_number: "",
      coach_class: "",
      berth_type: "",
      railway_zone: "",
      is_tatkal: false,
      flight_number: "",
      airline_operator: "",
      cabin_class: "",
      airport_terminal: "",
      baggage_allowance: "",
    }));
  }, [ticketType]);

  // Dropdown options for select fields
  const COACH_CLASS_OPTIONS = ["1A", "2A", "3A", "SL", "CC", "2S"];
  const BERTH_TYPE_OPTIONS = ["Upper", "Middle", "Lower", "Side Upper", "Side Lower"];
  const CABIN_CLASS_OPTIONS = ["Economy", "Premium Economy", "Business", "First Class"];
  const BAGGAGE_ALLOWANCE_OPTIONS = ["7kg", "15kg", "20kg", "25kg", "30kg"];

  // Field configs for all ticket types
  const fieldConfigs = {
    bus: [
      { name: "bus_operator", label: "Bus Operator", placeholder: "e.g., RedBus", required: true },
      { name: "from_location", label: "From Location", placeholder: "e.g., Mumbai", required: true },
      { name: "to_location", label: "To Location", placeholder: "e.g., Pune", required: true },
    ],
    train: [
      { name: "train_number", label: "Train Number", placeholder: "e.g., 12345", required: true },
      { name: "railway_operator", label: "Railway Operator", placeholder: "e.g., Indian Railways", required: true },
      { name: "platform_number", label: "Platform Number", placeholder: "e.g., 5", required: false },
      { name: "coach_class", label: "Coach/Class", type: "select", options: COACH_CLASS_OPTIONS, required: false },
      { name: "berth_type", label: "Berth Type", type: "select", options: BERTH_TYPE_OPTIONS, required: false },
      { name: "railway_zone", label: "Railway Zone", placeholder: "e.g., WR, CR", required: false },
      { name: "is_tatkal", label: "Is Tatkal", type: "checkbox", required: false },
      { name: "from_location", label: "From Location", placeholder: "e.g., Mumbai", required: true },
      { name: "to_location", label: "To Location", placeholder: "e.g., Delhi", required: true },
    ],
    plane: [
      { name: "flight_number", label: "Flight Number", placeholder: "e.g., AI202", required: true },
      { name: "airline_operator", label: "Airline Operator", placeholder: "e.g., Air India", required: true },
      { name: "cabin_class", label: "Cabin Class", type: "select", options: CABIN_CLASS_OPTIONS, required: false },
      { name: "airport_terminal", label: "Airport Terminal", placeholder: "e.g., T1, T2", required: false },
      { name: "baggage_allowance", label: "Baggage Allowance", type: "select", options: BAGGAGE_ALLOWANCE_OPTIONS, required: false },
      { name: "from_location", label: "From Location", placeholder: "e.g., Mumbai", required: true },
      { name: "to_location", label: "To Location", placeholder: "e.g., Dubai", required: true },
    ],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "ticket_price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Remove empty string or null fields before insert
      const ticketData = Object.fromEntries(
        Object.entries(formData).filter(
          ([key, value]) => value !== "" && value !== null && value !== undefined
        )
      );
      const { error } = await supabase
        .from("tickets")
        .insert([ticketData]);
      if (error) throw error;
      toast({
        title: "Success",
        description: `Ticket created successfully!`,
      });
      // Reset form
      setFormData({
        pnr_number: "",
        transport_mode: ticketType,
        api_verified: false,
        api_provider: "",
        verification_confidence: null,
        verified_at: null,
        seller_id: "",
        bus_operator: "",
        train_number: "",
        railway_operator: "",
        platform_number: "",
        coach_class: "",
        berth_type: "",
        railway_zone: "",
        is_tatkal: false,
        flight_number: "",
        airline_operator: "",
        cabin_class: "",
        airport_terminal: "",
        baggage_allowance: "",
        departure_date: "",
        departure_time: "",
        from_location: "",
        to_location: "",
        passenger_name: "",
        seat_number: "",
        ticket_price: 0,
      });
      onTicketAdded && onTicketAdded();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render fields based on ticket type
  const renderFields = () => {
    return fieldConfigs[ticketType].map((field) => {
      if (field.type === "checkbox") {
        return (
          <div key={field.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        );
      }
      if (field.type === "select") {
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              required={field.required}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      }
      return (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
          />
        </div>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {ticketType === "bus" && <Bus className="h-5 w-5 text-blue-600" />}
          {ticketType === "train" && <Train className="h-5 w-5 text-green-600" />}
          {ticketType === "plane" && <Plane className="h-5 w-5 text-purple-600" />}
          Create {ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Ticket
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pnr_number">PNR Number</Label>
              <Input
                id="pnr_number"
                name="pnr_number"
                value={formData.pnr_number}
                onChange={handleChange}
                required
                placeholder="e.g., PNR123456"
              />
            </div>
            <div>
              <Label htmlFor="passenger_name">Passenger Name</Label>
              <Input
                id="passenger_name"
                name="passenger_name"
                value={formData.passenger_name}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderFields()}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departure_date">Departure Date</Label>
              <Input
                id="departure_date"
                name="departure_date"
                type="date"
                value={formData.departure_date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="departure_time">Departure Time</Label>
              <Input
                id="departure_time"
                name="departure_time"
                type="time"
                value={formData.departure_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seat_number">Seat Number</Label>
              <Input
                id="seat_number"
                name="seat_number"
                value={formData.seat_number}
                onChange={handleChange}
                required
                placeholder="e.g., 12A"
              />
            </div>
            <div>
              <Label htmlFor="ticket_price">Ticket Price</Label>
              <Input
                id="ticket_price"
                name="ticket_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.ticket_price}
                onChange={handleChange}
                required
                placeholder="e.g., 1500.00"
              />
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}