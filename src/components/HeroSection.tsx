
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-background"> {/* Simplified background */}
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground mb-6 leading-tight">
            Pure Water, <span className="text-primary">Pure Life</span> with Ozonxt
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
            Your trusted partner for advanced water purification systems and services. Experience the difference with our cutting-edge ozone technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/products" passHref>
              <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                Explore Our Products <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/services" passHref>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Book a Service
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-72 md:h-96 lg:h-[500px] rounded-xl overflow-hidden shadow-2xl group">
           <Image
            src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750161199/herosection_img_lkwyy8.jpg"
            alt="Clean water stream with Ozonxt product"
            fill={true}
            data-ai-hint="water purifier lifestyle"
            className="object-cover transform group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div> {/* Subtle gradient overlay */}
        </div>
      </div>
    </section>
  );
}

    