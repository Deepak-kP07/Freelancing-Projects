
'use client'; // Add 'use client' if useMemo is used for client-side optimization

import React from 'react'; // Import React for useMemo
import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { PRODUCTS, type Product } from '@/lib/constants'; // Import Product type if needed by useMemo

export default function HomePage() {
  // For demo, show first 4 products as featured.
  // Memoize featuredProducts to prevent re-creation on every render
  const featuredProducts = React.useMemo(() => {
    return PRODUCTS.slice(0, 4);
  }, []); // Empty dependency array means this runs once

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroSection />
      <ProductGrid products={featuredProducts} title="Featured Products" description="Check out our best-selling water purification solutions."/>
      <TestimonialCarousel />
    </div>
  );
}
