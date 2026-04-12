import { Check, Info, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  product: any;
  selectedPrice: any;
  setSelectedPrice: (price: any) => void;
  selectedVacancy: string;
  setSelectedVacancy: (vacancy: string) => void;
  /** WhatsApp message builder — passed from the page so it has context */
  getWhatsAppMessage: () => string;
}

export function BookingCard({
  product,
  selectedPrice,
  setSelectedPrice,
  selectedVacancy,
  setSelectedVacancy,
  getWhatsAppMessage,
}: BookingCardProps) {
  const startingPrice = product?.price?.[0]?.amount || 0;
  const contactPhone = product?.contactNumber || "";

  const hasOptions =
    (product?.price?.length ?? 0) > 0 ||
    (product?.vacancies?.length ?? 0) > 0;

  // subtitle for the single accordion trigger
  const triggerSubtitle = (() => {
    const parts: string[] = [];
    if (selectedPrice) parts.push(`${selectedPrice.type} — ₹${selectedPrice.amount}`);
    if (selectedVacancy) parts.push(selectedVacancy);
    return parts.length > 0 ? parts.join(" · ") : "Select your plan & room type";
  })();

  return (
    <div
      className={cn(
        "sticky top-28 w-full bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300",
        "p-6 flex flex-col gap-6"
      )}
    >
      {/* ── Price Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Starting from
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-primary">₹{startingPrice}</span>
          <span className="text-muted-foreground font-medium">/ month</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ── Single Accordion for Pricing + Availability ──────────────── */}
      {hasOptions && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="options" className="border-none">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-bold text-foreground">
                  Pricing &amp; Availability
                </span>
                <span className="text-xs text-muted-foreground">{triggerSubtitle}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="flex flex-col gap-5 pt-2 pb-2">

              {/* Pricing Options */}
              {product?.price?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    Select Plan
                  </p>
                  {product.price.map((option: any, i: number) => {
                    const isSelected =
                      selectedPrice?.type === option.type &&
                      selectedPrice?.amount === option.amount;

                    // find matching vacancy count for this option type (optional enhancement)
                    const matchingVacancy = product?.vacancies?.find(
                      (v: any) =>
                        v.type?.toLowerCase().includes(option.type?.toLowerCase()) ||
                        option.type?.toLowerCase().includes(v.type?.toLowerCase())
                    );

                    return (
                      <button
                        key={option._id || i}
                        onClick={() =>
                          setSelectedPrice({ type: option.type, amount: option.amount })
                        }
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? "bg-primary/5 border-primary"
                            : "bg-gray-50 border-transparent hover:border-gray-200"
                        )}
                      >
                        {/* Left: type + price */}
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                              isSelected ? "bg-primary" : "bg-gray-300"
                            )}
                          />
                          <div className="flex flex-col items-start">
                            <span
                              className={cn(
                                "text-xs font-bold uppercase",
                                isSelected ? "text-primary" : "text-gray-500"
                              )}
                            >
                              {option.type}
                            </span>
                            <span className="text-sm font-extrabold">
                              ₹{option.amount}
                            </span>
                          </div>
                        </div>

                        {/* Right: availability badge + check */}
                        <div className="flex items-center gap-2">
                          {matchingVacancy && (
                            <span
                              className={cn(
                                "text-[10px] font-black px-2 py-0.5 rounded-full",
                                matchingVacancy.count > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {matchingVacancy.count > 0
                                ? `${matchingVacancy.count} LEFT`
                                : "FULL"}
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <div className="space-y-4">
        {/* Selection Summary */}
        {(selectedPrice || selectedVacancy) && (
          <div className="p-3 bg-primary/[0.03] border border-primary/10 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Info className="w-3.5 h-3.5" />
              SUMMARY
            </div>
            <div className="text-xs text-muted-foreground pl-5">
              {selectedPrice && (
                <p>
                  • {selectedPrice.type} Plan (₹{selectedPrice.amount})
                </p>
              )}
              {selectedVacancy && <p>• {selectedVacancy} Room</p>}
            </div>
          </div>
        )}

        {/* WhatsApp Drawer — the only contact option */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full py-7 text-base rounded-2xl shadow-lg transition-all font-bold gap-3 hover:scale-[1.02] active:scale-[0.98] bg-[#25D366] hover:bg-[#1ebe5d] text-white">
              <MessageSquare className="w-5 h-5" />
              Chat on WhatsApp
            </Button>
          </DrawerTrigger>
          <DrawerContent className="pb-8">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader className="py-4">
                <DrawerTitle className="text-center text-base font-bold">
                  Contact via WhatsApp
                </DrawerTitle>
              </DrawerHeader>
              <div className="px-6 flex flex-col gap-3">
                {/* Selection recap before opening WhatsApp */}
                {(selectedPrice || selectedVacancy) && (
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-0.5">
                    <p className="font-bold text-gray-700">Your selection:</p>
                    {selectedPrice && (
                      <p>
                        · {selectedPrice.type} — ₹{selectedPrice.amount}/mo
                      </p>
                    )}
                    {selectedVacancy && <p>· {selectedVacancy} Room</p>}
                  </div>
                )}

                <a
                  href={
                    contactPhone
                      ? `https://wa.me/91${contactPhone.replace(/\s+/g, "")}?text=${getWhatsAppMessage()}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-sm text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open WhatsApp
                </a>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
