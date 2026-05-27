import { 
  Wifi, Coffee, WashingMachine, Shirt, Camera, 
  Droplet, AirVent, ParkingCircle, CookingPot, 
  GraduationCap, CheckCircle , Bath,
  Flame, Refrigerator, ShieldCheck, DoorClosed
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMappings = [
  { keywords: ["wifi", "wi-fi"], icon: Wifi },
  { keywords: ["kettle", "coffee"], icon: Coffee },
  { keywords: ["washing machine", "laundry"], icon: WashingMachine },
  { keywords: ["iron", "ironbox", "iron box"], icon: Shirt },
  { keywords: ["24 hours cctv", "cctv", "camera"], icon: Camera },
  { keywords: ["24 hours water", "water", "water purifier"], icon: Droplet },
  { keywords: ["ac", "air conditioner", "air conditioning"], icon: AirVent },
  { keywords: ["parking", "car parking", "bike parking"], icon: ParkingCircle },
  { keywords: ["kitchen", "cooking", "bike parking"], icon: CookingPot },
  { keywords: ["study", "study-room"], icon: GraduationCap },
  { keywords: ["bath", "bathroom"], icon: Bath },
  { keywords: ["gas", "stove", "gas and stove"], icon: Flame },
  { keywords: ["fridge", "refrigerator"], icon: Refrigerator },
  { keywords: ["wardrobe", "cupboard", "closet"], icon: DoorClosed },
  { keywords: ["security", "guard"], icon: ShieldCheck },
];

const getAmenityIcon = (amenity: string) => {
  const normalized = amenity.toLowerCase().trim();
  for (const mapping of iconMappings) {
    if (mapping.keywords.some((k) => normalized.includes(k))) {
      return mapping.icon;
    }
  }
  return CheckCircle;
};

interface AmenitySectionProps {
  amenities: string;
}

export function AmenitySection({ amenities }: AmenitySectionProps) {
  const amenityList = amenities
    ?.split(",")
    ?.filter((e) => e?.trim())
    ?.map(e => e.trim()) || [];

  if (amenityList.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenityList.map((amenity, i) => {
          const Icon = getAmenityIcon(amenity);
          return (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 hover:bg-primary/[0.02] transition-all duration-300 group"
            >
              <div className="p-2.5 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                {amenity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
