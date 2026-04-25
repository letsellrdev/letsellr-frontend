import { Building2, Users, MessageSquare, Eye, Star, TrendingUp, MapPin, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "@/lib/axios";
import AdminLoader from "@/components/AdminLoader";
import { toast } from "sonner";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState([
    { label: "Total Properties", value: "0", change: "+0%", icon: Building2, color: "bg-blue-500/10 text-blue-600" },
    { label: "Total Locations", value: "0", change: "+0%", icon: MapPin, color: "bg-green-500/10 text-green-600" },
    { label: "Total Categories", value: "0", change: "+0%", icon: Layers, color: "bg-purple-500/10 text-purple-600" },
    { label: "Total Reviews", value: "0", change: "+0%", icon: Star, color: "bg-yellow-500/10 text-yellow-600" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propsRes, locsRes, catsRes, reviewsRes] = await Promise.all([
          instance.get("/property?limit=1"),
          instance.get("/location"),
          instance.get("/category"),
          instance.get("/feedback"),
        ]);

        setStats([
          {
            label: "Total Properties",
            value: propsRes.data.totalproperty?.toString() || "0",
            change: "+12%", // Mock change for now
            icon: Building2,
            color: "bg-blue-500/10 text-blue-600"
          },
          {
            label: "Total Locations",
            value: locsRes.data.data?.length?.toString() || "0",
            change: "+5%",
            icon: MapPin,
            color: "bg-green-500/10 text-green-600"
          },
          {
            label: "Total Categories",
            value: catsRes.data.data?.length?.toString() || "0",
            change: "+0%",
            icon: Layers,
            color: "bg-purple-500/10 text-purple-600"
          },
          {
            label: "Total Reviews",
            value: reviewsRes.data.count?.toString() || "0",
            change: "+8%",
            icon: Star,
            color: "bg-yellow-500/10 text-yellow-600"
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <AdminLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-border hover:border-primary/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-primary/5`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity - Mocked for now as we don't have an activity log API yet */}
      <Card className="p-6 border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New property added", time: "2 minutes ago", icon: Building2 },
            { action: "Review submitted", time: "1 hour ago", icon: MessageSquare },
            { action: "Property updated", time: "2 hours ago", icon: Building2 },
          ].map((activity, idx) => {
            const ActivityIcon = activity.icon;
            return (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ActivityIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg hover:bg-primary/10 hover:text-primary">
                  View
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
