import { Loader2 } from "lucide-react";

/**
 * Full-page centered spinner used by every admin page while data is loading.
 * Drop-in replacement for the old per-page skeletons / plain text placeholders.
 */
const AdminLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <p className="text-sm font-medium tracking-wide animate-pulse">Loading…</p>
  </div>
);

export default AdminLoader;
