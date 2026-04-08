import { letsellr } from "@/db";
import { Mail, Phone, MapPin, Instagram, MessageCircle, Youtube, MessageCircleMore } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  title?: string;   // legacy compat
  value?: string;   // legacy compat
  description?: string;
  count?: string;
}

export const Footer = ({ categories }: { categories: Category[] }) => {
  return (
    <footer className="bg-card border-t border-border relative">
      <div className="w-full px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 md:gap-12">
            {/* Brand */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Link to={"/"}>
                  <div className="flex items-center">
                    <img src={"/favicon.ico"} className="w-10 h-10 object-scale-down" />
                    <h1 className="text-2xl font-bold text-primary">Letsellr</h1>
                  </div>
                </Link>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connecting you with the perfect accommodation for your work or study needs.
              </p>
            </div>

            {/* Quick Links */}
            {/* <div>
                            <h3 className="font-semibold text-foreground mb-5">Quick Links</h3>
                            <ul className="space-y-3.5">
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        List Your Property
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div> */}

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-foreground mb-5">Categories</h3>
              <ul className="space-y-3.5">
                {categories.map((category, i) => {
                  // Support both API shape (_id/name) and legacy shape (value/title)
                  const catId = category?._id || category?.value || String(i);
                  const catName = category?.name || category?.title || "";
                  const searchUrl = `/search?category=${encodeURIComponent(catId)}`;
                  return (
                    <li key={catId}>
                      <Link to={searchUrl} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                        {catName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-foreground mb-5">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>letsellr.dev@gmail.com</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>+91 {letsellr.contactNumber}</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>Calicut, Kerala, India</span>
                </li>
              </ul>
            </div>
            {/* Social Media */}
            <div>
              <h3 className="font-semibold text-foreground mb-5">Follow Us</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/letsellr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full border hover:text-white hover:bg-black transition-colors duration-300"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={`https://wa.me/91${letsellr.contactNumber.replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full border hover:text-white hover:bg-black transition-colors duration-300"
                  aria-label="Contact us on WhatsApp"
                >
                  <MessageCircleMore className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@letsellr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full border hover:text-white hover:bg-black transition-colors duration-300"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Letsellr. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
