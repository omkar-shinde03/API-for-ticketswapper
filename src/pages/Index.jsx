import { useState, useEffect } from "react";
import { TicketForm } from "@/components/TicketForm";
import { TicketsList } from "@/components/TicketsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Train, Plane, TrendingUp, Users } from "lucide-react";
import { TicketVerificationService } from "@/lib/ticketVerification";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("bus");
  const [statistics, setStatistics] = useState({
    bus: { total: 0, upcoming: 0, past: 0 },
    train: { total: 0, upcoming: 0, past: 0 },
    plane: { total: 0, upcoming: 0, past: 0 },
    total: { total: 0, upcoming: 0, past: 0 },
  });

  const ticketTypes = [
    { id: "bus", label: "Bus Tickets", icon: Bus, color: "text-blue-600", bgColor: "bg-blue-50" },
    { id: "train", label: "Train Tickets", icon: Train, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "plane", label: "Plane Tickets", icon: Plane, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const handleTicketAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchStatistics();
  };

  const fetchStatistics = async () => {
    try {
      const stats = await TicketVerificationService.getTicketStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-black">Multi-Transport Ticket API</h1>
          <p className="text-xl text-gray-600">
            Real-time ticket management system for Bus, Train & Plane
          </p>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ticketTypes.map((type) => {
            const Icon = type.icon;
            const stats = statistics[type.id];
            return (
              <Card key={type.id} className={`${type.bgColor} border-0`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {type.label}
                      </p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.upcoming} upcoming • {stats.past} past
                      </p>
                    </div>
                    <Icon className={`h-8 w-8 ${type.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tickets
                  </p>
                  <p className="text-2xl font-bold">{statistics.total.total}</p>
                  <p className="text-xs text-muted-foreground">
                    Across all transport types
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Ticket Management Tabs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Ticket Management
          </h2>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {ticketTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger 
                    key={type.id} 
                    value={type.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className={`h-4 w-4 ${type.color}`} />
                    {type.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {ticketTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="flex justify-center">
                    <TicketForm 
                      ticketType={type.id} 
                      onTicketAdded={handleTicketAdded} 
                    />
                  </div>
                  
                  <div className="lg:col-span-1">
                    <TicketsList 
                      ticketType={type.id} 
                      refreshTrigger={refreshTrigger} 
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
