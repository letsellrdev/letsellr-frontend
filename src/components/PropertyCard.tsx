import { Badge } from "./ui/badge";
import { MapPin, Star } from "lucide-react";
import { cn, getImageSrc } from "@/lib/utils";

export interface Property {
  _id: string;
  title: string;
  description: string;
  images: (string | { url: string; alt?: string })[];
  category: {
    _id: string;
    name: string;
  };
  amenity: string;
  price: { amount: number; type: string }[];
  location: {
    _id: string;
    title: string;
    description?: string;
    googleMapUrl: string;
    importantLocation?: boolean;
  };
  priceOptions?: { price: number; description: string }[];
  rating?: number;
  contactNumber?: string;
  vacancyCount?: number;
  status?: string;
  basePrice?: number;
}

export default function PropertyCard(data: Property) {
  const isActive = data?.status ? data.status === "active" : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col fix-rounded-overflow">
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 shrink-0 fix-rounded-overflow">
        <img
          src={getImageSrc(data?.images?.[0])}
          alt={data?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status badge — top left */}
        {isActive !== null && (
          <div
            className={cn(
              "absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm",
              isActive
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            )}
          >
            {isActive ? "Active" : "Inactive"}
          </div>
        )}

        {/* Vacancy badge — bottom right */}
        {data?.vacancyCount !== undefined && (
          <div
            className={cn(
              "absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm",
              data.vacancyCount > 0
                ? "bg-black/60 text-white"
                : "bg-gray-700/70 text-gray-200"
            )}
          >
            {data.vacancyCount > 0
              ? `${data.vacancyCount} slot${data.vacancyCount > 1 ? "s" : ""} left`
              : "No slots left"}
          </div>
        )}

        {/* Category badge — bottom left */}
        {data?.category?.name && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-white/85 backdrop-blur-sm text-gray-700 shadow-sm">
            {data.category.name}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        {/* Title + Price row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-sm font-semibold text-gray-900 line-clamp-2 flex-1 leading-snug">
            {data?.title}
          </h3>
          {data?.price && data.price.length > 0 ? (
            <div className="text-right shrink-0">
              <p className="text-base sm:text-sm font-bold text-primary leading-tight">
                ₹{data.price[0].amount.toLocaleString()}
              </p>
              <p className="text-[11px] sm:text-[10px] text-gray-400 leading-none">per month</p>
            </div>
          ) : data?.basePrice ? (
            <div className="text-right shrink-0">
              <p className="text-base sm:text-sm font-bold text-primary leading-tight">
                ₹{data.basePrice.toLocaleString()}
              </p>
              <p className="text-[11px] sm:text-[10px] text-gray-400 leading-none">per month</p>
            </div>
          ) : null}
        </div>

        {/* Location */}
        {data?.location?.title && (
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="text-xs truncate">{data.location.title}</span>
          </div>
        )}

        {/* Amenity badges */}
        {data?.amenity && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.amenity
              .split(",")
              .filter((e) => e?.trim())
              .slice(0, 3)
              .map((value) => {
                const title = value.trim();
                return (
                  <Badge
                    variant="outline"
                    key={title}
                    className="text-[10px] px-2 py-0.5 rounded-full border-gray-200 text-gray-500 font-normal whitespace-nowrap"
                  >
                    {title}
                  </Badge>
                );
              })}
            {data.amenity.split(",").filter((e) => e?.trim()).length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 rounded-full border-gray-200 text-gray-400 font-normal"
              >
                +{data.amenity.split(",").filter((e) => e?.trim()).length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
