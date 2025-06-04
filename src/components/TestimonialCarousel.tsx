'use client';

import { useState, useEffect } from 'react';
import { TESTIMONIALS, type Testimonial } from '@/lib/constants';
import TestimonialCard from './TestimonialCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    setTestimonials(TESTIMONIALS);
  }, []);

  if (!testimonials.length) {
    return null; // Or a loading state
  }

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-headline font-semibold text-center mb-2 text-primary">
          What Our Clients Say
        </h3>
        <p className="text-center text-foreground/70 mb-10">
          Hear from satisfied customers who trust Ozonxt Aqua Hub.
        </p>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          {testimonials.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 bg-background/80 hover:bg-background rounded-full shadow-md"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 bg-background/80 hover:bg-background rounded-full shadow-md"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </Button>
            </>
          )}
        </div>
         <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
      </div>
    </section>
  );
}
