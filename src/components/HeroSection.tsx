import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl shadow-lg overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-6 leading-tight">
            Pure Water, <span className="text-accent">Pure Life</span> with Ozonxt Aqua Hub
          </h2>
          <p className="text-lg text-foreground/80 mb-8">
            Your trusted partner for advanced water purification systems and services. Experience the difference with our cutting-edge ozone technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/products" passHref>
              <Button size="lg" className="w-full sm:w-auto">Explore Products</Button>
            </Link>
            <Link href="/services" passHref>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">Book a Service</Button>
            </Link>
          </div>
        </div>
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
           <Image 
            src="https://placehold.co/800x600.png" 
            alt="Clean water splash" 
            layout="fill"
            objectFit="cover"
            data-ai-hint="water splash"
            className="transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </section>
  );
}
