
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/lib/constants';
import { useDispatch } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';

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

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 md:h-56">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill={true}
            data-ai-hint={product.dataAiHint}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-1 truncate" title={product.name}>{product.name}</CardTitle>
        <CardDescription className="text-sm text-foreground/70 mb-2 line-clamp-2">{product.description}</CardDescription>
        <p className="text-lg font-semibold text-primary">&#x20B9;{product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
