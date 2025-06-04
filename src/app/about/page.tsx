
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-8 text-center">
          About Ozonxt
        </h1>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="space-y-6 text-lg text-foreground/80">
            <p>Welcome to Ozonxt, your trusted partner in advanced water purification solutions. We are dedicated to providing pure, safe, and healthy water for homes, businesses, and communities across India.</p>
            <p>Our mission is to leverage cutting-edge ozone technology and innovative engineering to deliver water purification systems that are effective, reliable, and environmentally friendly. We believe that access to clean water is a fundamental right, and we strive to make it a reality for everyone.</p>
          </div>
          <div className="relative h-72 md:h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://placehold.co/800x600.png"
              alt="Team working on water solutions"
              layout="fill"
              objectFit="cover"
              data-ai-hint="water lab"
            />
          </div>
        </div>

        <div className="bg-muted/50 dark:bg-muted/20 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-headline font-semibold text-accent mb-6 text-center">Our Commitment</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
                {/* Placeholder for an icon, e.g., CheckCircle */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 className="text-xl font-headline font-medium text-foreground">Quality</h3>
              <p className="text-foreground/70">Delivering the highest quality products built to last and perform.</p>
            </div>
            <div className="space-y-2">
               <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
                {/* Placeholder for an icon, e.g., Zap */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 className="text-xl font-headline font-medium text-foreground">Innovation</h3>
              <p className="text-foreground/70">Continuously researching and developing new solutions for better water.</p>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
                {/* Placeholder for an icon, e.g., Users */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-headline font-medium text-foreground">Customer Satisfaction</h3>
              <p className="text-foreground/70">Ensuring our customers receive exceptional service and support.</p>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-lg text-foreground/80">
           <p>Thank you for choosing Ozonxt. Pure Water, Pure Life.</p>
        </div>
      </div>
    </div>
  );
}
