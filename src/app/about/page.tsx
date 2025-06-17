
import Image from 'next/image';
import { CheckCircle, Zap, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
            About Ozonxt
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted partner in advanced water purification solutions, dedicated to delivering pure, safe, and healthy water across India.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">
          <div className="space-y-6 text-base md:text-lg text-foreground/90">
            <p>Welcome to Ozonxt! We are passionately committed to providing innovative and effective water purification technologies. Our mission is to ensure every home, business, and community has access to the highest quality water.</p>
            <p>We leverage cutting-edge ozone technology and state-of-the-art engineering to create systems that are not only powerful but also reliable and environmentally conscious. We firmly believe that clean water is a cornerstone of a healthy life, and we are dedicated to making this a reality for all.</p>
          </div>
          <div className="relative h-80 md:h-[450px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="https://res.cloudinary.com/dckm1rzyh/image/upload/v1750153579/Gemini_Generated_Image_kpthptkpthptkpth_u11jqk.png"
              alt="Ozonxt team collaborating on water purification technology"
              fill={true}
              className="object-cover"
              data-ai-hint="water lab team"
            />
          </div>
        </div>

        <div className="bg-card border border-border p-8 md:p-12 rounded-xl shadow-lg">
          <h2 className="text-3xl font-headline font-semibold text-accent mb-8 md:mb-10 text-center">Our Core Commitments</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { icon: CheckCircle, title: "Uncompromising Quality", description: "Delivering robust, high-performance products engineered for durability and excellence." },
              { icon: Zap, title: "Continuous Innovation", description: "Relentlessly researching and developing next-generation solutions for superior water purity." },
              { icon: Users, title: "Customer Dedication", description: "Ensuring every customer receives exceptional service, support, and satisfaction." },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg transition-all hover:bg-muted/50">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-full bg-primary/10 text-primary">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-headline font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 md:mt-24 text-center">
           <p className="text-xl text-muted-foreground">Thank you for choosing Ozonxt.</p>
           <p className="text-2xl font-semibold text-primary mt-1">Pure Water, Pure Life.</p>
        </div>
      </div>
    </div>
  );
}
