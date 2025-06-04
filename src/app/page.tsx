import HeroSection from '@/components/HeroSection';
import ProductGrid from '@/components/ProductGrid';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { PRODUCTS } from '@/lib/constants';

export default function HomePage() {
  // For demo, show first 4 products as featured.
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroSection />
      <ProductGrid products={featuredProducts} title="Featured Products" description="Check out our best-selling water purification solutions."/>
      <TestimonialCarousel />
    </div>
  );
}
