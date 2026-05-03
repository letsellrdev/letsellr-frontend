import { getImageSrc } from "@/lib/utils";

export default function ImageGrid({ images }: { images: (string | { url: string })[] }) {
  return (
    <>
      <div className="overflow-hidden sm:rounded-md">
        <div className="sm:grid sm:grid-cols-10 gap-2 h-[300px] w-full sm:h-[400px] md:h-[500px] lg:min-h-[600px]">
          <div className="col-span-10 sm:col-span-5 overflow-hidden h-full">
            <img
              src={getImageSrc(images?.[0]) || "/images/placeholder.svg"}
              alt=""
              className="rounded-md sm:rounded-none hover:opacity-80 duration-300 h-full w-full object-cover"
            />
          </div>
          <div className="col-span-5 overflow-hidden grid lg:grid-cols-2 gap-2">
            <img
              src={getImageSrc(images?.[1]) || "/images/placeholder.svg"}
              alt=""
              className="hover:opacity-80 duration-300 h-full object-cover hidden sm:flex md:col-span-2 lg:col-span-1"
            />
            <img
              src={getImageSrc(images?.[2]) || "/images/placeholder.svg"}
              alt=""
              className="hover:opacity-80 duration-300 h-full object-cover hidden sm:flex md:hidden lg:flex"
            />
            <div className="grid-cols-2 w-full col-span-2 gap-2 h-full md:grid hidden">
              <img src={getImageSrc(images?.[3]) || "/images/placeholder.svg"} alt="" className="hover:opacity-80 duration-300 h-full object-cover" />
              <img src={getImageSrc(images?.[4]) || "/images/placeholder.svg"} alt="" className="hover:opacity-80 duration-300 h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
