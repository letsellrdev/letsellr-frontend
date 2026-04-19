import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import BackgroundDotPattern from "./BackgroundDotPattern";
import { useEffect, useState } from "react";
import instance from "@/lib/axios";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  initials: string;
}

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        console.log("Fetching testimonials...");
        const res = await instance.get("/testimonial");
        console.log("Testimonials response:", res.data);
        if (res.data.success) {
          console.log(`Setting ${res.data.data.length} testimonials`);
          setTestimonials(res.data.data);
        } else {
          console.warn("Testimonials success was false");
        }
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      }
    };
    fetchTestimonials();
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-background relative border-y">
      <div className="absolute inset-0 z-0">
        <BackgroundDotPattern />
      </div>
      <div className="relative w-full px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 space-y-4 px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              Real stories from people who found their perfect home through our
              platform
            </p>
          </div>

          <div 
            className="relative overflow-hidden marquee-mask py-4 cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <div 
              className="animate-marquee flex gap-6 md:gap-8"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {[...testimonials, ...testimonials].map((testimonial, idx) => (
                <Card
                  key={idx}
                  className="w-[320px] md:w-[400px] flex-shrink-0 p-6 md:p-8 border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-6">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-accent text-accent"
                        />
                      ))}
                    </div>

                    <p className="text-foreground leading-relaxed italic line-clamp-4">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                      <Avatar className="h-12 w-12 bg-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};