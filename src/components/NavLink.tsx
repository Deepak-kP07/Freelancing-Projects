'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  children: ReactNode;
  onClick?: () => void;
};

export default function NavLink({ href, children, className, onClick, ...props }: NavLinkProps) {
  const pathname = usePathname();
  // Exact match for homepage, startsWith for other pages to handle potential sub-routes if any.
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        isActive
          ? "text-primary underline underline-offset-4"
          : "text-foreground/70 hover:text-primary",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}
