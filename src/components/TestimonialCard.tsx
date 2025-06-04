import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '@/lib/constants';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={testimonial.avatarUrl} alt={testimonial.author} data-ai-hint={testimonial.dataAiHint} />
          <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-headline">{testimonial.author}</CardTitle>
          <CardDescription className="text-sm">{testimonial.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow relative pt-2">
        <Quote className="absolute top-0 left-0 h-8 w-8 text-primary/20 transform -translate-x-2 -translate-y-2" />
        <p className="text-foreground/80 italic leading-relaxed text-sm">"{testimonial.text}"</p>
      </CardContent>
    </Card>
  );
}
