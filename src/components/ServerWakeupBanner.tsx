import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ServerCrash, CheckCircle2 } from "lucide-react";

type ServerStatus = "checking" | "online" | "slow" | "error";

const ALIVE_URL = `${import.meta.env.VITE_API_URL?.replace("/letsellr", "") || "http://localhost:4500"}/alive`;
// Give Render's free tier up to 60 s to cold-start
const TIMEOUT_MS = 60_000;
// If no response after this many ms, show "Taking longer than expected…"
const SLOW_THRESHOLD_MS = 4_000;

const ServerWakeupBanner = () => {
  const [status, setStatus] = useState<ServerStatus>("checking");
  const [visible, setVisible] = useState(false); // only show banner if slow/error

  useEffect(() => {
    let cancelled = false;
    let slowTimer: ReturnType<typeof setTimeout>;

    const check = async () => {
      // After SLOW_THRESHOLD_MS with no response → show banner
      slowTimer = setTimeout(() => {
        if (!cancelled) {
          setStatus("slow");
          setVisible(true);
        }
      }, SLOW_THRESHOLD_MS);

      try {
        await axios.get(ALIVE_URL, { timeout: TIMEOUT_MS });
        if (!cancelled) {
          clearTimeout(slowTimer);
          setStatus("online");
          // If we were showing the banner, flash "online" briefly then hide
          setVisible((prev) => {
            if (prev) {
              setTimeout(() => setVisible(false), 2500);
              return true;
            }
            return false;
          });
        }
      } catch {
        if (!cancelled) {
          clearTimeout(slowTimer);
          setStatus("error");
          setVisible(true);
        }
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  if (!visible) return null;

  const config: Record<
    "slow" | "online" | "error",
    { bg: string; border: string; icon: React.ReactNode; text: string; sub: string }
  > = {
    slow: {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      icon: <Loader2 className="h-4 w-4 text-amber-600 animate-spin flex-shrink-0" />,
      text: "Server is warming up…",
      sub: "This usually takes 20–50 seconds on first load. Hang tight!",
    },
    online: {
      bg: "bg-green-50 dark:bg-green-950/40",
      border: "border-green-200 dark:border-green-800",
      icon: <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />,
      text: "Server is ready!",
      sub: "All systems are online. Loading your data…",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-200 dark:border-red-800",
      icon: <ServerCrash className="h-4 w-4 text-red-600 flex-shrink-0" />,
      text: "Server unreachable",
      sub: "Could not connect to the backend. Please try refreshing the page.",
    },
  };

  const c = config[status === "checking" ? "slow" : status];

  return (
    <div
      className={`w-full border-b ${c.bg} ${c.border} px-4 py-2.5 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top duration-300`}
    >
      {c.icon}
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-foreground">{c.text}</span>
        <span className="text-muted-foreground ml-2 hidden sm:inline">{c.sub}</span>
      </div>
    </div>
  );
};

export default ServerWakeupBanner;
