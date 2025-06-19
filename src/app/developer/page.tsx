
import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Instagram, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DeveloperPage() {
  const developer = {
    name: "Deepak KP",
    title: "Full Stack Developer & AI Enthusiast",
    bio: "I’m a web developer focused on turning real business needs into simple, effective digital solutions. This site is one of my recent works—built to support service-based businesses with clean design, smooth navigation, and user-friendly features. Currently gaining hands-on experience with modern tech stacks (React, Firebase, Node.js) and working at ZopKit—an AI-powered business ecosystem SaaS provider—where I learn how tech can drive business growth. Available for freelance projects, website builds, or any business inquiries—let’s work together to bring your ideas online.",
    imageUrl: "https://res.cloudinary.com/dckm1rzyh/image/upload/v1750168169/WhatsApp_Image_2024-12-06_at_23.32.31_6c62872f_hcl6i6.jpg", // Replace with your actual image URL
    dataAiHint: "developer portrait",
    socialLinks: [
      { name: "GitHub", url: "https://github.com/Deepak-kP07", icon: Github },
      { name: "LinkedIn", url: "https://www.linkedin.com/in/deepak-kp-559a85282/", icon: Linkedin }, // Replace with your LinkedIn
      { name: "Instagram", url: "https://www.instagram.com/deepak_kp_7/", icon: Instagram}, // Replace with your Twitter
      // { name: "Portfolio", url: "https://your-portfolio.com", icon: Globe }, // Replace with your portfolio
    ],
    contactEmail: "deepakperumal09@gmail.com",
  };

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 p-8 text-center">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary mb-6">
              <Image
                src={developer.imageUrl}
                alt={developer.name}
                fill={true}
                className="object-cover"
                data-ai-hint={developer.dataAiHint}
              />
            </div>
            <CardTitle className="text-3xl font-headline font-bold text-primary">{developer.name}</CardTitle>
            <p className="text-lg text-accent font-medium">{developer.title}</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-center text-foreground/80 text-lg">
              {developer.bio}
            </p>
            
            <div className="text-center">
              <h3 className="text-xl font-headline font-semibold text-primary mb-4">Connect with me</h3>
              <div className="flex justify-center space-x-4 mb-6">
                {developer.socialLinks.map((link) => (
                  <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" passHref>
                    <Button variant="outline" size="icon" aria-label={link.name} className="rounded-full">
                      <link.icon size={20} />
                    </Button>
                  </Link>
                ))}
              </div>
               <Link href={`mailto:${developer.contactEmail}`} passHref>
                <Button>
                  <Mail size={18} className="mr-2" /> Contact Me
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
