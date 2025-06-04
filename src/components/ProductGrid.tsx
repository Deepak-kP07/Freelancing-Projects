import { PRODUCTS, type Product } from '@/lib/constants';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
}

export default function ProductGrid({ products, title = "Our Products", description = "Discover our range of innovative water solutions." }: ProductGridProps) {
  if (!products.length) {
    return <p className="text-center text-muted-foreground py-8">No products available at the moment.</p>;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-headline font-semibold text-center mb-2 text-primary">{title}</h3>
        <p className="text-center text-foreground/70 mb-10">{description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
