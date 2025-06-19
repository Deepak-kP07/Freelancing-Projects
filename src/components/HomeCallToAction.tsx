
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function HomeCallToAction() {
  return (
    <section className="py-16 md:py-24 text-center bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-4">
          Ready for Pure, Healthy Water?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Take the next step towards better water quality. Explore our solutions or get in touch with our experts today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow" asChild>
            <Link href="/products">
              Explore Our Products <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            asChild
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
