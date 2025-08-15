import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TicketVerificationService } from "@/lib/ticketVerification";
import { useToast } from "@/components/ui/use-toast";
import { Search, CheckCircle, XCircle, AlertTriangle, Bus, Train, Plane } from "lucide-react";

export function TicketVerification() {
  const { toast } = useToast();
  const [pnrNumber, setPnrNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!pnrNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a PNR number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const result = await TicketVerificationService.verifyTicket(pnrNumber.trim());
      setVerificationResult(result);
      
      if (result.isValid) {
        toast({
          title: "Success",
          description: "Ticket verified successfully!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      });
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getTicketTypeIcon = (type) => {
    switch (type) {
      case "bus":
        return <Bus className="h-4 w-4 text-blue-600" />;
      case "train":
        return <Train className="h-4 w-4 text-green-600" />;
      case "plane":
        return <Plane className="h-4 w-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTicketTypeColor = (type) => {
    switch (type) {
      case "bus":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "train":
        return "bg-green-100 text-green-800 border-green-200";
      case "plane":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderTicketDetails = (ticket, type) => {
    const commonFields = [
      { label: "Passenger Name", value: ticket.passenger_name },
      { label: "PNR Number", value: ticket.pnr_number },
      { label: "Departure Date", value: new Date(ticket.departure_date).toLocaleDateString() },
      { label: "Departure Time", value: ticket.departure_time },
      { label: "Seat Number", value: ticket.seat_number },
      { label: "Ticket Price", value: `₹${ticket.ticket_price}` },
    ];

    let typeSpecificFields = [];
    switch (type) {
      case "bus":
        typeSpecificFields = [
          { label: "Bus Operator", value: ticket.bus_operator },
          { label: "Source", value: ticket.source_location },
          { label: "Destination", value: ticket.destination_location },
        ];
        break;
      case "train":
        typeSpecificFields = [
          { label: "Train Number", value: ticket.train_number },
          { label: "Train Name", value: ticket.train_name },
          { label: "Source Station", value: ticket.source_station },
          { label: "Destination Station", value: ticket.destination_station },
          { label: "Coach Number", value: ticket.coach_number },
          { label: "Ticket Class", value: ticket.ticket_class },
        ];
        break;
      case "plane":
        typeSpecificFields = [
          { label: "Flight Number", value: ticket.flight_number },
          { label: "Airline", value: ticket.airline_name },
          { label: "Source Airport", value: ticket.source_airport },
          { label: "Destination Airport", value: ticket.destination_airport },
          { label: "Ticket Class", value: ticket.ticket_class },
          { label: "Baggage Allowance", value: ticket.baggage_allowance },
          ...(ticket.gate_number ? [{ label: "Gate Number", value: ticket.gate_number }] : []),
        ];
        break;
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">
                {field.label}
              </Label>
              <div className="text-sm font-medium">{field.value}</div>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Ticket Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeSpecificFields.map((field) => (
              <div key={field.label} className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  {field.label}
                </Label>
                <div className="text-sm font-medium">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Ticket Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verification Form */}
        <form onSubmit={handleVerification} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pnr_number">PNR Number</Label>
            <div className="flex gap-2">
              <Input
                id="pnr_number"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                placeholder="Enter PNR number to verify"
                className="flex-1"
              />
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </div>
        </form>

        {/* Verification Result */}
        {verificationResult && (
          <div className="space-y-4">
            <Alert className={verificationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {verificationResult.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={verificationResult.isValid ? "text-green-800" : "text-red-800"}>
                  <strong>{verificationResult.message}</strong>
                </AlertDescription>
              </div>
            </Alert>

            {verificationResult.isValid && verificationResult.ticket ? (
              <div className="space-y-4">
                {/* Ticket Type Badge */}
                <div className="flex items-center gap-2">
                  <Badge className={`${getTicketTypeColor(verificationResult.ticketType)}`}>
                    {getTicketTypeIcon(verificationResult.ticketType)}
                    {verificationResult.ticketType.toUpperCase()} TICKET
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Verified at {new Date().toLocaleString()}
                  </span>
                </div>

                {/* Ticket Details */}
                {renderTicketDetails(verificationResult.ticket, verificationResult.ticketType)}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {verificationResult.message}
                </p>
                {verificationResult.validationErrors && (
                  <div className="mt-4 text-left">
                    <h4 className="font-medium text-gray-800 mb-2">Validation Errors:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {verificationResult.validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">How to verify a ticket:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Enter the PNR number from your ticket</li>
            <li>Click the "Verify" button</li>
            <li>View the verification result and ticket details</li>
            <li>Ensure all information matches your ticket</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}


