# Multi-Transport Ticket Management System

A comprehensive real-time ticket management system for Bus, Train, and Plane tickets with built-in verification capabilities.

## Features

### 🚌 **Bus Tickets**
- Bus operator management
- Source and destination locations
- Seat allocation
- Real-time updates

### 🚂 **Train Tickets**
- Train number and name
- Station-based routing
- Coach and class selection
- Multiple ticket classes (AC First Class, AC 2 Tier, AC 3 Tier, Sleeper Class, General)

### ✈️ **Plane Tickets**
- Flight number and airline
- Airport codes
- Gate information
- Baggage allowance
- Multiple ticket classes (Economy, Premium Economy, Business, First Class)

### 🔍 **Ticket Verification**
- PNR-based verification across all transport types
- Real-time validation
- Comprehensive error reporting
- Ticket status checking

### 📊 **Dashboard Overview**
- Real-time statistics for all ticket types
- Upcoming vs. past journey tracking
- Total ticket counts
- Visual categorization by transport type

## Technology Stack

- **Frontend**: React 18 + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## Database Schema

### Bus Tickets (`bus_tickets`)
```sql
- pnr_number (unique)
- bus_operator
- source_location
- destination_location
- passenger_name
- departure_date
- departure_time
- seat_number
- ticket_price
```

### Train Tickets (`train_tickets`)
```sql
- pnr_number (unique)
- train_number
- train_name
- source_station
- destination_station
- passenger_name
- departure_date
- departure_time
- seat_number
- coach_number
- ticket_class
- ticket_price
```

### Plane Tickets (`plane_tickets`)
```sql
- pnr_number (unique)
- flight_number
- airline_name
- source_airport
- destination_airport
- passenger_name
- departure_date
- departure_time
- seat_number
- gate_number
- ticket_class
- baggage_allowance
- ticket_price
```

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-API-supabase-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Copy your Supabase URL and anon key

4. **Configure environment variables**
   Create `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   The application will run on `http://localhost:3000`

## API Endpoints

### Ticket Verification
- **POST** `/api/verify-ticket`
  - Body: `{ "pnr_number": "string" }`
  - Returns: Ticket verification result with validation status

### Ticket Management
- **GET** `/api/tickets/{type}` - Fetch tickets by type
- **POST** `/api/tickets/{type}` - Create new ticket
- **PUT** `/api/tickets/{type}/{id}` - Update ticket
- **DELETE** `/api/tickets/{type}/{id}` - Delete ticket

## Usage

### Creating Tickets
1. Navigate to the appropriate transport tab (Bus, Train, or Plane)
2. Fill in the required information
3. Click "Create Ticket"
4. The ticket will appear in the list below

### Verifying Tickets
1. Use the Ticket Verification section at the top
2. Enter the PNR number
3. Click "Verify"
4. View the verification result and ticket details

### Managing Tickets
- View all tickets in organized tabs
- Edit ticket information
- Delete tickets
- Real-time updates across all users

## Features

- **Real-time Updates**: All changes are reflected immediately across all connected clients
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Type Safety**: Comprehensive validation for each ticket type
- **Error Handling**: User-friendly error messages and validation feedback
- **Statistics**: Real-time dashboard with ticket counts and status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
