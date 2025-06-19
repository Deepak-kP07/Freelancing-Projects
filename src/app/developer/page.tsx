
import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Instagram, Mail, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DeveloperPage() {
  const developer = {
    name: "Deepak KP",
    title: "Full Stack Developer & AI Enthusiast",
    bio: "Passionate about building innovative solutions with modern web technologies and exploring the frontiers of Artificial Intelligence. Let's connect and build something amazing!",
    imageUrl: "https://res.cloudinary.com/dckm1rzyh/image/upload/v1750332421/Screenshot_2024-11-07-11-53-28-108_com.miui.gallery_r4z0cn.png ", // Replace with your actual image URL
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
