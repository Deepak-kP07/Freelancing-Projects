
'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { useState, useEffect } from 'react';

export default function CartIcon() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [itemCount, setItemCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setItemCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [cartItems, isClient]);

  return (
    <Link href="/cart" passHref>
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="h-5 w-5 text-primary" />
        {isClient && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
