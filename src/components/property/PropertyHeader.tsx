import { useState } from "react";
import { Share2, Heart, Star, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PropertyHeaderProps {
  product: any;
  averageRating: string;
  reviewCount: number;
}

export function PropertyHeader({ product, averageRating, reviewCount }: PropertyHeaderProps) {
  const [copied, setCopied] = useState(false);
  const locationTitle = typeof product?.location === "string" 
    ? product.location 
    : product?.location?.title || "Calicut";

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {product?.propertyCode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Code: {product.propertyCode}
              </span>
            )}
            {product?.propertyTypeCategory && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {typeof product.propertyTypeCategory === "string"
                  ? product.propertyTypeCategory
                  : product.propertyTypeCategory.name}
              </span>
            )}
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
              product.vacancyCount > 0
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}>
              {product.vacancyCount > 0 ? `${product.vacancyCount} Vacancy` : "Full"}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            {product?.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-foreground">{averageRating}</span>
              <span>({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4" />
              <span>{locationTitle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full gap-2 transition-all duration-300 min-w-[85px]",
              copied 
                ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-600" 
                : "border-primary/20 hover:bg-primary/5 hover:border-primary/40 active:scale-95 text-muted-foreground hover:text-primary"
            )}
            onClick={() => {
              if (copied) return;
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              import("sonner").then(({ toast }) => {
                toast.success("Link copied!", {
                  duration: 2000,
                });
              });
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}