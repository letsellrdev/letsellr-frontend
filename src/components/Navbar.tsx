import { Link, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { letsellr } from "@/db";
import { MessageSquare, Phone, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";

function ContactComp() {
  return (
    <>
      <a
        href={`https://wa.me/91${letsellr?.contactNumber?.replace(/\s+/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md"
      >
        <MessageSquare className="w-5 h-5" />
        WhatsApp Chat
      </a>
      <a
        href={`tel:+91${letsellr?.contactNumber?.replace(/\s+/g, "")}`}
        className="flex items-center justify-center gap-3 w-full bg-primary/5 border border-primary/70 text-primary font-bold py-3 rounded-xl transition-all duration-200 shadow-md"
      >
        <Phone className="w-5 h-5" />
        Call Host Directly
      </a>
    </>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Only be transparent on the home page
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <>
      <nav
        className={`fixed z-50 top-0 w-full h-16 md:h-20 flex items-center px-5 md:px-10 transition-all duration-500 ${
          transparent
            ? "bg-transparent border-transparent"
            : "bg-white/60 backdrop-blur-2xl border-b border-white/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] supports-[backdrop-filter]:bg-white/40"
        }`}
      >
        <div className="container w-full flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/favicon.ico" className="w-8 h-8 object-scale-down" alt="Letsellr" />
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                transparent ? "text-white" : "text-primary"
              }`}
            >
              Letsellr
            </span>
          </Link>

          {/* Contact */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                  transparent
                    ? "border-white/40 text-white hover:bg-white/15 backdrop-blur-sm"
                    : "border-primary/30 text-primary hover:bg-primary hover:text-white"
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                Contact Us
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] md:max-w-[425px] rounded-3xl p-6">
              <DialogTitle className="text-2xl font-bold text-center mb-1">
                Contact Host
              </DialogTitle>
              <DialogDescription className="text-center mb-6">
                Connect with us for any inquiries or bookings.
              </DialogDescription>
              <div className="flex flex-col gap-4">
                <ContactComp />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Spacer — only on non-home pages where navbar is opaque */}
      {!isHome && <div className="h-16 md:h-20" />}
    </>
  );
}