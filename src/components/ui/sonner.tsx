import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl md:group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-emerald-50/90 group-[.toaster]:text-emerald-800 group-[.toaster]:border-emerald-200 group-[.toaster]:shadow-emerald-500/5 group-[.toaster]:backdrop-blur-md",
          error:
            "group-[.toaster]:bg-red-50/90 group-[.toaster]:text-red-800 group-[.toaster]:border-red-200 group-[.toaster]:shadow-red-500/5 group-[.toaster]:backdrop-blur-md",
          warning:
            "group-[.toaster]:bg-amber-50/90 group-[.toaster]:text-amber-800 group-[.toaster]:border-amber-200 group-[.toaster]:shadow-amber-500/5 group-[.toaster]:backdrop-blur-md",
          info:
            "group-[.toaster]:bg-sky-50/90 group-[.toaster]:text-sky-800 group-[.toaster]:border-sky-200 group-[.toaster]:shadow-sky-500/5 group-[.toaster]:backdrop-blur-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
