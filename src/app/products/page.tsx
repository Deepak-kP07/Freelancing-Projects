import ProductGrid from '@/components/ProductGrid';
import { PRODUCTS } from '@/lib/constants';

export default function ProductsPage() {
  return (
    <div>
      <ProductGrid products={PRODUCTS} title="All Our Products" description="Browse our complete collection of Ozonxt Aqua Hub solutions." />
    </div>
  );
}
