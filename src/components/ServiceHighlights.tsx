
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Sparkles, Wrench } from "lucide-react";

const services = [
  {
    icon: Droplets,
    title: "Advanced RO Purification",
    description: "State-of-the-art RO systems removing impurities for crystal clear, safe drinking water.",
  },
  {
    icon: Sparkles,
    title: "Alkaline Water Systems",
    description: "Enhance your water with beneficial minerals and optimal pH balance for better hydration.",
  },
  {
    icon: Wrench,
    title: "Expert Installation & Maintenance",
    description: "Professional setup and reliable support to ensure your system performs at its best.",
  },
];

export default function ServiceHighlights() {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl font-headline font-bold text-primary mb-3">
            Our Core Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Delivering comprehensive water purification solutions tailored to your needs.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-border flex flex-col">
              <CardHeader className="items-center pt-6 pb-4">
                <div className="p-4 bg-primary/10 rounded-full inline-flex text-primary mb-4">
                  <service.icon size={32} strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl font-headline text-foreground">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
