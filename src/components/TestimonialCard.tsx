
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
    <Card className="h-full flex flex-col transition-all duration-300 shadow-lg hover:shadow-xl p-2 border-border">
      <CardHeader className="flex flex-row items-center gap-4 pb-3 pt-4 px-4">
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={testimonial.avatarUrl} alt={testimonial.author} data-ai-hint={testimonial.dataAiHint} />
          <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-md font-headline font-semibold">{testimonial.author}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{testimonial.role}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow relative pt-2 px-4 pb-4">
        <Quote className="absolute top-0 left-0 h-10 w-10 text-primary/10 transform -translate-x-3 -translate-y-3" />
        <p className="text-foreground/85 italic leading-relaxed text-sm relative z-10">"{testimonial.text}"</p>
      </CardContent>
    </Card>
  );
}

    