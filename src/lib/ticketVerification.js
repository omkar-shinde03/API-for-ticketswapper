import { supabase } from "@/integrations/supabase/client";

export class TicketVerificationService {
  /**
   * Verify a ticket by PNR number across all ticket types
   * @param {string} pnrNumber - The PNR number to verify
   * @returns {Object} - Verification result with ticket details and status
   */
  static async verifyTicket(pnrNumber) {
    try {
      console.log("Starting ticket verification for PNR:", pnrNumber);
      
      // Search across all ticket tables
      const [busResult, trainResult, planeResult] = await Promise.all([
        supabase
          .from("bus_tickets")
          .select("*")
          .eq("pnr_number", pnrNumber)
          .single(),
        supabase
          .from("train_tickets")
          .select("*")
          .eq("pnr_number", pnrNumber)
          .single(),
        supabase
          .from("plane_tickets")
          .select("*")
          .eq("pnr_number", pnrNumber)
          .single(),
      ]);

      console.log("Database query results:", { busResult, trainResult, planeResult });

      // Check which table contains the ticket
      let ticket = null;
      let ticketType = null;
      let error = null;

      if (busResult.data && !busResult.error) {
        ticket = busResult.data;
        ticketType = "bus";
      } else if (trainResult.data && !trainResult.error) {
        ticket = trainResult.data;
        ticketType = "train";
      } else if (planeResult.data && !planeResult.error) {
        ticket = planeResult.data;
        ticketType = "plane";
      } else {
        // Check for errors to determine if it's a "not found" or actual error
        const errors = [busResult.error, trainResult.error, planeResult.error];
        const hasRealError = errors.some(err => err && err.code !== 'PGRST116');
        
        if (hasRealError) {
          console.error("Database errors found:", errors);
          throw new Error("Database error occurred during verification");
        }
      }

      if (!ticket) {
        return {
          isValid: false,
          message: "Ticket not found",
          pnrNumber,
          ticketType: null,
          ticket: null,
        };
      }

      // Validate ticket data
      const validationResult = this.validateTicket(ticket, ticketType);

      return {
        isValid: validationResult.isValid,
        message: validationResult.message,
        pnrNumber,
        ticketType,
        ticket: validationResult.isValid ? ticket : null,
        validationErrors: validationResult.errors || [],
      };

    } catch (error) {
      console.error("Ticket verification error:", error);
      return {
        isValid: false,
        message: "Verification failed due to system error",
        pnrNumber,
        ticketType: null,
        ticket: null,
        error: error.message,
      };
    }
  }

