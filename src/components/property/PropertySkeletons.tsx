import { Star } from "lucide-react";

export function ImageGridSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="md:hidden mb-8">
        <div className="rounded-xl overflow-hidden shadow-lg h-80 bg-gray-200" />
      </div>
      <div className="hidden md:block mb-12">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[550px] rounded-2xl overflow-hidden">
          <div className="col-span-2 row-span-2 bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function DescriptionSkeleton() {
  return (
    <div className="border rounded-xl p-4 md:p-6 bg-white flex flex-col gap-3 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-48" />
      <div className="flex items-center gap-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function AmenitiesSkeleton() {
  return (
    <div className="rounded-xl border p-4 md:p-6 bg-white flex flex-col gap-3 animate-pulse">
      <div className="h-7 bg-gray-200 rounded w-56" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="p-1.5 bg-gray-200 rounded-md h-8 w-8" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="sticky top-24 rounded-xl border p-6 bg-white flex flex-col gap-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-40" />
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl w-full" />
        ))}
      </div>
      <div className="h-14 bg-gray-200 rounded-xl w-full mt-2" />
    </div>
  );
}
