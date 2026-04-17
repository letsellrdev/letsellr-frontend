import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";
import instance from "@/lib/axios";

const AdminRegistrationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await instance.post("/admin/register", formData);
      if (response.data.success) {
        toast.success("New administrative user registered successfully!");
        setFormData({ name: "", email: "", password: "", role: "manager" });
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground mt-1">
            Register new managers or administrative users
          </p>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl">
          <UserPlus className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Registration Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Register New User</CardTitle>
            <CardDescription>
              Created accounts will have access to the admin dashboard based on
              their assigned role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-role">Access Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="reg-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">
                        Manager (Property Only)
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin (Full Access)
                      </SelectItem>
                      <SelectItem value="superadmin">
                        Superadmin (All Access)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <Input
                  id="reg-email"
                  required
                  type="email"
                  placeholder="manager@letsellr.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Temporary Password</Label>
                <Input
                  id="reg-password"
                  required
                  type="password"
                  placeholder="Minimum 5 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isLoading}
                  minLength={5}
                />
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "manager",
                    })
                  }
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {isLoading ? "Registering..." : "Create Account"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Role Guide Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Manager</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can only create and inspect properties. All other dashboard
                  sections are restricted.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Admin</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full access to properties, locations, types, categories, and
                  settings.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Superadmin</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full access plus ability to register and manage other admin
                  accounts.
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Users should change their temporary password after first login.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;
