import { Skeleton } from "@/components/ui/skeleton";
import { CategoryCard, CategoryCardBig } from "@/components/CategoryCard";

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  propertyCount?: number;
  value?: string;
}

interface SkipperCardProps {
  categories: Category[];
  propertyType?: string;
  locationId?: string;
  isLoading?: boolean;
}

const SkipperCardSkeleton = () => {
  return (
    <div className="w-full">
      {/* Mobile Skeleton */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-3xl" />
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr] gap-3 lg:gap-4">
        <div className="md:row-span-2">
          <Skeleton className="h-full min-h-[400px] w-full rounded-3xl" />
        </div>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[240px] w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
};

const SkipperCard = ({
  categories,
  propertyType,
  locationId,
  isLoading,
}: SkipperCardProps) => {
  if (isLoading) {
    return <SkipperCardSkeleton />;
  }

  if (!categories || categories.length === 0) return null;

  // Limit to 5 categories for the bento layout
  const cards = categories.slice(0, 5);

  return (
    <div className="w-full">
      {/* 
          📱 Mobile: Vertical scrolling section
      */}
      <div className="grid grid-cols-1 md:hidden gap-4">
        {cards.map((category) => (
          <CategoryCard
            key={category._id}
            title={category.name}
            description={category.description}
            image={category.image}
            count={category.propertyCount?.toString() || "0"}
            propertyType={propertyType}
            locationId={locationId}
            value={category.value}
          />
        ))}
      </div>

      {/* 🖥️ Desktop: Premium Bento Grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr] gap-3 lg:gap-4 bento-section">
        {/* Hero slot — tall column, spans 2 rows in some layouts if needed */}
        {cards[0] && (
          <div className="md:row-span-2">
            <CategoryCardBig
              title={cards[0].name}
              description={cards[0].description}
              image={cards[0].image}
              count={cards[0].propertyCount?.toString() || "0"}
              propertyType={propertyType}
              locationId={locationId}
              value={cards[0].value}
            />
          </div>
        )}

        {/* Regular slots */}
        {cards.slice(1).map((category) => (
          <CategoryCard
            key={category._id}
            title={category.name}
            description={category.description}
            image={category.image}
            count={category.propertyCount?.toString() || "0"}
            propertyType={propertyType}
            locationId={locationId}
            value={category.value}
          />
        ))}
      </div>
    </div>
  );
};

export { SkipperCard };