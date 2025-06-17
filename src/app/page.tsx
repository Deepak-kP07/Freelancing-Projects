
'use client'; 

import React from 'react'; 
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { PRODUCTS, type Product } from '@/lib/constants'; 
import ServiceHighlights from '@/components/ServiceHighlights';
import HomeCallToAction from '@/components/HomeCallToAction';

export default function HomePage() {
  const featuredProducts = React.useMemo(() => {
    return PRODUCTS.slice(0, 4);
  }, []); 

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroSection />
      <ProductGrid products={featuredProducts} title="Featured Products" description="Check out our best-selling water purification solutions."/>
      <ServiceHighlights />
      <TestimonialCarousel />
      <HomeCallToAction />
    </div>
  );
}
