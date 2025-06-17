
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/constants';
import { useDispatch } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const handleAddToCart = () => {
    dispatch(addItem(product));
    toast({
      title: `${product.name} added to cart!`,
      description: "You can view your cart or continue shopping.",
      variant: 'default',
    });
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:shadow-xl"> {/* Slightly increased shadow on hover */}
      <CardHeader className="p-0 relative aspect-[4/3]"> {/* Changed aspect ratio for better product display */}
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill={true}
          data-ai-hint={product.dataAiHint}
          className="object-contain transition-transform duration-300 group-hover:scale-105 p-2" // Added p-2 for image padding
        />
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="h-3 w-3" /> {discountPercentage}% OFF
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="text-lg font-headline mb-1 group-hover:text-primary transition-colors line-clamp-1" title={product.name}>{product.name}</CardTitle> {/* Ensure title doesn't wrap too much */}
        <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-2 h-10">{product.description}</CardDescription>
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <p className="text-xl font-semibold text-primary">&#x20B9;{product.price.toFixed(0)}</p>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">&#x20B9;{product.originalPrice!.toFixed(0)}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-auto">
        <Button onClick={handleAddToCart} className="w-full" variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
