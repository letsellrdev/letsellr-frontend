import { letsellr } from "@/db";
import { Mail, Phone, MapPin, Instagram, Youtube, MessageCircleMore, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  title?: string;
  value?: string;
  description?: string;
  count?: string;
}

export const Footer = ({ categories }: { categories: Category[] }) => {
  return (
    <footer className="relative bg-[hsl(174,30%,97%)] text-foreground overflow-hidden border-t border-primary/10">



      {/* Top gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main footer content */}
      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-16 pb-0">
        <div className="max-w-7xl mx-auto">

          {/* Top row: Brand + columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 pb-14 border-b border-primary/10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-5">
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">
                Connecting you with the perfect accommodation for your work or study needs.
              </p>

              {/* Social icons */}
              <div className="flex gap-3 pt-1">
                <a
                  href="https://instagram.com/letsellr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:border-primary text-muted-foreground hover:text-white transition-all duration-200"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/91${letsellr.contactNumber.replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:border-primary text-muted-foreground hover:text-white transition-all duration-200"
                >
                  <MessageCircleMore className="h-4 w-4" />
                </a>
                <a
                  href="https://youtube.com/@letsellr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary hover:border-primary text-muted-foreground hover:text-white transition-all duration-200"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-semibold text-primary/80 uppercase tracking-widest mb-5">Categories</h3>
              <ul className="space-y-3">
                {categories.map((category, i) => {
                  const catId = category?._id || category?.value || String(i);
                  const catName = category?.name || category?.title || "";
                  return (
                    <li key={catId}>
                      <Link
                        to={`/search?category=${encodeURIComponent(catId)}`}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                      >
                        {catName}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold text-primary/80 uppercase tracking-widest mb-5">Explore</h3>
              <ul className="space-y-3">
                {[
                  { label: "Browse Properties", to: "/search" },
                  { label: "All Locations", to: "/search?location=all" },
                  { label: "Student Housing", to: "/search?propertyType=student" },
                  { label: "Working Spaces", to: "/search?propertyType=working" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-primary/80 uppercase tracking-widest mb-5">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/70" />
                  <span>letsellr.dev@gmail.com</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/70" />
                  <span>+91 {letsellr.contactNumber}</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/70" />
                  <span>Calicut, Kerala, India</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


      {/* ── Big faded wordmark ── */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none mt-4 md:mt-[-0.5rem]">
        {/* Top fade mask */}
        <div className="absolute top-0 left-0 right-0 h-10 sm:h-16 bg-gradient-to-b from-[hsl(174,30%,97%)] to-transparent z-10" />
        {/* Bottom fade mask */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-[hsl(174,30%,97%)] to-transparent z-10" />
        {/* Side fades - narrower on mobile to show more text */}
        <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[hsl(174,30%,97%)] to-transparent z-10" />
        <div className="absolute top-0 right-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[hsl(174,30%,97%)] to-transparent z-10" />

        <p
          className="text-center font-black tracking-tighter leading-none text-primary"
          style={{
            fontSize: "clamp(3.5rem, 18vw, 16rem)",
            opacity: 0.1,
            lineHeight: 0.85,
            paddingBottom: "0.1em",
          }}
        >
          Letsellr
        </p>
      </div>
    </footer>
  );
};
