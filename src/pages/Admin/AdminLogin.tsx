import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { menuItems } from "./AdminLayout";
import instance from "@/lib/axios";


const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  // Basic validation
  if (!email || !password) {
    setError("Please fill in all fields");
    setIsLoading(false);
    return;
  }

  const dataToSend = {
    email: email,
    password: password
  };

  try {
    // Make actual API call to your backend
    const response = await instance.post('/admin/login', dataToSend);
    console.log("API Response:", response);


    if (response.data.success === true) {
      localStorage.setItem("adminToken", "dummy-token"); // Keeping dummy token as is for now
      localStorage.setItem("adminRole", response.data.role); // Store actual role
      navigate(menuItems?.[0]?.path);
    } else {
      setError(response.data.message || "Login failed");
    }
    
  } catch (err: any) {
    console.error("Login error:", err);

    if (err.response?.status === 401) {
      setError("Invalid password. Please try again.");
    } 
    else if (err.response?.status === 404) {
      setError("Admin not found. Please check your email.");
    }
    else if (err.response?.status === 400) {
      setError(err.response.data.message || "Invalid input data");
    }
    else if (err.response?.data?.message) {
      setError(err.response.data.message);
    }
    else if (err.request) {
      setError("Cannot connect to server. Please try again.");
    }
    else {
      setError("An error occurred. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-muted-foreground">Access your dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 rounded-xl"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:underline">
                Forgot password?
              </button>
            </div> */}

            {/* Login Button */}
            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</p>
            <p className="text-xs text-center">
              <span className="font-medium">Email:</span> admin@example.com
            </p>
            <p className="text-xs text-center">
              <span className="font-medium">Password:</span> admin123
            </p>
          </div> */}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">© {new Date().getFullYear()} Letsellr. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
