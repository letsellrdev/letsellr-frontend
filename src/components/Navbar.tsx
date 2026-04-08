import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { letsellr } from "@/db";
import { MessageSquare, Phone, PhoneCall } from "lucide-react";

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
  return (
    <>
      <nav className="fixed z-50 flex items-center top-0 w-full h-16 md:h-20 bg-white/70 backdrop-blur-lg  p-2 py-2 md:p-10 md:py-5 border-b">
        <div className="container w-full flex justify-between">
          <Link to={"/"}>
            <div className="flex items-center">
              <img src={"/favicon.ico"} className="w-10 h-10 object-scale-down" />
              <h1 className="text-2xl font-bold text-primary">Letsellr</h1>
            </div>
          </Link>
          <a
            href={`https://wa.me/91${letsellr?.contactNumber?.replace(/\s+/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </nav>
      <div className="relative h-16 md:h-20"></div>
    </>
  );
}