  /**
   * Validate ticket data based on type
   * @param {Object} ticket - The ticket data to validate
   * @param {string} ticketType - The type of ticket (bus, train, plane)
   * @returns {Object} - Validation result
   */
  static validateTicket(ticket, ticketType) {
    const errors = [];
    const now = new Date();
    const departureDateTime = new Date(`${ticket.departure_date}T${ticket.departure_time}`);

    // Common validations
    if (!ticket.pnr_number || ticket.pnr_number.trim() === "") {
      errors.push("PNR number is required");
    }

    if (!ticket.passenger_name || ticket.passenger_name.trim() === "") {
      errors.push("Passenger name is required");
    }

    if (!ticket.departure_date) {
      errors.push("Departure date is required");
    }

    if (!ticket.departure_time) {
      errors.push("Departure time is required");
    }

    if (!ticket.seat_number || ticket.seat_number.trim() === "") {
      errors.push("Seat number is required");
    }

    if (!ticket.ticket_price || ticket.ticket_price <= 0) {
      errors.push("Valid ticket price is required");
    }

    // Date validation
    if (departureDateTime < now) {
      errors.push("Departure date/time cannot be in the past");
    }

    // Type-specific validations
    switch (ticketType) {
      case "bus":
        if (!ticket.bus_operator || ticket.bus_operator.trim() === "") {
          errors.push("Bus operator is required");
        }
        if (!ticket.source_location || ticket.source_location.trim() === "") {
          errors.push("Source location is required");
        }
        if (!ticket.destination_location || ticket.destination_location.trim() === "") {
          errors.push("Destination location is required");
        }
        break;

      case "train":
        if (!ticket.train_number || ticket.train_number.trim() === "") {
          errors.push("Train number is required");
        }
        if (!ticket.train_name || ticket.train_name.trim() === "") {
          errors.push("Train name is required");
        }
        if (!ticket.source_station || ticket.source_station.trim() === "") {
          errors.push("Source station is required");
        }
        if (!ticket.destination_station || ticket.destination_station.trim() === "") {
          errors.push("Destination station is required");
        }
        if (!ticket.coach_number || ticket.coach_number.trim() === "") {
          errors.push("Coach number is required");
        }
        if (!ticket.ticket_class || ticket.ticket_class.trim() === "") {
          errors.push("Ticket class is required");
        }
        break;

      case "plane":
        if (!ticket.flight_number || ticket.flight_number.trim() === "") {
          errors.push("Flight number is required");
        }
        if (!ticket.airline_name || ticket.airline_name.trim() === "") {
          errors.push("Airline name is required");
        }
        if (!ticket.source_airport || ticket.source_airport.trim() === "") {
          errors.push("Source airport is required");
        }
        if (!ticket.destination_airport || ticket.destination_airport.trim() === "") {
          errors.push("Destination airport is required");
        }
        if (!ticket.ticket_class || ticket.ticket_class.trim() === "") {
          errors.push("Ticket class is required");
        }
        if (!ticket.baggage_allowance || ticket.baggage_allowance.trim() === "") {
          errors.push("Baggage allowance is required");
        }
        break;

      default:
        errors.push("Invalid ticket type");
    }

    const isValid = errors.length === 0;
    const message = isValid 
      ? "Ticket is valid and ready for travel" 
      : "Ticket validation failed";

    return {
      isValid,
      message,
      errors: errors.length > 0 ? errors : [],
    };
  }

  /**
   * Get ticket statistics across all types
   * @returns {Object} - Statistics for all ticket types
   */
  static async getTicketStatistics() {
    try {
      console.log("Fetching ticket statistics...");
      
      const [busStats, trainStats, planeStats] = await Promise.all([
        supabase
          .from("bus_tickets")
          .select("id, departure_date, departure_time"),
        supabase
          .from("train_tickets")
          .select("id, departure_date, departure_time"),
        supabase
          .from("plane_tickets")
          .select("id, departure_date, departure_time"),
      ]);

      console.log("Statistics query results:", { busStats, trainStats, planeStats });

      const now = new Date();
      
      const processStats = (data, type) => {
        if (!data.data) {
          console.log(`No data for ${type}:`, data.error);
          return { total: 0, upcoming: 0, past: 0 };
        }
        
        const tickets = data.data;
        const total = tickets.length;
        let upcoming = 0;
        let past = 0;

        tickets.forEach(ticket => {
          const departureDateTime = new Date(`${ticket.departure_date}T${ticket.departure_time}`);
          if (departureDateTime > now) {
            upcoming++;
          } else {
            past++;
          }
        });

        return { total, upcoming, past };
      };

      const result = {
        bus: processStats(busStats, "bus"),
        train: processStats(trainStats, "train"),
        plane: processStats(planeStats, "plane"),
        total: {
          total: (busStats.data?.length || 0) + (trainStats.data?.length || 0) + (planeStats.data?.length || 0),
          upcoming: 0, // Will be calculated below
          past: 0,     // Will be calculated below
        }
      };

      console.log("Final statistics:", result);
      return result;

    } catch (error) {
      console.error("Error fetching ticket statistics:", error);
      return {
        bus: { total: 0, upcoming: 0, past: 0 },
        train: { total: 0, upcoming: 0, past: 0 },
        plane: { total: 0, upcoming: 0, past: 0 },
        total: { total: 0, upcoming: 0, past: 0 },
      };
    }
  }
}
